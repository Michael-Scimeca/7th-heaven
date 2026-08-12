export interface FakeLoginUser {
  email: string;
  password?: string;
  name?: string;
  username?: string;
  role?: string;
  userRole?: string;
  pin?: string;
}

/**
 * Safely retrieves fake-logins in development mode.
 * Returns an empty array in production or when the gitignored fixture file is absent.
 */
export function getFakeLogins(): FakeLoginUser[] {
  if (process.env.NODE_ENV === "production") {
    return [];
  }
  try {
    // @ts-ignore - dev fixture file is optional and ignored by git
    const logins = require("@/data/fake-logins.json");
    return Array.isArray(logins) ? logins : [];
  } catch {
    return [];
  }
}
