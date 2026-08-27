import { supabase } from "./supabase";

export type LicenseSession = {
  token: string;
  expiresAt: string;
  accessCode: string;
  license: {
    id: string;
    plan: string;
    expiresAt: string | null;
    active: boolean;
  };
};

const SESSION_KEY = "youtube-insight-license-session-v1";
const DEVICE_KEY = "youtube-insight-device-id-v1";
const LICENSE_REQUEST_TIMEOUT_MS = 10_000;
const MAX_COOKIE_AGE_SECONDS = 60 * 60 * 24 * 400;
const memoryStorage = new Map<string, string>();

function readCookie(key: string) {
  try {
    const encodedKey = `${encodeURIComponent(key)}=`;
    const entry = document.cookie.split("; ").find((item) => item.startsWith(encodedKey));
    return entry ? decodeURIComponent(entry.slice(encodedKey.length)) : null;
  } catch {
    return null;
  }
}

function writeCookie(key: string, value: string, maxAgeSeconds = MAX_COOKIE_AGE_SECONDS) {
  try {
    const embeddedAttributes = window.location.protocol === "https:"
      ? "; SameSite=None; Secure; Partitioned"
      : "; SameSite=Lax";
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; Path=/; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}${embeddedAttributes}`;
  } catch {
    // Cookies are a persistence fallback and may be disabled by the host browser.
  }
}

function sessionCookieAge(session: LicenseSession) {
  if (!session.license.expiresAt) return MAX_COOKIE_AGE_SECONDS;
  return Math.min(MAX_COOKIE_AGE_SECONDS, Math.max(0, (new Date(session.license.expiresAt).getTime() - Date.now()) / 1000));
}

function readStorage(key: string) {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) memoryStorage.set(key, value);
    const persisted = value ?? readCookie(key);
    if (persisted !== null) memoryStorage.set(key, persisted);
    return persisted ?? memoryStorage.get(key) ?? null;
  } catch {
    const persisted = readCookie(key);
    if (persisted !== null) memoryStorage.set(key, persisted);
    return persisted ?? memoryStorage.get(key) ?? null;
  }
}

function writeStorage(key: string, value: string, cookieAgeSeconds = MAX_COOKIE_AGE_SECONDS) {
  memoryStorage.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Embedded browsers can block persistent storage. Memory keeps this tab usable.
  }
  writeCookie(key, value, cookieAgeSeconds);
}

function removeStorage(key: string) {
  memoryStorage.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // A blocked storage API must never leave the access screen checking forever.
  }
  writeCookie(key, "", 0);
}

export class LicenseRequestError extends Error {
  status: number | undefined;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "LicenseRequestError";
    this.status = status;
  }
}

export function canRefreshLicense(error: unknown) {
  return error instanceof LicenseRequestError && error.status === 401;
}

export function isDefinitiveLicenseFailure(error: unknown) {
  return error instanceof LicenseRequestError && [403, 404, 409].includes(error.status ?? 0);
}

export function licenseHasExpired(session: LicenseSession) {
  return Boolean(session.license.expiresAt && new Date(session.license.expiresAt).getTime() <= Date.now());
}

async function call<T>(name: string, body?: unknown, method = "POST", token?: string): Promise<T> {
  if (!supabase) throw new Error("Youtube Insight access service is not configured.");
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), LICENSE_REQUEST_TIMEOUT_MS);
  let data: unknown;
  let error: Error | null;

  try {
    const result = await supabase.functions.invoke(name, {
      method,
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      signal: controller.signal,
    });
    data = result.data;
    error = result.error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (error) {
    let message: string | undefined;
    const response = (error as { context?: Response }).context;
    if (response) {
      try {
        const result = (await response.clone().json()) as { error?: string };
        message = result.error;
      } catch {
        // Fall back to the SDK message when the response is not JSON.
      }
    }
    throw new LicenseRequestError(message ?? (data as { error?: string } | null)?.error ?? error.message, response?.status);
  }
  if ((data as { error?: string } | null)?.error) throw new LicenseRequestError((data as { error: string }).error);
  return data as T;
}

export function loadLicenseSession(): LicenseSession | null {
  try {
    return JSON.parse(readStorage(SESSION_KEY) ?? "null") as LicenseSession | null;
  } catch {
    return null;
  }
}

export function saveLicenseSession(session: LicenseSession) {
  writeStorage(SESSION_KEY, JSON.stringify(session), sessionCookieAge(session));
}

export function clearLicenseSession() {
  removeStorage(SESSION_KEY);
}

export function createDeviceId() {
  const current = readStorage(DEVICE_KEY);
  if (current) {
    writeStorage(DEVICE_KEY, current);
    return current;
  }
  const id = window.crypto.randomUUID();
  writeStorage(DEVICE_KEY, id);
  return id;
}

export async function activateLicense(accessCode: string) {
  const normalizedCode = accessCode.trim().toUpperCase();
  const result = await call<Omit<LicenseSession, "accessCode">>("activate-license", {
    accessCode: normalizedCode,
    deviceId: createDeviceId(),
    appVersion: "youtube-insight-web",
  });
  const session = { ...result, accessCode: normalizedCode };
  saveLicenseSession(session);
  return session;
}

export async function refreshLicense(session: LicenseSession) {
  const result = await call<Omit<LicenseSession, "accessCode">>("refresh-license", {
    accessCode: session.accessCode,
    deviceId: createDeviceId(),
    appVersion: "youtube-insight-web",
  });
  const refreshed = { ...result, accessCode: session.accessCode };
  saveLicenseSession(refreshed);
  return refreshed;
}

export async function getLicenseStatus(token: string) {
  return call<LicenseSession["license"]>("license-status", undefined, "GET", token);
}
