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

async function call<T>(name: string, body?: unknown, method = "POST", token?: string): Promise<T> {
  if (!supabase) throw new Error("Youtube Insight access service is not configured.");
  const { data, error } = await supabase.functions.invoke(name, {
    method,
    body,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

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
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? "null") as LicenseSession | null;
  } catch {
    return null;
  }
}

export function saveLicenseSession(session: LicenseSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearLicenseSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function createDeviceId() {
  const current = window.localStorage.getItem(DEVICE_KEY);
  if (current) return current;
  const id = window.crypto.randomUUID();
  window.localStorage.setItem(DEVICE_KEY, id);
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
