import { cors, db, json, randomCode, requireAdmin } from "../_shared/license.ts";

const columns = "id, access_code, plan, active, duration_days, activated_at, expires_at, device_id, activation_count, notes, created_at";
Deno.serve(async (request: Request) => {
  const respond = (value: unknown, status = 200) => json(value, status, request);
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);
  try {
    await requireAdmin(request);
    const body = await request.json();
    const durationDays = body.durationDays === null ? null : Number(body.durationDays);
    if (durationDays !== null && (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 36500)) {
      throw new Error("Duration must be between 1 and 36,500 days.");
    }
    const plan = String(body.plan ?? "Premium").trim();
    const notes = body.notes == null ? null : String(body.notes).trim();
    if (!plan || plan.length > 80 || (notes && notes.length > 2000)) throw new Error("Invalid license details.");
    for (let attempt = 0; attempt < 4; attempt++) {
      const access_code = randomCode();
      const { data, error } = await db.from("licenses")
        .insert({ access_code, plan, duration_days: durationDays, notes })
        .select(columns)
        .single();
      if (!error) return respond({ license: data });
      if (error.code !== "23505") throw error;
    }
    throw new Error("Could not generate a unique access code.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Create failed.";
    return respond({ error: message }, message === "Unauthorized." ? 401 : 400);
  }
});
