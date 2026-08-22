import fs from "fs";
import path from "path";
import crypto from "crypto";
import process from "node:process";
import { Buffer } from "node:buffer";

const DB_PATH = path.resolve(process.cwd(), "db.json");

let dbData = null;

function loadDb() {
  if (!dbData) {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, "utf-8");
        dbData = JSON.parse(raw);
      } else {
        dbData = {};
      }
    } catch (err) {
      console.error("Error reading db.json:", err);
      dbData = {};
    }
  }
  return dbData;
}

function saveDb() {
  if (!dbData) return;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write to db.json (running in read-only or in-memory mode):", err.message);
  }
}

function getCollectionKey(collectionName) {
  const db = loadDb();
  if (db[collectionName]) return collectionName;
  // Try kebab-case vs snake_case aliases
  const snake = collectionName.replace(/-/g, "_");
  if (db[snake]) return snake;
  const kebab = collectionName.replace(/_/g, "-");
  if (db[kebab]) return kebab;
  return collectionName;
}

export function createApiMiddleware() {
  return (req, res, next) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    let pathname = url.pathname;

    // Normalize pathname for /api/v1, /api, /v1
    if (pathname.startsWith("/api/v1/")) {
      pathname = pathname.slice(7);
    } else if (pathname.startsWith("/v1/")) {
      pathname = pathname.slice(3);
    } else if (pathname.startsWith("/api/")) {
      pathname = pathname.slice(4);
    } else if (pathname === "/api") {
      pathname = "/";
    }

    if (pathname === "/health") {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) {
      return next();
    }

    const collectionRaw = segments[0];
    const targetId = segments[1];
    const action = segments[2];
    const db = loadDb();

    // Ensure archived_items array exists
    if (!Array.isArray(db.archived_items)) {
      db.archived_items = [];
    }

    // Helper to read body if needed
    const readBody = () => {
      if (req.body && typeof req.body === "object") {
        return Promise.resolve(req.body);
      }
      return new Promise((resolve) => {
        let raw = "";
        req.on("data", (chunk) => {
          raw += chunk;
        });
        req.on("end", () => {
          try {
            resolve(raw ? JSON.parse(raw) : {});
          } catch {
            resolve({});
          }
        });
      });
    };

    const method = req.method.toUpperCase();

    // Helper for remote backend proxying
    const remoteBackendUrl = (process.env.BACKEND_URL || "https://lanwan.seifeldeendev.com/api/v1").replace(/\/+$/, "");
    const forwardToRemote = async (subPath, reqMethod, reqBody) => {
      if (!remoteBackendUrl) return null;
      try {
        const fullUrl = `${remoteBackendUrl}${subPath.startsWith("/") ? subPath : `/${subPath}`}`;
        console.log(`[PROXY] Forwarding to: ${fullUrl}`);
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };
        if (req.headers.authorization) {
          headers.Authorization = req.headers.authorization;
        }
        if (req.headers["x-csrf-token"]) {
          headers["X-CSRF-Token"] = req.headers["x-csrf-token"];
        }
        if (req.headers["x-branch-id"]) {
          headers["X-Branch-Id"] = req.headers["x-branch-id"];
        } else {
          headers["X-Branch-Id"] = "b1000000-1111-4111-8111-111111111111";
        }

        let payload = undefined;
        if (reqMethod === "POST" || reqMethod === "PUT" || reqMethod === "PATCH") {
          if (reqBody === undefined || reqBody === null || (typeof reqBody === "string" && reqBody.trim() === "")) {
            payload = "{}";
          } else if (typeof reqBody === "object") {
            payload = JSON.stringify(reqBody);
          } else {
            payload = String(reqBody);
          }
        }

        const resObj = await fetch(fullUrl, {
          method: reqMethod,
          headers,
          body: payload,
        });

        const json = await resObj.json().catch(() => null);
        if (resObj.status >= 500 || json?.error?.code === "APPLICATION_BOOTSTRAP_FAILED") {
          return null;
        }
        return { status: resObj.status, ok: resObj.ok, data: json };
      } catch {
        return null;
      }
    };


    // 0. AUTHENTICATION ENDPOINTS
    
    if (collectionRaw === "auth") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");

      // 1. POST /auth/login
      if (method === "POST" && (targetId === "login" || !targetId)) {
        readBody().then(async (body) => {
          const identifier = (body.email || body.username || body.identifier || "").trim();
          const identifierLower = identifier.toLowerCase();
          const password = body.password ? String(body.password).trim() : "";

          if (!identifier || !password) {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                success: false,
                error: {
                  code: "VALIDATION_ERROR",
                  message: "يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور",
                  fields: {},
                },
                requestId: crypto.randomUUID(),
              })
            );
          }

          // 1. Attempt remote backend authentication
          const remoteRes = await forwardToRemote("/auth/login", "POST", { email: identifier, password });
          if (remoteRes && remoteRes.ok && remoteRes.data?.success) {
            const remoteData = remoteRes.data.data || {};
            const token = remoteData.accessToken || remoteData.token || "jwt_remote";

            let detectedRole = "Owner";
            if (identifierLower.includes("sec")) {
              detectedRole = "Secretary";
            } else if (identifierLower.includes("doc")) {
              detectedRole = "Doctor";
            }

            const safeUser = {
              id: remoteData.userId || crypto.randomUUID(),
              username: identifier.includes("@") ? identifier.split("@")[0] : identifier,
              email: identifier.includes("@") ? identifier : `${identifier}@seigeldeendev.com`,
              full_name: detectedRole === "Owner" ? "مالك المركز (سيف الدين)" : (identifier.includes("@") ? identifier.split("@")[0] : identifier),
              role: detectedRole,
              status: "Active",
            };

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                data: {
                  token,
                  accessToken: token,
                  tokenType: remoteData.tokenType || "Bearer",
                  expiresIn: remoteData.expiresIn || 900,
                  userId: remoteData.userId,
                  sessionId: remoteData.sessionId,
                  user: safeUser,
                  ...safeUser,
                },
                meta: remoteRes.data.meta || [],
                requestId: remoteRes.data.requestId || crypto.randomUUID(),
              })
            );
          } else if (remoteRes && (remoteRes.status === 401 || remoteRes.status === 403 || remoteRes.status === 422)) {
            const users = Array.isArray(db.users) ? db.users : [];
            const localUser = users.find((u) => {
              const uEmail = (u.email || "").trim().toLowerCase();
              const uName = (u.username || "").trim().toLowerCase();
              return uEmail === identifierLower || uName === identifierLower;
            });

            if (!localUser || String(localUser.password).trim() !== password) {
              res.statusCode = remoteRes.status;
              return res.end(
                JSON.stringify(
                  remoteRes.data || {
                    success: false,
                    error: {
                      code: "INVALID_CREDENTIALS",
                      message: "اسم المستخدم أو كلمة المرور غير صحيحة",
                      fields: {},
                    },
                    requestId: crypto.randomUUID(),
                  }
                )
              );
            }
          }

          // 2. Local database fallback
          const users = Array.isArray(db.users) ? db.users : [];
          const user = users.find((u) => {
            const uEmail = (u.email || "").trim().toLowerCase();
            const uName = (u.username || "").trim().toLowerCase();
            return uEmail === identifierLower || uName === identifierLower;
          });

          if (!user || String(user.password).trim() !== password) {
            res.statusCode = 401;
            return res.end(
              JSON.stringify({
                success: false,
                error: {
                  code: "INVALID_CREDENTIALS",
                  message: "اسم المستخدم أو كلمة المرور غير صحيحة",
                  fields: {},
                },
                requestId: crypto.randomUUID(),
              })
            );
          }

          if (user.status && user.status.toLowerCase() !== "active") {
            res.statusCode = 403;
            return res.end(
              JSON.stringify({
                success: false,
                error: {
                  code: "USER_INACTIVE",
                  message: "هذا الحساب غير مفعّل، يرجى التواصل مع إدارة النظام",
                  fields: {},
                },
                requestId: crypto.randomUUID(),
              })
            );
          }

          const safeUser = { ...user };
          delete safeUser.password;

          const token =
            "jwt_" +
            Buffer.from(
              JSON.stringify({
                id: user.id,
                email: user.email,
                role: user.role,
                created: Date.now(),
              })
            ).toString("base64");

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              data: {
                token,
                user: safeUser,
                ...safeUser,
              },
              meta: {},
              requestId: crypto.randomUUID(),
            })
          );
        });
        return;
      }

      // 2. POST /auth/bootstrap-owner
      if (method === "POST" && targetId === "bootstrap-owner") {
        readBody().then(async (body) => {
          const email = (body.email || "owner@example.test").trim();
          const fullName = body.name || body.fullName || body.full_name || "Owner User";
          const password = body.password || "ExamplePassword123!";
          const centerName = body.centerName || body.center_name || "Clinic Center";
          const bootstrapSecret = body.bootstrapSecret || process.env.BOOTSTRAP_SECRET || centerName;

          const remotePayload = {
            fullName,
            email,
            password,
            bootstrapSecret,
            name: fullName,
            centerName,
          };

          const remoteRes = await forwardToRemote("/auth/bootstrap-owner", "POST", remotePayload);
          if (remoteRes && remoteRes.ok && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          if (!Array.isArray(db.users)) db.users = [];
          let existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (!existing) {
            existing = {
              id: crypto.randomUUID(),
              email,
              username: email.split("@")[0],
              full_name: fullName,
              role: "Owner",
              status: "Active",
              password,
              created_at: new Date().toISOString(),
            };
            db.users.unshift(existing);
          } else {
            existing.full_name = fullName;
            existing.password = password;
            existing.role = "Owner";
            existing.status = "Active";
          }

          if (!db.settings) db.settings = {};
          db.settings.centerName = centerName;
          if (Array.isArray(db.branches) && db.branches.length > 0) {
            db.branches[0].name = centerName;
          }
          saveDb();

          const safeUser = { ...existing };
          delete safeUser.password;
          const token =
            "jwt_" +
            Buffer.from(
              JSON.stringify({
                id: safeUser.id,
                email: safeUser.email,
                role: "Owner",
                created: Date.now(),
              })
            ).toString("base64");

          res.statusCode = 201;
          return res.end(
            JSON.stringify({
              success: true,
              data: {
                user: safeUser,
                token,
                accessToken: token,
                centerName,
                message: "تم تهيئة حساب المالك والمركز بنجاح",
              },
              requestId: crypto.randomUUID(),
            })
          );
        });
        return;
      }

      // 3. POST /auth/signup
      if (method === "POST" && targetId === "signup") {
        readBody().then(async (body) => {
          const remoteRes = await forwardToRemote("/auth/signup", "POST", body);
          if (remoteRes && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          const email = (body.email || "").trim();
          const password = String(body.password || "").trim();
          const fullName = body.fullName || body.full_name || body.name || "مستخدم جديد";
          const role = body.role || "Doctor";

          if (!email || !password) {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "البريد الإلكتروني وكلمة المرور مطلوبان" },
                requestId: crypto.randomUUID(),
              })
            );
          }

          if (!Array.isArray(db.users)) db.users = [];
          const newUser = {
            id: crypto.randomUUID(),
            email,
            username: body.username || email.split("@")[0],
            full_name: fullName,
            role,
            status: "Active",
            password,
            created_at: new Date().toISOString(),
          };
          db.users.push(newUser);
          saveDb(db);

          const safeUser = { ...newUser };
          delete safeUser.password;
          const token = "jwt_" + Buffer.from(JSON.stringify({ id: safeUser.id, role: safeUser.role })).toString("base64");

          res.statusCode = 201;
          return res.end(
            JSON.stringify({
              success: true,
              data: {
                user: safeUser,
                token,
                accessToken: token,
                message: "تم إنشاء الحساب بنجاح",
              },
              requestId: crypto.randomUUID(),
            })
          );
        });
        return;
      }

      // 4. GET /auth/me
      if (method === "GET" && targetId === "me") {
        (async () => {
          const remoteRes = await forwardToRemote("/auth/me", "GET");
          if (remoteRes && remoteRes.ok && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          const authHeader = req.headers.authorization || "";
          let foundUser = null;

          // Decode JWT if provided
          if (authHeader.startsWith("Bearer ")) {
            const tokenStr = authHeader.replace(/^Bearer\s+/i, "");
            try {
              if (tokenStr.startsWith("jwt_")) {
                const payload = JSON.parse(Buffer.from(tokenStr.slice(4), "base64").toString("utf-8"));
                const users = Array.isArray(db.users) ? db.users : [];
                foundUser = users.find((u) => u.id === payload.id || u.email === payload.email);
              } else if (tokenStr.includes(".")) {
                // Standard JWT (header.payload.signature)
                const payloadPart = tokenStr.split(".")[1];
                const decoded = JSON.parse(Buffer.from(payloadPart, "base64").toString("utf-8"));
                const userId = decoded.sub || decoded.id || decoded.userId;
                const userEmail = decoded.email;
                const users = Array.isArray(db.users) ? db.users : [];
                foundUser = users.find((u) => u.id === userId || (userEmail && u.email === userEmail));
                if (!foundUser && (userId || userEmail)) {
                  foundUser = {
                    id: userId || "4cbe5322-6be8-4f93-8a3a-b7ba531d6a47",
                    email: userEmail || "owner@seigeldeendev.com",
                    username: (userEmail || "owner").split("@")[0],
                    full_name: "سيف الدين (مالك المركز)",
                    role: "Owner",
                    status: "Active",
                  };
                }
              }
            } catch (err) {
              void err;
            }
          }

          if (!foundUser && Array.isArray(db.users) && db.users.length > 0) {
            foundUser = db.users[0];
          }

          if (!foundUser) {
            foundUser = {
              id: "4cbe5322-6be8-4f93-8a3a-b7ba531d6a47",
              email: "owner@seigeldeendev.com",
              username: "owner",
              full_name: "سيف الدين (مالك المركز)",
              role: "Owner",
              status: "Active",
            };
          }

          const safeUser = { ...foundUser };
          delete safeUser.password;

          const staffList = Array.isArray(db.staff) ? db.staff : [];
          const matchedStaff = staffList.find(
            (s) => s.id === safeUser.staff_id || s.email_normalized === safeUser.email || s.id === "422c61b1-25c0-4516-ad14-34b39bca027b"
          );

          const resolvedPhone = safeUser.phone || matchedStaff?.phone || "010907887";
          const resolvedFullName = safeUser.full_name || matchedStaff?.full_name || "Owner User";
          const resolvedStaffId = safeUser.staff_id || matchedStaff?.id || "422c61b1-25c0-4516-ad14-34b39bca027b";

          const structuredResponse = {
            success: true,
            data: {
              user: {
                userId: safeUser.id || "4cbe5322-6be8-4f93-8a3a-b7ba531d6a47",
                email: safeUser.email || "owner@seigeldeendev.com",
                status: (safeUser.status || "active").toLowerCase(),
                securityVersion: 7,
                phone: resolvedPhone,
                fullName: resolvedFullName,
              },
              staff: {
                staffId: resolvedStaffId,
                phone: resolvedPhone,
                fullName: resolvedFullName,
              },
              clinician: {
                clinicianId: null,
              },
              authorization: {
                roles: [String(safeUser.role || "owner").toLowerCase()],
                permissions: [
                  "appointments.manage", "appointments.read", "archive.manage", "archive.purge", "archive.read",
                  "archive.restore", "attachments.manage", "attachments.read", "attendance.manage", "attendance.read",
                  "attendance.self", "audit.read", "audit.sensitive.read", "branches.manage", "branches.read",
                  "cleanup.run", "clinical.amend", "clinical.sign", "clinicians.manage", "clinicians.read",
                  "devices.manage", "devices.read", "expenses.manage", "expenses.read", "finance.profit.read",
                  "financial_lookups.manage", "financial_lookups.read", "financial.summary.read",
                  "followups.attempts.write", "followups.manage", "followups.read", "invoices.manage",
                  "invoices.read", "maintenance.manage", "maintenance.read", "notifications.manage",
                  "notifications.read", "packages.manage", "packages.read", "patient_packages.read",
                  "patient_packages.reverse", "patient_packages.sell", "patients.read", "patients.write",
                  "payments.receive", "payments.refund", "payments.void", "refunds.reverse", "reports.read",
                  "roles.manage", "roles.read", "rooms.manage", "rooms.read", "services.manage", "services.read",
                  "sessions.read", "sessions.write", "settings.manage", "staff.manage", "staff.read",
                  "users.manage", "users.read"
                ],
                currentSessionId: "cf657823-0fea-43bd-a787-4aab7c147ac8",
              },
              branches: {
                homeBranchId: "00000000-0000-0000-0000-000000000101",
                selectedBranchId: null,
                accessible: [
                  {
                    id: "00000000-0000-0000-0000-000000000101",
                    code: "MAIN",
                    name: "Main Branch",
                    isHome: true,
                  }
                ],
              },
              ...safeUser,
              phone: resolvedPhone,
              full_name: resolvedFullName,
            },
            meta: [],
            requestId: crypto.randomUUID(),
          };

          res.statusCode = 200;
          return res.end(JSON.stringify(structuredResponse));
        })();
        return;
      }

      // 5. POST /auth/change-password
      if (method === "POST" && targetId === "change-password") {
        readBody().then(async (body) => {
          const remoteRes = await forwardToRemote("/auth/change-password", "POST", body);
          if (remoteRes && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          const currentPassword = body.currentPassword || body.oldPassword || "";
          const newPassword = body.newPassword || "";

          if (!currentPassword) {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "كلمة المرور الحالية مطلوبة" },
                requestId: crypto.randomUUID(),
              })
            );
          }

          if (!newPassword || newPassword.length < 6) {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                success: false,
                error: { code: "VALIDATION_ERROR", message: "كلمة المرور الجديدة يجب أن لا تقل عن 6 أحرف" },
                requestId: crypto.randomUUID(),
              })
            );
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              data: { message: "تم تغيير كلمة المرور بنجاح" },
              requestId: crypto.randomUUID(),
            })
          );
        });
        return;
      }

      // 6. POST /auth/forgot-password
      if (method === "POST" && targetId === "forgot-password") {
        readBody().then(async (body) => {
          const remoteRes = await forwardToRemote("/auth/forgot-password", "POST", body);
          if (remoteRes && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              data: { message: "تم إرسال تعليمات استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح" },
              requestId: crypto.randomUUID(),
            })
          );
        });
        return;
      }

      // 7. POST /auth/reset-password
      if (method === "POST" && targetId === "reset-password") {
        readBody().then(async (body) => {
          const remoteRes = await forwardToRemote("/auth/reset-password", "POST", body);
          if (remoteRes && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              data: { message: "تم إعادة تعيين كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن" },
              requestId: crypto.randomUUID(),
            })
          );
        });
        return;
      }

      // 8. POST /auth/refresh
      if (method === "POST" && targetId === "refresh") {
        (async () => {
          const remoteRes = await forwardToRemote("/auth/refresh", "POST", {});
          if (remoteRes && remoteRes.ok && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          const token =
            "jwt_" +
            Buffer.from(
              JSON.stringify({
                refreshed: true,
                created: Date.now(),
              })
            ).toString("base64");
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              data: { token, accessToken: token },
              requestId: crypto.randomUUID(),
            })
          );
        })();
        return;
      }

      // 9. POST /auth/logout
      if (method === "POST" && targetId === "logout") {
        readBody().then(async (body) => {
          const payload = body && typeof body === "object" ? body : {};
          const remoteRes = await forwardToRemote("/auth/logout", "POST", payload);
          if (remoteRes && remoteRes.ok && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              data: { message: "تم تسجيل الخروج بنجاح" },
              requestId: crypto.randomUUID(),
            })
          );
        });
        return;
      }

      // 10. POST /auth/logout-all
      if (method === "POST" && targetId === "logout-all") {
        (async () => {
          const remoteRes = await forwardToRemote("/auth/logout-all", "POST", {});
          if (remoteRes && remoteRes.ok && remoteRes.data) {
            res.statusCode = remoteRes.status;
            return res.end(JSON.stringify(remoteRes.data));
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              data: { message: "تم تسجيل الخروج من كافة الأجهزة بنجاح" },
              requestId: crypto.randomUUID(),
            })
          );
        })();
        return;
      }

      // 11 & 12. /auth/invitations
      if (targetId === "invitations") {
        const invId = segments[2];
        const invAction = segments[3];

        // POST /auth/invitations/:id/revoke
        if (method === "POST" && invId && invAction === "revoke") {
          (async () => {
            const remoteRes = await forwardToRemote(`/auth/invitations/${invId}/revoke`, "POST", {});
            if (remoteRes && remoteRes.data) {
              res.statusCode = remoteRes.status;
              return res.end(JSON.stringify(remoteRes.data));
            }

            if (Array.isArray(db.invitations)) {
              const inv = db.invitations.find((i) => i.id === invId);
              if (inv) inv.status = "Revoked";
              saveDb(db);
            }

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                data: { message: "تم إلغاء الدعوة بنجاح" },
                requestId: crypto.randomUUID(),
              })
            );
          })();
          return;
        }

        // POST /auth/invitations
        if (method === "POST" && !invId) {
          readBody().then(async (body) => {
            const remoteRes = await forwardToRemote("/auth/invitations", "POST", body);
            if (remoteRes && remoteRes.data) {
              res.statusCode = remoteRes.status;
              return res.end(JSON.stringify(remoteRes.data));
            }

            if (!Array.isArray(db.invitations)) db.invitations = [];
            const newInv = {
              id: crypto.randomUUID(),
              email: body.email || "",
              role: body.role || "Doctor",
              status: "Pending",
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
            };
            db.invitations.push(newInv);
            saveDb(db);

            res.statusCode = 201;
            return res.end(
              JSON.stringify({
                success: true,
                data: newInv,
                requestId: crypto.randomUUID(),
              })
            );
          });
          return;
        }

        // GET /auth/invitations
        if (method === "GET" && !invId) {
          (async () => {
            const remoteRes = await forwardToRemote("/auth/invitations", "GET");
            if (remoteRes && remoteRes.data) {
              res.statusCode = remoteRes.status;
              return res.end(JSON.stringify(remoteRes.data));
            }

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                data: Array.isArray(db.invitations) ? db.invitations : [],
                requestId: crypto.randomUUID(),
              })
            );
          })();
          return;
        }
      }

      // 13 & 14. /auth/sessions
      if (targetId === "sessions") {
        const sessId = segments[2];

        // DELETE /auth/sessions/:sessionId
        if (method === "DELETE" && sessId) {
          (async () => {
            if (!Array.isArray(db.revoked_sessions)) {
              db.revoked_sessions = [];
            }
            const normalizedId = String(sessId).trim().toLowerCase();
            if (!db.revoked_sessions.includes(normalizedId)) {
              db.revoked_sessions.push(normalizedId);
              saveDb();
            }

            const remoteRes = await forwardToRemote(`/auth/sessions/${sessId}`, "DELETE");
            if (remoteRes && remoteRes.ok && remoteRes.data) {
              res.statusCode = remoteRes.status;
              return res.end(JSON.stringify(remoteRes.data));
            }

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                data: { message: "تم إنهاء الجلسة بنجاح" },
                requestId: crypto.randomUUID(),
              })
            );
          })();
          return;
        }

        // GET /auth/sessions
        if (method === "GET" && !sessId) {
          (async () => {
            const revokedList = Array.isArray(db.revoked_sessions)
              ? db.revoked_sessions.map((s) => String(s).trim().toLowerCase())
              : [];
            const remoteRes = await forwardToRemote("/auth/sessions", "GET");
            if (remoteRes && remoteRes.data) {
              const rawSessions =
                remoteRes.data?.data?.sessions ||
                remoteRes.data?.sessions ||
                remoteRes.data?.data ||
                (Array.isArray(remoteRes.data) ? remoteRes.data : []);
              if (Array.isArray(rawSessions)) {
                const activeSessions = rawSessions.filter((s) => {
                  if (s.revoked) return false;
                  const sId = String(s.sessionId || s.id || "").trim().toLowerCase();
                  return !revokedList.includes(sId);
                });
                res.statusCode = remoteRes.status || 200;
                return res.end(
                  JSON.stringify({
                    success: true,
                    data: { sessions: activeSessions },
                    requestId: crypto.randomUUID(),
                  })
                );
              }
              res.statusCode = remoteRes.status;
              return res.end(JSON.stringify(remoteRes.data));
            }

            const currentSession = {
              sessionId: "sess_" + crypto.randomUUID().slice(0, 8),
              id: "sess_" + crypto.randomUUID().slice(0, 8),
              ip: req.socket?.remoteAddress || "127.0.0.1",
              userAgent: req.headers["user-agent"] || "Web Browser",
              current: true,
              isCurrent: true,
              revoked: false,
              compromised: false,
              createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
              expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
              lastActiveAt: new Date().toISOString(),
            };

            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                data: {
                  sessions: [currentSession],
                },
                requestId: crypto.randomUUID(),
              })
            );
          })();
          return;
        }
      }
    }

    // Map entity_type to corresponding db collection key
    const entityCollectionMap = {
      patient: "patients",
      appointment: "appointments",
      invoice: "invoices",
      expense: "expenses",
      package: "package-templates",
      service: "services",
      device: "devices",
      room: "rooms",
      maintenance: "maintenance",
      note: "internal_notes",
      followup: "follow_ups",
    };

    // Global Search Endpoint: GET /search?q=...
    if (method === "GET" && collectionRaw === "search") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const query = (url.searchParams.get("q") || url.searchParams.get("query") || "").trim();
      if (!query) {
        return res.end(JSON.stringify([]));
      }

      function normalizeStr(str) {
        if (!str) return "";
        return String(str)
          .toLowerCase()
          .replace(/[أإآ]/g, "ا")
          .replace(/ة/g, "ه")
          .replace(/ى/g, "ي")
          .replace(/[\u064B-\u065F]/g, "")
          .trim();
      }

      const qNorm = normalizeStr(query);
      const qLower = query.toLowerCase();

      function matches(val) {
        if (val === undefined || val === null) return false;
        const s = String(val);
        if (s.toLowerCase().includes(qLower)) return true;
        if (normalizeStr(s).includes(qNorm)) return true;
        return false;
      }

      const results = [];
      const archivedIds = new Set((db.archived_items || []).map((a) => `${a.entity_type}:${a.entity_id}`));

      // 1. Patients
      const patients = Array.isArray(db.patients) ? db.patients : [];
      for (const p of patients) {
        if (archivedIds.has(`patient:${p.id}`)) continue;
        if (matches(p.full_name) || matches(p.file_no) || matches(p.phone) || matches(p.national_id) || matches(p.id) || matches(p.email)) {
          results.push({
            id: p.id,
            entityType: "patient",
            category: "المرضى",
            title: p.full_name || "مريض",
            subtitle: p.file_no ? `رقم الملف: ${p.file_no}` : (p.phone || ""),
            badge: p.gender === "Female" ? "أنثى" : (p.gender === "Male" ? "ذكر" : null),
            secondaryInfo: p.phone || "",
            url: `/patients/${p.id}`,
            route: `/patients/${p.id}`,
          });
        }
      }

      // 2. Appointments
      const appointments = Array.isArray(db.appointments) ? db.appointments : [];
      for (const a of appointments) {
        if (archivedIds.has(`appointment:${a.id}`)) continue;
        if (matches(a.patient_name) || matches(a.doctor_name) || matches(a.type) || matches(a.notes) || matches(a.id) || matches(a.status)) {
          results.push({
            id: a.id,
            entityType: "appointment",
            category: "المواعيد",
            title: `${a.patient_name || "مريض"} — ${a.doctor_name || "طبيب"}`,
            subtitle: `${a.starts_at ? new Date(a.starts_at).toLocaleDateString("ar-EG-u-nu-latn") : ""} ${a.type ? `• ${a.type}` : ""}`,
            badge: a.status || "مجدول",
            secondaryInfo: a.starts_at ? new Date(a.starts_at).toLocaleTimeString("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit" }) : "",
            url: `/appointments?appointmentId=${a.id}`,
            route: "/appointments",
          });
        }
      }

      // 3. Staff / Doctors
      const staffList = Array.isArray(db.staff) ? db.staff : [];
      for (const s of staffList) {
        if (matches(s.full_name) || matches(s.email) || matches(s.phone) || matches(s.specialty) || matches(s.role) || matches(s.id)) {
          const isDoc = s.staff_type === "Doctor" || s.role === "Doctor" || s.specialty;
          results.push({
            id: s.id,
            entityType: isDoc ? "doctor" : "staff",
            category: isDoc ? "الأطباء" : "فريق العمل",
            title: s.full_name || "عضو فريق",
            subtitle: s.specialty ? s.specialty : (s.role || "كادر طبي"),
            badge: s.staff_type === "Doctor" ? "طبيب" : "موظف",
            secondaryInfo: s.phone || s.email || "",
            url: `/team?memberId=${s.id}`,
            route: "/team",
          });
        }
      }

      // 4. Invoices
      const invoices = Array.isArray(db.invoices) ? db.invoices : [];
      for (const inv of invoices) {
        if (archivedIds.has(`invoice:${inv.id}`)) continue;
        if (matches(inv.invoice_no) || matches(inv.patient_name) || matches(inv.id) || matches(inv.total_amount)) {
          results.push({
            id: inv.id,
            entityType: "invoice",
            category: "الفواتير",
            title: inv.invoice_no ? `فاتورة: ${inv.invoice_no}` : `فاتورة #${inv.id}`,
            subtitle: inv.patient_name ? `المريض: ${inv.patient_name}` : "",
            badge: `${Number(inv.total_amount || 0).toLocaleString("en-US")} ج.م`,
            secondaryInfo: inv.issued_at ? new Date(inv.issued_at).toLocaleDateString("en-GB") : "",
            url: `/invoices?invoiceId=${inv.id}`,
            route: "/invoices",
          });
        }
      }

      // 5. Sessions
      const sessions = Array.isArray(db.treatment_sessions) ? db.treatment_sessions : [];
      for (const sess of sessions) {
        if (matches(sess.patient_name) || matches(sess.doctor_name) || matches(sess.notes) || matches(sess.diagnosis) || matches(sess.id)) {
          results.push({
            id: sess.id,
            entityType: "session",
            category: "الجلسات العلاجية",
            title: sess.patient_name ? `جلسة: ${sess.patient_name}` : `جلسة #${sess.id}`,
            subtitle: sess.doctor_name ? `د. ${sess.doctor_name}` : (sess.session_number ? `جلسة رقم ${sess.session_number}` : "جلسة علاج"),
            badge: sess.status || "مكتملة",
            secondaryInfo: sess.date || "",
            url: `/sessions/${sess.id}`,
            route: `/sessions/${sess.id}`,
          });
        }
      }

      // 6. Expenses
      const expenses = Array.isArray(db.expenses) ? db.expenses : [];
      for (const exp of expenses) {
        if (archivedIds.has(`expense:${exp.id}`)) continue;
        if (matches(exp.title) || matches(exp.description) || matches(exp.category) || matches(exp.amount) || matches(exp.id)) {
          results.push({
            id: exp.id,
            entityType: "expense",
            category: "المصروفات",
            title: exp.description || exp.title || "مصروف",
            subtitle: exp.category ? `تصنيف: ${exp.category}` : "مصروف إداري / عيادي",
            badge: `${Number(exp.amount || 0).toLocaleString("en-US")} ج.م`,
            secondaryInfo: exp.date || "",
            url: `/expenses?expenseId=${exp.id}`,
            route: "/expenses",
          });
        }
      }

      // 7. Packages
      const packages = Array.isArray(db["package-templates"]) ? db["package-templates"] : (Array.isArray(db.package_templates) ? db.package_templates : []);
      for (const pkg of packages) {
        if (archivedIds.has(`package:${pkg.id}`)) continue;
        if (matches(pkg.name) || matches(pkg.description) || matches(pkg.id)) {
          results.push({
            id: pkg.id,
            entityType: "package",
            category: "الباقات العلاجية",
            title: pkg.name || "باقة علاجية",
            subtitle: pkg.session_count ? `${pkg.session_count} جلسات` : (pkg.description || "باقة"),
            badge: `${Number(pkg.price || 0).toLocaleString("en-US")} ج.م`,
            secondaryInfo: "",
            url: `/packages?search=${encodeURIComponent(pkg.name || "")}`,
            route: "/packages",
          });
        }
      }

      // 8. Services
      const services = Array.isArray(db.services) ? db.services : [];
      for (const srv of services) {
        if (archivedIds.has(`service:${srv.id}`)) continue;
        if (matches(srv.name) || matches(srv.description) || matches(srv.id)) {
          results.push({
            id: srv.id,
            entityType: "service",
            category: "الخدمات الطبية",
            title: srv.name || "خدمة طبية",
            subtitle: srv.duration_minutes ? `المدة: ${srv.duration_minutes} دقيقة` : (srv.description || "خدمة"),
            badge: `${Number(srv.price || 0).toLocaleString("en-US")} ج.م`,
            secondaryInfo: "",
            url: `/services?search=${encodeURIComponent(srv.name || "")}`,
            route: "/services",
          });
        }
      }

      // 9. Devices
      const devices = Array.isArray(db.devices) ? db.devices : [];
      for (const dev of devices) {
        if (archivedIds.has(`device:${dev.id}`)) continue;
        if (matches(dev.name) || matches(dev.model_number) || matches(dev.serial_number) || matches(dev.id)) {
          results.push({
            id: dev.id,
            entityType: "device",
            category: "الأجهزة الطبية",
            title: dev.name || "جهاز طبي",
            subtitle: dev.model_number ? `طراز: ${dev.model_number}` : (dev.serial_number ? `S/N: ${dev.serial_number}` : "جهاز"),
            badge: dev.status || "متاح",
            secondaryInfo: "",
            url: `/devices?search=${encodeURIComponent(dev.name || "")}`,
            route: "/devices",
          });
        }
      }

      // 10. Rooms
      const rooms = Array.isArray(db.rooms) ? db.rooms : [];
      for (const rm of rooms) {
        if (archivedIds.has(`room:${rm.id}`)) continue;
        if (matches(rm.name) || matches(rm.type) || matches(rm.id)) {
          results.push({
            id: rm.id,
            entityType: "room",
            category: "الغرف العلاجية",
            title: rm.name || "غرفة",
            subtitle: rm.type ? `النوع: ${rm.type}` : "غرفة علاج",
            badge: rm.status || "متاحة",
            secondaryInfo: rm.capacity ? `السعة: ${rm.capacity}` : "",
            url: `/rooms`,
            route: "/rooms",
          });
        }
      }

      // 11. Maintenance
      const maintenance = Array.isArray(db.maintenance) ? db.maintenance : [];
      for (const mnt of maintenance) {
        if (archivedIds.has(`maintenance:${mnt.id}`)) continue;
        if (matches(mnt.reason) || matches(mnt.device_name) || matches(mnt.technician_name) || matches(mnt.id)) {
          results.push({
            id: mnt.id,
            entityType: "maintenance",
            category: "سجلات الصيانة",
            title: mnt.reason || "طلب صيانة",
            subtitle: mnt.device_name ? `الجهاز: ${mnt.device_name}` : "صيانة دورية",
            badge: mnt.status || "معلق",
            secondaryInfo: mnt.cost ? `${Number(mnt.cost).toLocaleString("en-US")} ج.م` : "",
            url: `/maintenance`,
            route: "/maintenance",
          });
        }
      }

      return res.end(JSON.stringify(results.slice(0, 30)));
    }

    // 1. Move to Archive endpoint: POST /archive/move
    if (method === "POST" && collectionRaw === "archive" && targetId === "move") {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      readBody().then((body) => {
        const {
          entity_type,
          entity_id,
          delete_reason = "طلب نقل للأرشيف",
          archived_by = "المسؤول",
          archived_by_user_id = null,
          title = "",
          subtitle = "",
          secondary_info = "",
          original_data: passedOriginalData = null,
        } = body;

        if (!entity_type || !entity_id) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "entity_type and entity_id are required" }));
        }

        const collName = entityCollectionMap[entity_type] || getCollectionKey(entity_type);
        let origData = passedOriginalData;

        // If original data wasn't passed directly, fetch and remove from original collection
        if (collName && Array.isArray(db[collName])) {
          const idx = db[collName].findIndex((x) => String(x.id) === String(entity_id));
          if (idx !== -1) {
            origData = origData || db[collName][idx];
            db[collName].splice(idx, 1);
          }
        }

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const archiveRecord = {
          id: `arc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          entity_type,
          entity_id: String(entity_id),
          title: title || origData?.full_name || origData?.name || origData?.description || `عنصر ${entity_type}`,
          subtitle: subtitle || origData?.file_no || origData?.invoice_no || `ID: ${entity_id}`,
          secondary_info: secondary_info || origData?.phone || origData?.amount || "",
          delete_reason: delete_reason || "طلب نقل للأرشيف",
          archived_by: archived_by || "المسؤول",
          archived_by_user_id: archived_by_user_id || null,
          archived_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          original_data: origData || { id: entity_id },
        };

        db.archived_items.push(archiveRecord);
        saveDb();

        res.statusCode = 201;
        return res.end(JSON.stringify(archiveRecord));
      });
      return;
    }

    // 2. Restore from Archive endpoint: POST /archive/:id/restore or POST /archived_items/:id/restore
    if (
      method === "POST" &&
      ((collectionRaw === "archive" && action === "restore") ||
       (collectionRaw === "archived_items" && action === "restore") ||
       (collectionRaw === "archive" && targetId === "restore"))
    ) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const archiveId = targetId === "restore" ? null : targetId;
      readBody().then((body) => {
        const targetArchiveId = archiveId || body.id;
        const index = db.archived_items.findIndex(
          (x) => String(x.id) === String(targetArchiveId) || String(x.entity_id) === String(targetArchiveId)
        );

        if (index === -1) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "العنصر المؤرشف غير موجود" }));
        }

        const item = db.archived_items[index];
        const collName = entityCollectionMap[item.entity_type] || getCollectionKey(item.entity_type);
        const origData = item.original_data || { id: item.entity_id };

        if (collName) {
          if (!Array.isArray(db[collName])) {
            db[collName] = [];
          }
          // Check if already exists in active collection
          const existingIdx = db[collName].findIndex((x) => String(x.id) === String(origData.id));
          if (existingIdx !== -1) {
            db[collName][existingIdx] = origData;
          } else {
            db[collName].push(origData);
          }
        }

        // Remove from archived_items
        db.archived_items.splice(index, 1);
        saveDb();

        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, restored: origData }));
      });
      return;
    }

    // 3. Empty Archive endpoint: DELETE /archive/empty or DELETE /archived_items/empty
    if (
      method === "DELETE" &&
      ((collectionRaw === "archive" && targetId === "empty") ||
       (collectionRaw === "archived_items" && targetId === "empty"))
    ) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      const count = db.archived_items.length;
      db.archived_items = [];
      saveDb();
      res.statusCode = 200;
      return res.end(JSON.stringify({ success: true, count }));
    }

    // 4. Auto-cleanup check on reading archived_items
    if (collectionRaw === "archived_items" || collectionRaw === "archive") {
      const now = new Date();
      const initialCount = db.archived_items.length;
      db.archived_items = db.archived_items.filter((item) => {
        if (!item.expires_at) return true;
        const exp = new Date(item.expires_at);
        return exp.getTime() > now.getTime();
      });
      if (db.archived_items.length !== initialCount) {
        saveDb();
      }
    }

    const collectionKey = getCollectionKey(collectionRaw);

    // Check if this is a known collection or if db has it
    if (!(collectionKey in db) && !Array.isArray(db[collectionKey])) {
      // If method is not an API call or not in DB, pass along
      return next();
    }

    let collection = db[collectionKey];
    if (!Array.isArray(collection)) {
      collection = [];
      db[collectionKey] = collection;
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");

    if (method === "GET") {
      if (targetId) {
        const item = collection.find(
          (x) => String(x.id) === String(targetId)
        );
        if (!item) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "Item not found" }));
        }
        return res.end(JSON.stringify(item));
      }

      // Filter by query parameters
      let results = [...collection];
      for (const [key, value] of url.searchParams.entries()) {
        if (key.startsWith("_")) continue; // ignore _sort, _limit, etc for base filtering
        results = results.filter((item) => {
          if (item[key] === undefined) return false;
          const itemVal = item[key];
          if (typeof itemVal === "number") {
            return Number(itemVal) === Number(value);
          }
          if (typeof itemVal === "boolean") {
            return String(itemVal) === String(value);
          }
          return String(itemVal) === String(value);
        });
      }

      // Support _sort and _order
      const sortField = url.searchParams.get("_sort");
      const sortOrder = url.searchParams.get("_order") || "asc";
      if (sortField) {
        results.sort((a, b) => {
          const valA = a[sortField] ?? "";
          const valB = b[sortField] ?? "";
          if (valA < valB) return sortOrder === "desc" ? 1 : -1;
          if (valA > valB) return sortOrder === "desc" ? -1 : 1;
          return 0;
        });
      }

      // Support _limit and _page
      const limitParam = url.searchParams.get("_limit");
      const pageParam = url.searchParams.get("_page");
      if (limitParam) {
        const limit = parseInt(limitParam, 10);
        const page = pageParam ? parseInt(pageParam, 10) : 1;
        const start = (page - 1) * limit;
        results = results.slice(start, start + limit);
      }

      return res.end(JSON.stringify(results));
    }

    if (method === "POST") {
      readBody().then((body) => {
        const newItem = {
          id: body.id || (collection.length > 0 && typeof collection[0]?.id === "number" ? Math.max(...collection.map((i) => (typeof i.id === "number" ? i.id : 0)), 0) + 1 : crypto.randomUUID()),
          ...body,
        };
        collection.push(newItem);
        saveDb();
        res.statusCode = 201;
        res.end(JSON.stringify(newItem));
      });
      return;
    }

    if (method === "PUT") {
      if (!targetId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Missing ID for PUT" }));
      }
      readBody().then((body) => {
        const index = collection.findIndex(
          (x) => String(x.id) === String(targetId)
        );
        if (index === -1) {
          const newItem = { id: targetId, ...body };
          collection.push(newItem);
          saveDb();
          return res.end(JSON.stringify(newItem));
        }
        collection[index] = { ...body, id: collection[index].id };
        saveDb();
        res.end(JSON.stringify(collection[index]));
      });
      return;
    }

    if (method === "PATCH") {
      if (!targetId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Missing ID for PATCH" }));
      }
      readBody().then((body) => {
        const index = collection.findIndex(
          (x) => String(x.id) === String(targetId)
        );
        if (index === -1) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: "Item not found" }));
        }
        collection[index] = { ...collection[index], ...body };
        saveDb();
        res.end(JSON.stringify(collection[index]));
      });
      return;
    }

    if (method === "DELETE") {
      if (!targetId) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: "Missing ID for DELETE" }));
      }
      const index = collection.findIndex(
        (x) => String(x.id) === String(targetId)
      );
      if (index !== -1) {
        collection.splice(index, 1);
        saveDb();
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
      return;
    }

    next();
  };
}
