import { cleanCode, cleanDevice, cors, db, json, licenseError, publicLicense, signLicense, type License } from "../_shared/license.ts";

Deno.serve(async (request: Request) => {
  const respond = (value: unknown, status = 200) => json(value, status, request);
  const fail = (message: string) => licenseError(message, request);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);
  try {
    const body = await request.json();
    const accessCode = cleanCode(body.accessCode);
    const deviceId = cleanDevice(body.deviceId);
    const { data, error } = await db.rpc("activate_license", {
      p_access_code: accessCode,
      p_device_id: deviceId,
    });
    if (error) return fail(error.message);
    const license = (Array.isArray(data) ? data[0] : data) as License | null;
    if (!license) return respond({ error: "Invalid access code." }, 404);
    return respond({
      token: await signLicense(license),
      expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
      license: publicLicense(license),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Activation failed.");
  }
});
