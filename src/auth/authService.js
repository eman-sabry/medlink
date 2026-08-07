import { apiRequest } from "../api/client";

const SESSION_KEY = "medlink_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 ساعة - تسجيل خروج تلقائي بعدها

function sanitizeUser(user) {
  const safeUser = { ...user };
  delete safeUser.password;
  return safeUser;
}

export async function login(username, password) {
  const matches = await apiRequest(
    `/users?username=${encodeURIComponent(username)}`,
  );
  const user = matches?.[0];

  if (!user || user.password !== password) {
    throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
  }

  if (user.status !== "Active") {
    throw new Error("هذا الحساب غير مفعّل، يرجى التواصل مع إدارة النظام");
  }

  return sanitizeUser(user);
}

export function saveSession(user) {
  const session = { user, expiresAt: Date.now() + SESSION_TTL_MS };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
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
    return { user: session.user };
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
