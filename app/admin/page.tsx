"use client";

import { FormEvent, useCallback, useState } from "react";
import { supabase } from "../../lib/supabase";

type License = {
  id: string;
  access_code: string;
  plan: string;
  active: boolean;
  duration_days: number | null;
  activated_at: string | null;
  expires_at: string | null;
  device_id: string | null;
  activation_count: number;
  notes: string | null;
  created_at: string;
};

type FunctionResponse = {
  error?: string;
  license?: License;
  licenses?: License[];
  ok?: boolean;
};

const durationOptions = [
  ["1 day", "1"],
  ["7 days", "7"],
  ["30 days", "30"],
  ["90 days", "90"],
  ["180 days", "180"],
  ["1 year", "365"],
  ["Custom", "custom"],
  ["Lifetime", "lifetime"],
] as const;

function expiryLabel(license: License) {
  if (license.duration_days === null) return "Lifetime";
  if (!license.expires_at) return `${license.duration_days} days · starts on activation`;
  const remaining = Math.max(
    0,
    Math.ceil((new Date(license.expires_at).getTime() - Date.now()) / 86_400_000),
  );
  return `${new Date(license.expires_at).toLocaleDateString()} · ${remaining} days left`;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState("Premium");
  const [duration, setDuration] = useState("30");
  const [customDays, setCustomDays] = useState("30");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [busy, setBusy] = useState("");

  const invoke = useCallback(async (name: string, body: unknown) => {
    if (!supabase) throw new Error("Youtube Insight access service is not configured.");
    const { data, error } = await supabase.functions.invoke<FunctionResponse>(name, {
      method: "POST",
      body,
      headers: { "x-admin-key": adminKey.trim() },
    });
    if (error) {
      let serverMessage = "";
      const response = (error as { context?: Response }).context;
      if (response) {
        try {
          serverMessage = ((await response.clone().json()) as { error?: string }).error ?? "";
        } catch {
          // The SDK message below is used when the response is not JSON.
        }
      }
      throw new Error(serverMessage || data?.error || error.message);
    }
    if (data?.error) throw new Error(data.error);
    return data ?? {};
  }, [adminKey]);

  const loadLicenses = useCallback(async (search = query) => {
    if (!adminKey.trim()) {
      setNotice("Enter the admin secret first.");
      return;
    }
    setBusy("load");
    try {
      const data = await invoke("manage-license", { action: "search", query: search });
      setLicenses(data.licenses ?? []);
      setAuthenticated(true);
      setNotice("");
    } catch (error) {
      setAuthenticated(false);
      setNotice(error instanceof Error ? error.message : "Could not load licenses.");
    } finally {
      setBusy("");
    }
  }, [adminKey, invoke, query]);

  async function createLicense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const durationDays = duration === "lifetime"
      ? null
      : Number(duration === "custom" ? customDays : duration);
    if (durationDays !== null && (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 36500)) {
      setNotice("Duration must be between 1 and 36,500 days.");
      return;
    }
    setBusy("create");
    try {
      const data = await invoke("create-license", { plan, durationDays, notes });
      if (!data.license) throw new Error("No license was returned.");
      setLicenses((current) => [data.license!, ...current]);
      setCreatedCode(data.license.access_code);
      setNotice(`Created ${data.license.access_code}`);
      setNotes("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Creation failed.");
    } finally {
      setBusy("");
    }
  }

  function replaceLicense(updated: License) {
    setLicenses((current) => current.map((item) =>
      item.access_code === updated.access_code ? updated : item,
    ));
  }

  async function manage(license: License, action: string, days?: number) {
    if (busy) return;
    setBusy(`${license.access_code}:${action}`);
    try {
      const functionName = action === "reset" ? "reset-device" : "manage-license";
      const body = action === "reset"
        ? { accessCode: license.access_code }
        : { action, accessCode: license.access_code, days };
      const data = await invoke(functionName, body);
      if (action === "delete") {
        setLicenses((current) => current.filter((item) => item.id !== license.id));
        setNotice(`Deleted ${license.access_code}`);
      } else if (data.license) {
        replaceLicense(data.license);
        setNotice(action === "reset" ? "Device binding reset." : "License updated.");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusy("");
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setNotice("Access code copied.");
  }

  return (
    <main className="license-admin">
      <section className="admin-shell">
        <header className="admin-header">
          <div>
            <p>Youtube Insight</p>
            <h1>Access Code Admin</h1>
          </div>
          <a href="/">Return to app</a>
        </header>

        <section className="admin-panel admin-key-panel">
          <label htmlFor="admin-key">Admin secret</label>
          <div className="admin-inline">
            <input
              id="admin-key"
              type="password"
              autoComplete="off"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="Enter LICENSE_ADMIN_KEY"
            />
            <button type="button" onClick={() => void loadLicenses("")} disabled={busy === "load"}>
              {busy === "load" ? "Checking…" : authenticated ? "Reload" : "Unlock"}
            </button>
          </div>
        </section>

        {notice && <p className="admin-notice" role="status">{notice}</p>}

        {authenticated && (
          <>
            <form className="admin-panel admin-create" onSubmit={createLicense}>
              <div className="admin-panel-title">
                <div>
                  <p>Code generator</p>
                  <h2>Create timed access</h2>
                </div>
                <span>Starts on first activation</span>
              </div>

              <div className="admin-form-grid">
                <label>
                  Plan name
                  <input value={plan} onChange={(event) => setPlan(event.target.value)} maxLength={80} />
                </label>
                <label>
                  Duration
                  <select value={duration} onChange={(event) => setDuration(event.target.value)}>
                    {durationOptions.map(([label, value]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                {duration === "custom" && (
                  <label>
                    Custom days
                    <input
                      type="number"
                      min="1"
                      max="36500"
                      value={customDays}
                      onChange={(event) => setCustomDays(event.target.value)}
                    />
                  </label>
                )}
                <label className="admin-notes-field">
                  Notes (optional)
                  <input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} />
                </label>
              </div>
              <button className="admin-primary" disabled={busy === "create"}>
                {busy === "create" ? "Generating…" : "Generate access code"}
              </button>
            </form>

            {createdCode && (
              <section className="admin-created">
                <p>New access code</p>
                <strong>{createdCode}</strong>
                <button type="button" onClick={() => void copyCode(createdCode)}>Copy</button>
              </section>
            )}

            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <p>License control</p>
                  <h2>Generated codes</h2>
                </div>
                <span>{licenses.length} shown</span>
              </div>
              <form className="admin-search" onSubmit={(event) => { event.preventDefault(); void loadLicenses(); }}>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search access code" />
                <button disabled={busy === "load"}>Search</button>
              </form>

              <div className="admin-license-list">
                {licenses.map((license) => {
                  const pending = busy.startsWith(`${license.access_code}:`);
                  return (
                    <article className="admin-license-card" key={license.id}>
                      <div className="admin-license-topline">
                        <button type="button" className="admin-code" onClick={() => void copyCode(license.access_code)}>
                          {license.access_code}
                        </button>
                        <span className={license.active ? "is-active" : "is-disabled"}>
                          {license.active ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <div className="admin-license-meta">
                        <span>{license.plan}</span>
                        <span>{expiryLabel(license)}</span>
                        <span>{license.device_id ? "Device bound" : "Not activated"}</span>
                      </div>
                      <div className="admin-actions">
                        <button type="button" disabled={pending} onClick={() => void manage(license, license.active ? "disable" : "enable")}>
                          {license.active ? "Disable" : "Enable"}
                        </button>
                        {license.duration_days !== null && <button type="button" disabled={pending} onClick={() => void manage(license, "extend", 30)}>+30 days</button>}
                        <button type="button" disabled={pending} onClick={() => void manage(license, "reset")}>Reset device</button>
                        <button
                          type="button"
                          className="admin-danger"
                          disabled={pending}
                          onClick={() => { if (window.confirm(`Delete ${license.access_code}?`)) void manage(license, "delete"); }}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
