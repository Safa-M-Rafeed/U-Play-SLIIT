export const AUTH_STORAGE_KEY = 'uplay_auth';

export function getDashboardPath(role) {
  switch (role) {
    case 'student':
      return '/student';
    case 'captain':
      return '/captain';
    case 'admin':
      return '/admin';
    default:
      return '/login';
  }
}

export function loadStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuth(data, persist = true) {
  if (!persist) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function loadSessionAuth() {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
}
