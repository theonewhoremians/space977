import { createClient } from "npm:@supabase/supabase-js@2.110.8";

export const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const encoder = new TextEncoder();

export type License = {
  id: string;
  access_code: string;
  plan: string;
  duration_days: number | null;
  activated_at: string | null;
  expires_at: string | null;
  device_id: string | null;
  active: boolean;
  activation_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "https://space977.vercel.app",
];

function allowedOrigins() {
  const configured = (Deno.env.get("ALLOWED_ORIGIN") || "")
    .split(",")
    .map((origin) => origin.trim().endsWith("/") ? origin.trim().slice(0, -1) : origin.trim())
    .filter(Boolean);

  return new Set([...defaultAllowedOrigins, ...configured]);
}

export function cors(request?: Request) {
  const rawOrigin = request?.headers.get("Origin")?.trim();
  const requestedOrigin = rawOrigin?.endsWith("/") ? rawOrigin.slice(0, -1) : rawOrigin;
  const origins = allowedOrigins();
  const allowedOrigin = requestedOrigin && origins.has(requestedOrigin)
    ? requestedOrigin
    : defaultAllowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info, x-admin-key",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Vary": "Origin",
  };
}

export function json(value: unknown, status = 200, request?: Request) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...cors(request), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function requiredSecret(name: string, minimumLength = 32) {
  const value = Deno.env.get(name)?.trim();
  if (!value || value.length < minimumLength) throw new Error(`${name} is not configured.`);
  return value;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function base64Url(input: Uint8Array | string) {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function signHmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(requiredSecret("LICENSE_JWT_SECRET")),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

export async function signLicense(license: License) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify({
    sub: license.id,
    did: license.device_id,
    plan: license.plan,
    iat: issuedAt,
    exp: issuedAt + 86400,
    iss: "youtube-insight-license-api",
    aud: "youtube-insight-client",
  }));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${base64Url(await signHmac(unsigned))}`;
}

export async function verifyLicenseToken(request: Request) {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Missing license token.");
  const [header, payload, signature, extra] = token.split(".");
  if (!header || !payload || !signature || extra) throw new Error("Invalid license token.");
  const expected = base64Url(await signHmac(`${header}.${payload}`));
  if (!constantTimeEqual(expected, signature)) throw new Error("Invalid license token.");
  const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
  const now = Math.floor(Date.now() / 1000);
  if (
    claims.exp <= now ||
    claims.iss !== "youtube-insight-license-api" ||
    claims.aud !== "youtube-insight-client" ||
    typeof claims.sub !== "string" ||
    typeof claims.did !== "string"
  ) throw new Error("License token expired.");
  return claims as { sub: string; did: string };
}

export async function requireAdmin(request: Request) {
  const supplied = request.headers.get("x-admin-key") ?? "";
  const expected = requiredSecret("LICENSE_ADMIN_KEY");
  if (!constantTimeEqual(supplied, expected)) throw new Error("Unauthorized.");
}

export function cleanCode(value: unknown) {
  const code = String(value ?? "").trim().toUpperCase();
  if (!/^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    throw new Error("Enter a valid access code.");
  }
  return code;
}

export function cleanDevice(value: unknown) {
  const device = String(value ?? "").trim();
  if (device.length < 16 || device.length > 256) throw new Error("Invalid device identifier.");
  return device;
}

export function isUsable(license: License) {
  return license.active && (!license.expires_at || new Date(license.expires_at).getTime() > Date.now());
}

export function publicLicense(license: License) {
  return {
    id: license.id,
    plan: license.plan,
    expiresAt: license.expires_at,
    active: license.active,
  };
}

export function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (byte) => alphabet[byte & 31]).join("").replace(/(.{4})(?=.)/g, "$1-");
}

export function licenseError(message: string, request?: Request) {
  if (message.includes("LICENSE_NOT_FOUND")) return json({ error: "Invalid access code." }, 404, request);
  if (message.includes("LICENSE_DISABLED")) return json({ error: "This access code has been disabled." }, 403, request);
  if (message.includes("LICENSE_EXPIRED")) return json({ error: "This access code has expired." }, 403, request);
  if (message.includes("DEVICE_MISMATCH")) return json({ error: "This access code is already active on another device." }, 409, request);
  return json({ error: message || "License request failed." }, 400, request);
}
