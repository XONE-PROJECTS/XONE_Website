"use client";

import { FormEvent, useState } from "react";

export function AdminLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
    if (!response.ok) { setError((await response.json()).error ?? "Unable to log in"); setBusy(false); return; }
    window.location.reload();
  }
  return <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12"><form onSubmit={submit} className="w-full space-y-5 rounded-2xl border bg-card p-6 shadow-sm"><div><h1 className="text-2xl font-bold">Admin login</h1><p className="mt-1 text-sm text-muted-foreground">Manage published Xone content.</p></div><label className="block text-sm font-medium">Email<input name="email" type="email" required className="mt-2 min-h-11 w-full rounded-md border bg-background px-3" /></label><label className="block text-sm font-medium">Password<input name="password" type="password" required className="mt-2 min-h-11 w-full rounded-md border bg-background px-3" /></label>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<button disabled={busy} className="min-h-11 w-full rounded-md bg-primary px-4 font-medium text-primary-foreground">{busy ? "Signing in…" : "Sign in"}</button></form></main>;
}
