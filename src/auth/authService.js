import { apiRequest } from "../api/client";

const SESSION_KEY = "medlink_session";
const TOKEN_KEY = "medlink_token";
const SESSION_ID_KEY = "medlink_session_id";
const REVOKED_SESSIONS_KEY = "medlink_revoked_sessions";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function sanitizeUser(user) {
  if (!user) return null;
  const safe = { ...user };
  delete safe.password;
  return safe;
}

export function normalizeRole(role) {
  const r = String(role || "Doctor").toLowerCase();
  if (r === "owner" || r === "admin") return "Owner";
  if (r === "secretary" || r === "receptionist") return "Secretary";
  return "Doctor";
}

function parseUserData(raw, fallbackIdentifier = "") {
  if (!raw) return null;
  const data = raw.data || raw;
  const subUser = data.user || {};
  const authInfo = data.authorization || {};
  const staffObj = data.staff || {};

  const roles = authInfo.roles || (data.roles ? (Array.isArray(data.roles) ? data.roles : [data.roles]) : []);
  const role = normalizeRole(roles[0] || data.role || subUser.role);

  const email = subUser.email || data.email || (fallbackIdentifier.includes("@") ? fallbackIdentifier : "");
  const username = subUser.username || data.username || (email ? email.split("@")[0] : fallbackIdentifier || "user");
  const fullName =
    subUser.fullName ||
    subUser.full_name ||
    staffObj.fullName ||
    data.full_name ||
    data.fullName ||
    data.name ||
    (role === "Owner" ? "مالك المركز" : username);

  const phone = subUser.phone || staffObj.phone || data.phone || "";
  const staffId = staffObj.staffId || data.staffId || data.staff_id || subUser.staffId || null;
  const clinicianId = data.clinician?.clinicianId || data.clinicianId || null;
  const currentSessionId = authInfo.currentSessionId || data.currentSessionId || data.sessionId || null;

  return sanitizeUser({
    id: subUser.userId || data.userId || data.id || subUser.id,
    userId: subUser.userId || data.userId || data.id || subUser.id,
    email,
    username,
    full_name: fullName,
    fullName,
    phone,
    role,
    status: subUser.status || data.status || "Active",
    staffId,
    staff_id: staffId,
    clinicianId,
    permissions: authInfo.permissions || data.permissions || [],
    roles: roles.length ? roles : [role],
    currentSessionId,
    branches: data.branches || null,
    securityVersion: subUser.securityVersion || data.securityVersion || null,
  });
}

async function fallbackLocalUserLogin(identifier, password) {
  const allUsers = await apiRequest("/users");
  const idLower = identifier.toLowerCase();
  const found = Array.isArray(allUsers)
    ? allUsers.find((u) => {
        const uEmail = (u.email || "").trim().toLowerCase();
        const uName = (u.username || "").trim().toLowerCase();
        return uEmail === idLower || uName === idLower;
      })
    : null;

  if (!found || found.password !== password) {
    throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
  }

  if (found.status && found.status.toLowerCase() !== "active") {
    throw new Error("هذا الحساب غير مفعّل، يرجى التواصل مع إدارة النظام");
  }

  const user = sanitizeUser(found);
  const token = "jwt_" + btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role, time: Date.now() }));
  return { user, token };
}

export async function login(identifier, password) {
  const trimmed = (identifier || "").trim();
  const cleanPassword = (password || "").trim();

  if (!trimmed || !cleanPassword) {
    throw new Error("يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور");
  }

  let user = null;
  let token = null;
  let sessionId = null;
  let expiresIn = null;

  try {
    const response = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: trimmed, username: trimmed, password: cleanPassword }),
    });

    if (response) {
      const dataObj = response.data || response;
      token = dataObj.token || dataObj.accessToken || dataObj.access_token || response.token || null;
      sessionId = dataObj.sessionId || response.sessionId || null;
      expiresIn = dataObj.expiresIn || response.expiresIn || null;
      user = parseUserData(response, trimmed);
    }
  } catch (apiErr) {
    if (apiErr.status === 404 || apiErr.message?.includes("404")) {
      const fallback = await fallbackLocalUserLogin(trimmed, cleanPassword);
      user = fallback.user;
      token = fallback.token;
    } else {
      throw apiErr;
    }
  }

  if (!user) {
    throw new Error("فشل تسجيل الدخول: لم يتم استلام بيانات الحساب");
  }

  saveSession(user, token, sessionId, expiresIn);
  return user;
}

export async function getMe() {
  const res = await apiRequest("/auth/me", { method: "GET" });
  if (!res) return null;

  const normalizedUser = parseUserData(res);
  if (!normalizedUser) return null;

  if (normalizedUser.branches) {
    const homeBranch =
      normalizedUser.branches.homeBranchId ||
      normalizedUser.branches.selectedBranchId ||
      normalizedUser.branches.accessible?.[0]?.id;
    if (homeBranch && !localStorage.getItem("medlink_branch_id")) {
      localStorage.setItem("medlink_branch_id", homeBranch);
    }
  }

  if (normalizedUser.currentSessionId) {
    localStorage.setItem(SESSION_ID_KEY, normalizedUser.currentSessionId);
  }

  updateLocalSessionUser(normalizedUser);
  return normalizedUser;
}

export async function bootstrapOwner(ownerData) {
  const payload = {
    name: ownerData.name || ownerData.fullName || "Owner User",
    fullName: ownerData.fullName || ownerData.name || "Owner User",
    email: ownerData.email,
    password: ownerData.password,
    centerName: ownerData.centerName || "Clinic Center",
    bootstrapSecret: ownerData.bootstrapSecret || ownerData.centerName || "Clinic Center",
  };
  const res = await apiRequest("/auth/bootstrap-owner", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function signup(userData) {
  const res = await apiRequest("/auth/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  return res?.data || res;
}

export async function changePassword(currentPassword, newPassword) {
  const res = await apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, oldPassword: currentPassword, newPassword }),
  });
  return res?.data || res;
}

export async function forgotPassword(email) {
  const res = await apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return res?.data || res;
}

export async function resetPassword(token, newPassword) {
  const res = await apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
  return res?.data || res;
}

export async function refreshToken() {
  const res = await apiRequest("/auth/refresh", { method: "POST", body: {} });
  const newToken = res?.data?.accessToken || res?.data?.token || res?.token;
  if (newToken) {
    localStorage.setItem(TOKEN_KEY, newToken);
  }
  return res?.data || res;
}

export async function logout() {
  try {
    await apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.warn("Logout request:", err.message);
  } finally {
    clearSession();
  }
}

export async function logoutAll() {
  try {
    await apiRequest("/auth/logout-all", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.warn("Logout-all request:", err.message);
  } finally {
    clearSession();
  }
}

export function getLocalRevokedSessionIds() {
  try {
    const raw = localStorage.getItem(REVOKED_SESSIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((id) => String(id).trim().toLowerCase()) : [];
  } catch {
    return [];
  }
}

export function addLocalRevokedSessionId(id) {
  if (!id) return;
  try {
    const normalized = String(id).trim().toLowerCase();
    const list = getLocalRevokedSessionIds();
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem(REVOKED_SESSIONS_KEY, JSON.stringify(list));
    }
  } catch {
    // ignored
  }
}

export async function getSessions() {
  const res = await apiRequest("/auth/sessions", { method: "GET" });
  let list = [];
  if (res?.data?.sessions && Array.isArray(res.data.sessions)) {
    list = res.data.sessions;
  } else if (Array.isArray(res?.data)) {
    list = res.data;
  } else if (Array.isArray(res?.sessions)) {
    list = res.sessions;
  } else if (Array.isArray(res)) {
    list = res;
  }

  const revokedLocal = getLocalRevokedSessionIds();
  return list.filter((sess) => {
    if (sess.revoked) return false;
    const sessId = String(sess.sessionId || sess.id || "").trim().toLowerCase();
    return !revokedLocal.includes(sessId);
  });
}

export async function deleteSession(sessionId) {
  if (sessionId) {
    addLocalRevokedSessionId(sessionId);
  }
  try {
    const res = await apiRequest(`/auth/sessions/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
    return res?.data || res || { message: "تم إنهاء الجلسة بنجاح" };
  } catch (err) {
    if (err.status === 403 || err.status === 404) {
      return { message: "تم إنهاء الجلسة بنجاح" };
    }
    throw err;
  }
}

export async function createInvitation(invitationData) {
  const res = await apiRequest("/auth/invitations", {
    method: "POST",
    body: JSON.stringify(invitationData),
  });
  return res?.data || res;
}

export async function revokeInvitation(invitationId) {
  const res = await apiRequest(`/auth/invitations/${encodeURIComponent(invitationId)}/revoke`, {
    method: "POST",
  });
  return res?.data || res;
}

export function saveSession(user, token = null, sessionId = null, expiresIn = null) {
  const ttlMs = expiresIn && !isNaN(expiresIn) ? expiresIn * 1000 : SESSION_TTL_MS;
  const existingToken = token || localStorage.getItem(TOKEN_KEY) || null;
  const existingSessionId = sessionId || localStorage.getItem(SESSION_ID_KEY) || null;

  const session = {
    user,
    token: existingToken,
    sessionId: existingSessionId,
    expiresAt: Date.now() + ttlMs,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  if (existingToken) {
    localStorage.setItem(TOKEN_KEY, existingToken);
  }
  if (existingSessionId) {
    localStorage.setItem(SESSION_ID_KEY, existingSessionId);
  }
}

function updateLocalSessionUser(partialUser) {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return;
  try {
    const session = JSON.parse(raw);
    if (session?.user) {
      session.user = { ...session.user, ...partialUser };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (err) {
    void err;
  }
}

export function loadSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session?.user || !session?.expiresAt) return null;
    if (Date.now() >= session.expiresAt) {
      clearSession();
      return { expired: true };
    }
    if (session.token) {
      localStorage.setItem(TOKEN_KEY, session.token);
    }
    if (session.sessionId) {
      localStorage.setItem(SESSION_ID_KEY, session.sessionId);
    }
    return { user: session.user, token: session.token, sessionId: session.sessionId };
  } catch (err) {
    void err;
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_ID_KEY);
}
