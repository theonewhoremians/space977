import { cleanCode, cors, db, json, requireAdmin } from "../_shared/license.ts";

Deno.serve(async (request: Request) => {
  const respond = (value: unknown, status = 200) => json(value, status, request);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);
  try {
    await requireAdmin(request);
    const body = await request.respond();
    const code = cleanCode(body.accessCode);
    const { data: license, error: findError } = await db.from("licenses").select("id").eq("access_code", code).maybeSingle();
    if (findError) throw findError;
    if (!license) return respond({ error: "License not found." }, 404);
    const { error: sessionError } = await db.from("license_sessions").delete().eq("license_id", license.id);
    if (sessionError) throw sessionError;
    const { data, error } = await db.from("licenses")
      .update({ device_id: null, activated_at: null, expires_at: null, updated_at: new Date().toISOString() })
      .eq("id", license.id)
      .select("id, access_code, plan, active, duration_days, activated_at, expires_at, device_id, activation_count, notes, created_at")
      .single();
    if (error) throw error;
    return respond({ license: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Reset failed.";
    return respond({ error: message }, message === "Unauthorized." ? 401 : 400);
  }
});
