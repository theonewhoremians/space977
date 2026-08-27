import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the access-code gate", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Creator Studio Analytics<\/title>/i);
  assert.match(html, /class="access-gate"/);
  assert.match(html, /Enter Access Code/);
  assert.match(html, /Checking your access/);
  assert.match(html, /youtube-studio-logo-white\.svg/);
});

test("server-renders the protected license admin route", async () => {
  const response = await render("/admin");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Access Code Admin/);
  assert.match(html, /Admin secret/);
  assert.match(html, /Enter LICENSE_ADMIN_KEY/);
  assert.doesNotMatch(html, /ADMIN_KEY=[A-Za-z0-9_-]{32,}/);
});

test("keeps privileged Supabase credentials out of browser code", async () => {
  const [supabaseClient, licenseClient, page] = await Promise.all([
    readFile(new URL("../lib/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/license.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(supabaseClient, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(supabaseClient, /service_role|secret_key/i);
  assert.match(licenseClient, /activate-license/);
  assert.match(licenseClient, /refresh-license/);
  assert.match(licenseClient, /license-status/);
  assert.match(licenseClient, /youtube-insight-device-id-v1/);
  assert.match(licenseClient, /const memoryStorage = new Map<string, string>\(\)/);
  assert.match(licenseClient, /LICENSE_REQUEST_TIMEOUT_MS = 10_000/);
  assert.match(licenseClient, /signal: controller\.signal/);
  assert.match(licenseClient, /window\.localStorage\.removeItem\(key\)/);
  assert.match(licenseClient, /A blocked storage API must never leave the access screen checking forever/);
  assert.match(page, /activateLicense/);
  assert.match(page, /getLicenseStatus/);
  assert.match(page, /const LICENSE_RECHECK_MS = 30_000/);
  assert.match(page, /const PHONE_TOP_GAP_PX = 32/);
  assert.match(page, /creator-studio-phone-top-gap-v1/);
  assert.match(page, /aria-pressed=\{topGapEnabled\}/);
  assert.match(page, /phone-top-gap/);
  assert.match(page, /checkInFlight = true;\s+try \{\s+const session = loadLicenseSession\(\)/);
  assert.match(page, /document\.visibilityState === "visible"/);
  assert.match(page, /canRefreshLicense\(error\)/);
  assert.match(page, /clearInterval\(intervalId\)/);
  assert.match(page, /<TopHeader avatarSrc=\{avatar\.src\}/);
  assert.match(page, /data-no-edit="true"/);
  assert.match(page, /contentEditable=\{false\}/);
});
