const STORAGE_KEY = "currentUser";

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function getUser() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return user && user.email ? user : null;
  } catch {
    return null;
  }
}

export function removeUser() {
  localStorage.removeItem(STORAGE_KEY);
}
