"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { parseSiteContent, type SiteContent } from "../lib/content";
import { revisionSchema } from "../lib/contracts";

export function useCmsEditor() {
  const [content, setContent] = useState<SiteContent | null>(null), [published, setPublished] = useState<SiteContent | null>(null);
  const [saved, setSaved] = useState(""), [revision, setRevision] = useState(0), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState(""), [conflict, setConflict] = useState(false);
  const [history, setHistory] = useState<SiteContent[]>([]), [future, setFuture] = useState<SiteContent[]>([]);
  const current = useRef(content), version = useRef(0), saving = useRef(false), lastEdit = useRef({ time: 0, group: "" });
  const dirty = !!content && JSON.stringify(content) !== saved;
  const accept = useCallback((payload: unknown) => {
    if (!payload || typeof payload !== "object" || !("draft" in payload) || !("published" in payload) || !("revision" in payload)) throw new Error("Invalid CMS response");
    const draft = parseSiteContent(payload.draft), live = parseSiteContent(payload.published), nextRevision = revisionSchema.parse(payload.revision);
    version.current = nextRevision; setRevision(nextRevision); setPublished(live);
    return draft;
  }, []);
  useEffect(() => {
    let active = true;
    void fetch("/api/admin/content", { cache: "no-store" }).then(async response => {
      const payload = await response.json() as unknown;
      if (!response.ok) throw new Error(payload && typeof payload === "object" && "error" in payload ? String(payload.error) : "Unable to load CMS");
      if (!active) return;
      const draft = accept(payload); current.current = draft; setContent(draft); setSaved(JSON.stringify(draft));
    }).catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Unable to load CMS"); });
    return () => { active = false; };
  }, [accept]);
  const update = useCallback((next: SiteContent, group = "") => {
    const previous = current.current;
    if (!previous || JSON.stringify(previous) === JSON.stringify(next)) return;
    if (!group || group !== lastEdit.current.group || Date.now() - lastEdit.current.time > 600) setHistory(items => [...items.slice(-49), previous]);
    lastEdit.current = { time: Date.now(), group }; setFuture([]); current.current = next; setContent(next); setMessage("");
    if (!conflict) setError("");
  }, [conflict]);
  const save = useCallback(async (manual = false): Promise<boolean> => {
    const snapshot = current.current;
    if (!snapshot || saving.current || conflict) return false;
    let valid: SiteContent;
    try { valid = parseSiteContent(snapshot); }
    catch (reason: unknown) { setError(reason instanceof Error ? "Check the selected content before saving: " + reason.message.slice(0, 350) : "Invalid content"); return false; }
    saving.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: valid, revision: version.current, manual }) });
      const payload: unknown = await response.json();
      if (!response.ok) { if (response.status === 409) setConflict(true); throw new Error(payload && typeof payload === "object" && "error" in payload ? String(payload.error) : "Unable to save draft"); }
      accept(payload); setSaved(JSON.stringify(snapshot)); setMessage(manual ? "Draft saved. The live site has not changed." : ""); return true;
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Save failed. Retry to save your edits."); return false; }
    finally { saving.current = false; setBusy(false); }
  }, [accept, conflict]);
  useEffect(() => { if (!dirty || error || busy || conflict) return; const timer = setTimeout(() => void save(), 1000); return () => clearTimeout(timer); }, [content, dirty, error, busy, conflict, save]);
  useEffect(() => {
    const unload = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", unload); return () => window.removeEventListener("beforeunload", unload);
  }, [dirty]);
  function undo(): void { const previous = history.at(-1); if (!previous || !current.current) return; setFuture(items => [...items, current.current!]); setHistory(items => items.slice(0, -1)); current.current = previous; setContent(previous); lastEdit.current.group = ""; if (!conflict) setError(""); }
  function redo(): void { const next = future.at(-1); if (!next || !current.current) return; setHistory(items => [...items, current.current!]); setFuture(items => items.slice(0, -1)); current.current = next; setContent(next); lastEdit.current.group = ""; if (!conflict) setError(""); }
  async function publish(): Promise<void> {
    if (dirty || saving.current || conflict) return;
    saving.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: version.current }) });
      const payload: unknown = await response.json();
      if (!response.ok) { if (response.status === 409) setConflict(true); throw new Error(payload && typeof payload === "object" && "error" in payload ? String(payload.error) : "Publish failed"); }
      accept(payload); setMessage("Published successfully.");
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Publish failed"); } finally { saving.current = false; setBusy(false); }
  }
  async function restore(id: string): Promise<void> {
    if (dirty || saving.current || conflict) { setError("Save your current draft before restoring a revision."); return; }
    saving.current = true; setBusy(true);
    try {
      const response = await fetch("/api/admin/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, revision: version.current }) });
      const payload: unknown = await response.json();
      if (!response.ok) { if (response.status === 409) setConflict(true); throw new Error(payload && typeof payload === "object" && "error" in payload ? String(payload.error) : "Restore failed"); }
      const draft = accept(payload); if (current.current) setHistory(items => [...items.slice(-49), current.current!]); current.current = draft; setContent(draft); setSaved(JSON.stringify(draft)); setFuture([]); setError(""); setMessage("Revision restored to draft. Publish when ready.");
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Restore failed"); } finally { saving.current = false; setBusy(false); }
  }
  return { content, published, update, save, publish, restore, undo, redo, canUndo: history.length > 0, canRedo: future.length > 0, dirty, busy, error, setError, message, conflict, revision };
}
