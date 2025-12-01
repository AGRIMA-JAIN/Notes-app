const CURRENT_USER_KEY = "cn_currentUser";
const TOKEN_KEY = "cn_token";
const USERS_KEY = "cn_users";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password, hashedPassword) {
  const hash = await hashPassword(password);
  return hash === hashedPassword;
}

export async function encryptPassword(password) {
  return await hashPassword(password);
}

export function seedAdminUser() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

  const admin1Exists = users.some((u) => u.email === "admin@gmail.com");
  const admin2Exists = users.some((u) => u.email === "admin2@gmail.com");

  const adminsToAdd = [];

  if (!admin1Exists) {
    adminsToAdd.push({
      id: "admin_1_" + Date.now(),
      name: "Admin",
      email: "admin@gmail.com",
      password:
        "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }

  if (!admin2Exists) {
    adminsToAdd.push({
      id: "admin_2_" + Date.now(),
      name: "Admin Two",
      email: "admin2@gmail.com",
      password:
        "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      role: "admin",
      createdAt: new Date().toISOString(),
    });
  }

  if (adminsToAdd.length > 0) {
    users.push(...adminsToAdd);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!(getToken() && getCurrentUser());
}
