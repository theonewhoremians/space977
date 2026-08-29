import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/", init = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
      ...init,
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

test("keeps the YouTube importer server-side", async () => {
  const response = await render("/api/youtube-import", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ channel: "@example" }),
  });
  assert.equal(response.status, 503);
  const payload = await response.json();
  assert.match(payload.error, /YOUTUBE_API_KEY/);
});

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
  const [supabaseClient, licenseClient, page, styles, youtubeRoute] = await Promise.all([
    readFile(new URL("../lib/supabase.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/license.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/api/youtube-import/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(supabaseClient, /VITE_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(supabaseClient, /service_role|secret_key/i);
  assert.match(licenseClient, /activate-license/);
  assert.match(licenseClient, /refresh-license/);
  assert.match(licenseClient, /license-status/);
  assert.match(licenseClient, /youtube-insight-device-id-v1/);
  assert.match(licenseClient, /const memoryStorage = new Map<string, string>\(\)/);
  assert.match(licenseClient, /SameSite=None; Secure; Partitioned/);
  assert.match(licenseClient, /document\.cookie/);
  assert.match(licenseClient, /isDefinitiveLicenseFailure/);
  assert.match(licenseClient, /licenseHasExpired/);
  assert.match(licenseClient, /LICENSE_REQUEST_TIMEOUT_MS = 10_000/);
  assert.match(licenseClient, /signal: controller\.signal/);
  assert.match(licenseClient, /window\.localStorage\.removeItem\(key\)/);
  assert.match(licenseClient, /A blocked storage API must never leave the access screen checking forever/);
  assert.match(page, /activateLicense/);
  assert.match(page, /getLicenseStatus/);
  assert.match(page, /const LICENSE_RECHECK_MS = 30_000/);
  assert.match(page, /const PHONE_TOP_GAP_PX = 32/);
  assert.match(page, /creator-studio-phone-top-gap-v1/);
  assert.match(page, /creator-studio-card-images-v1/);
  assert.match(page, /aria-pressed=\{topGapEnabled\}/);
  assert.match(page, /phone-top-gap/);
  assert.match(page, /viewsShadow/);
  assert.match(page, /onShadowChange/);
  assert.match(page, /gray points for the shadow/);
  assert.doesNotMatch(page, /stroke="rgba\(180,180,180,\.7\)"/);
  assert.match(page, /className="engagement-stats" role="button"/);
  assert.match(page, /\/ui-icons\/likes-studio-provided\.png/);
  assert.match(page, /className="provided-like-icon"/);
  assert.doesNotMatch(page, /<span>Notices<\/span><strong><SvgIcon name="detail-info"/);
  assert.match(page, /<h2>Video performance<\/h2>/);
  assert.match(page, /PerformanceRow label="Ranking by views" value=\{video\.ranking\} status="right"/);
  assert.match(page, /PerformanceRow label="Average percentage viewed" value=\{video\.average\} status="down"/);
  assert.match(page, /PerformanceRow label="Likes" value=\{video\.likes\} status="success"/);
  assert.doesNotMatch(page, /detail-analytics-card/);
  assert.doesNotMatch(page, /aria-label="Open video analytics"/);
  assert.match(page, /aria-label="Open video performance analytics"/);
  assert.match(page, /tabIndex=\{editMode \? -1 : 0\}/);
  assert.match(page, /onOpenAnalytics=\{openVideoAnalytics\}/);
  assert.match(page, /const selector = "h1,h2,h3,p,span,strong,b,small"/);
  assert.match(page, /values\?\.length === elements\.length/);
  assert.match(page, /newly added sections cannot inherit labels/);
  assert.match(page, /checkInFlight = true;\s+try \{\s+const session = loadLicenseSession\(\)/);
  assert.match(page, /document\.visibilityState === "visible"/);
  assert.match(page, /canRefreshLicense\(error\)/);
  assert.match(page, /isDefinitiveLicenseFailure\(error\)/);
  assert.match(page, /Keep a locally valid activation during temporary network or relay failures/);
  assert.match(page, /clearInterval\(intervalId\)/);
  assert.match(page, /<TopHeader avatarSrc=\{avatar\.src\}/);
  assert.match(page, /data-no-edit="true"/);
  assert.match(page, /contentEditable=\{false\}/);
  assert.match(page, /aria-label=\{importing \? "Importing YouTube channel" : "Import YouTube channel"\}/);
  assert.match(page, /fetch\("\/api\/youtube-import"/);
  assert.match(page, /payload\.videos\.slice\(0, 3\)/);
  assert.match(page, /youtubeImportStorageKey/);
  assert.match(youtubeRoute, /process\.env\.YOUTUBE_API_KEY/);
  assert.match(youtubeRoute, /order: "date", maxResults: "3"/);
  assert.match(youtubeRoute, /part: "snippet,statistics"/);
  assert.match(styles, /:root h1,\s*:root h2 \{ font-weight:980; \}/);
  assert.match(styles, /:root h3 \{ font-weight:560; \}/);
});
