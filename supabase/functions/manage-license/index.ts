import { cleanCode, cors, db, json, requireAdmin } from "../_shared/license.ts";

const columns = "id, access_code, plan, active, duration_days, activated_at, expires_at, device_id, activation_count, notes, created_at";
Deno.serve(async (request: Request) => {
  const respond = (value: unknown, status = 200) => json(value, status, request);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);
  try {
    await requireAdmin(request);
    const body = await request.respond();
    const action = String(body.action ?? "search");
    if (action === "search") {
      const query = String(body.query ?? "").trim().toUpperCase().replace(/[%_,]/g, "");
      let search = db.from("licenses").select(columns).order("created_at", { ascending: false }).limit(200);
      if (query) search = search.ilike("access_code", `%${query}%`);
      const { data, error } = await search;
      if (error) throw error;
      return respond({ licenses: data ?? [] });
    }

    const code = cleanCode(body.accessCode);
    if (action === "delete") {
      const { data: license, error: findError } = await db.from("licenses").select("id").eq("access_code", code).maybeSingle();
      if (findError) throw findError;
      if (!license) return respond({ error: "License not found." }, 404);
      const { error: sessionError } = await db.from("license_sessions").delete().eq("license_id", license.id);
      if (sessionError) throw sessionError;
      const { error } = await db.from("licenses").delete().eq("id", license.id);
      if (error) throw error;
      return respond({ ok: true });
    }

    if (action === "enable" || action === "disable") {
      const { data, error } = await db.from("licenses")
        .update({ active: action === "enable", updated_at: new Date().toISOString() })
        .eq("access_code", code).select(columns).maybeSingle();
      if (error) throw error;
      if (!data) return respond({ error: "License not found." }, 404);
      return respond({ license: data });
    }

    if (action === "extend") {
      const days = Number(body.days);
      if (!Number.isInteger(days) || days < 1 || days > 36500) throw new Error("Invalid extension.");
      const { data: license, error: findError } = await db.from("licenses")
        .select("id, duration_days, activated_at, expires_at").eq("access_code", code).maybeSingle();
      if (findError) throw findError;
      if (!license) return respond({ error: "License not found." }, 404);
      const duration_days = (license.duration_days ?? 0) + days;
      let expires_at = license.expires_at;
      if (license.activated_at) {
        const currentExpiry = license.expires_at ? new Date(license.expires_at) : null;
        const now = new Date();
        const base = currentExpiry && currentExpiry > now ? currentExpiry : now;
        expires_at = new Date(base.getTime() + days * 86_400_000).toISOString();
      }
      const { data, error } = await db.from("licenses")
        .update({ duration_days, expires_at, updated_at: new Date().toISOString() })
        .eq("id", license.id).select(columns).single();
      if (error) throw error;
      return respond({ license: data });
    }

    throw new Error("Unknown action.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed.";
    return respond({ error: message }, message === "Unauthorized." ? 401 : 400);
  }
});
