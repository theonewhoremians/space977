import { cors, db, isUsable, json, publicLicense, verifyLicenseToken, type License } from "../_shared/license.ts";

Deno.serve(async (request: Request) => {
  const respond = (value: unknown, status = 200) => json(value, status, request);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "GET") return respond({ error: "Method not allowed." }, 405);
  try {
    const claims = await verifyLicenseToken(request);
    const { data, error } = await db.from("licenses").select("*").eq("id", claims.sub).maybeSingle();
    if (error) throw error;
    const license = data as License | null;
    if (!license || license.device_id !== claims.did || !isUsable(license)) {
      return respond({ error: "License is not active." }, 403);
    }
    return respond(publicLicense(license));
  } catch (error) {
    return respond({ error: error instanceof Error ? error.message : "Status check failed." }, 401);
  }
});
