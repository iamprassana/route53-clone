"use client";

import { ChevronDown, ChevronRight, Info, Plus, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createRecordSet, getApiErrorMessage, getHostedZone, getRecordSets } from "../../../../../../lib/api/client";
import type { HostedZone, RecordSet, RecordType } from "../../../../../../lib/schema/types";

const recordTypes: RecordType[] = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"];

type Draft = {
  name: string;
  type: RecordType;
  alias: boolean;
  value: string;
  ttl: string;
  routing: "simple";
  open: boolean;
};

const initialDraft = (): Draft => ({
  name: "",
  type: "A",
  alias: false,
  value: "",
  ttl: "300",
  routing: "simple",
  open: true,
});

export default function CreateRecordPage() {
  const { zoneId: rawZoneId } = useParams<{ zoneId: string }>();
  const zoneId = Number(rawZoneId);
  const router = useRouter();
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<RecordSet[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([initialDraft()]);
  const [existingOpen, setExistingOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getHostedZone(zoneId), getRecordSets(zoneId)])
      .then(([zoneData, recordData]) => { setZone(zoneData); setRecords(recordData); })
      .catch((reason) => setError(getApiErrorMessage(reason, "Unable to load hosted zone records.")));
  }, [zoneId]);

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase();
    return records.filter((record) =>
      `${record.name} ${record.record_type} ${record.routing_policy} ${record.values.join(" ")}`
        .toLowerCase()
        .includes(value),
    );
  }, [records, search]);

  function updateDraft(index: number, changes: Partial<Draft>) {
    setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, ...changes } : draft));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = drafts.some((draft) => !draft.name.trim() || !draft.value.trim() || !Number.isInteger(Number(draft.ttl)) || Number(draft.ttl) < 0);
    if (invalid) {
      setError("Enter a record name, value, and a valid TTL for every record.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await Promise.all(drafts.map((draft) => createRecordSet(zoneId, {
        name: draft.name.trim(),
        record_type: draft.type,
        ttl: Number(draft.ttl),
        values: draft.value.split("\n").map((value) => value.trim()).filter(Boolean),
        routing_policy: draft.routing,
        alias_target: draft.alias ? draft.value.trim() : null,
      })));
      router.push(`/hosted-zones/${zoneId}`);
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Unable to create records."));
      setSaving(false);
    }
  }

  if (!zone) {
    return <div className="create-record-page">{error ? <div className="console-error">{error}</div> : <div className="table-state">Loading record form...</div>}</div>;
  }

  return (
    <div className="create-record-page">
      <div className="create-record-title"><h1>Create record</h1><span>Info</span></div>
      <form onSubmit={submit}>
        <section className="quick-record-panel">
          <div className="quick-record-heading"><h2>Quick create record</h2><button type="button" className="text-link">Switch to wizard</button></div>
          {error && <div className="console-error">{error}<button type="button" onClick={() => setError("")} aria-label="Dismiss"><X size={15} /></button></div>}
          {drafts.map((draft, index) => (
            <article className="record-draft" key={index}>
              <div className="record-draft-heading">
                <button type="button" className="record-collapse" onClick={() => updateDraft(index, { open: !draft.open })}>
                  {draft.open ? <ChevronDown size={15} /> : <ChevronRight size={15} />} Record {index + 1}
                </button>
                {drafts.length > 1 && <button type="button" className="outline-button compact" onClick={() => setDrafts((current) => current.filter((_, draftIndex) => draftIndex !== index))}><Trash2 size={14} /> Delete</button>}
              </div>
              {draft.open && <div className="record-draft-body">
                <div className="record-form-grid">
                  <label>Record name <span>Info</span><div className="record-name-input"><input value={draft.name} onChange={(event) => updateDraft(index, { name: event.target.value })} placeholder="subdomain" /><em>{zone.name}</em></div><small>Keep blank to create a record for the root domain.</small></label>
                  <label>Record type <span>Info</span><select value={draft.type} onChange={(event) => updateDraft(index, { type: event.target.value as RecordType })}>{recordTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
                </div>
                <label className="alias-toggle"><input type="checkbox" checked={draft.alias} onChange={(event) => updateDraft(index, { alias: event.target.checked })} /><span>Alias</span></label>
                <label>Value <span>Info</span><textarea value={draft.value} onChange={(event) => updateDraft(index, { value: event.target.value })} placeholder={draft.alias ? "Alias target" : "192.0.2.235"} /><small>Enter multiple values on separate lines.</small></label>
                <div className="record-form-grid">
                  <label>TTL (seconds) <span>Info</span><div className="ttl-row"><input type="number" min="0" value={draft.ttl} onChange={(event) => updateDraft(index, { ttl: event.target.value })} /><button type="button" onClick={() => updateDraft(index, { ttl: "60" })}>1m</button><button type="button" onClick={() => updateDraft(index, { ttl: "3600" })}>1h</button><button type="button" onClick={() => updateDraft(index, { ttl: "86400" })}>1d</button></div><small>Recommended values: 60 to 172800 (two days)</small></label>
                  <label>Routing policy <span>Info</span><select value={draft.routing} onChange={(event) => updateDraft(index, { routing: event.target.value as "simple" })}><option value="simple">Simple routing</option></select></label>
                </div>
              </div>}
            </article>
          ))}
          <div className="add-record-row"><button type="button" className="outline-button compact" onClick={() => setDrafts((current) => [...current, initialDraft()])}><Plus size={14} /> Add another record</button></div>
        </section>
        <div className="create-record-actions"><button type="button" className="text-link" onClick={() => router.back()}>Cancel</button><button className="create-zone-button" disabled={saving}>{saving ? "Creating..." : "Create records"}</button></div>
      </form>
      <section className={existingOpen ? "existing-records-section focused" : "existing-records-section"}>
        <button type="button" className="existing-records-toggle" onClick={() => setExistingOpen(!existingOpen)}>{existingOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />} View existing records</button>
        {existingOpen && <><p>The following table lists the existing records in {zone.name}.</p><div className="existing-records-panel"><div className="records-section-heading"><h2>Existing records <span>({records.length})</span> <Info size={13} /></h2></div><div className="records-toolbar"><div className="console-search"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter records by property or value" /></div><select><option>Type</option></select><select><option>Routing policy</option></select><select><option>Alias</option></select></div><div className="table-scroll"><table className="records-data-table"><thead><tr><th /><th>Record name</th><th>Type</th><th>Routing policy</th><th>Differentiator</th><th>Alias</th><th>Value/Route traffic to</th><th>TTL (seconds)</th><th>Health check</th><th>Evaluate target health</th><th>Record identifier</th></tr></thead><tbody>{filteredRecords.map((record) => <tr key={record.id}><td><input type="checkbox" /></td><td>{record.name}</td><td>{record.record_type}</td><td>{record.routing_policy}</td><td>-</td><td>{record.alias_target ? "Yes" : "No"}</td><td>{record.values.join(", ")}</td><td>{record.ttl.toLocaleString()}</td><td>{record.health_check_id || "-"}</td><td>-</td><td>-</td></tr>)}</tbody></table></div></div></>}
      </section>
    </div>
  );
}
