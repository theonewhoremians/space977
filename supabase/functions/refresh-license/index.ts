import { cleanCode, cleanDevice, cors, db, isUsable, json, publicLicense, signLicense, type License } from "../_shared/license.ts";

Deno.serve(async (request: Request) => {
  const respond = (value: unknown, status = 200) => json(value, status, request);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);
  try {
    const body = await request.respond();
    const code = cleanCode(body.accessCode);
    const deviceId = cleanDevice(body.deviceId);
    const { data, error } = await db.from("licenses").select("*").eq("access_code", code).maybeSingle();
    if (error) throw error;
    const license = data as License | null;
    if (!license) return respond({ error: "Invalid access code." }, 404);
    if (!isUsable(license)) return respond({ error: license.active ? "This access code has expired." : "This access code has been disabled." }, 403);
    if (license.device_id !== deviceId) return respond({ error: "This access code is already active on another device." }, 409);
    return respond({
      token: await signLicense(license),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      license: publicLicense(license),
    });
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Refresh failed." }, 400);
  }
});
