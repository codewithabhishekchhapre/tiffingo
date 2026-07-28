/**
 * Shared helper so any 401 handler (either axios instance) can consistently
 * surface a message to the user and land them on the correct module's login page.
 */

const FLASH_KEY = 'auth_flash_message';

export const MODULE_LOGIN_PATHS = {
  admin: '/admin/login',
  seller: '/seller/auth',
  delivery: '/food/delivery/login',
  restaurant: '/food/restaurant/login',
  user: '/user/auth/login',
  customer: '/user/auth/login',
};

export function setAuthFlashMessage(message) {
  try {
    sessionStorage.setItem(FLASH_KEY, message);
  } catch {
    // sessionStorage unavailable (private mode etc.) — the toast just won't survive the redirect.
  }
}

export function consumeAuthFlashMessage() {
  try {
    const message = sessionStorage.getItem(FLASH_KEY);
    if (message) sessionStorage.removeItem(FLASH_KEY);
    return message;
  } catch {
    return null;
  }
}

// Guards against multiple concurrent 401s each triggering their own redirect.
let hasRedirected = false;

export function redirectToModuleLogin(module, message = 'Your session has expired. Please log in again.') {
  if (hasRedirected) return;
  hasRedirected = true;
  setAuthFlashMessage(message);
  window.location.href = MODULE_LOGIN_PATHS[module] || MODULE_LOGIN_PATHS.user;
}
