"use client";

import { ChevronDown, ChevronRight, ExternalLink, Info, RefreshCw, Search, Settings, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createRecordSet, deleteHostedZone, deleteRecordSet, getApiErrorMessage, getHostedZone,
  getRecordSets, updateHostedZone,
} from "../../../../lib/api/client";
import type { HostedZone, RecordSet, RecordType } from "../../../../lib/schema/types";

const recordTypes: RecordType[] = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"];

export default function HostedZoneRecordsPage() {
  const params = useParams<{ zoneId: string }>();
  const router = useRouter();
  const zoneId = Number(params.zoneId);
  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<RecordSet[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [routingFilter, setRoutingFilter] = useState("");
  const [aliasFilter, setAliasFilter] = useState("");
  const [tab, setTab] = useState("records");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true); setError("");
    try {
      const [zoneData, zoneRecords] = await Promise.all([getHostedZone(zoneId), getRecordSets(zoneId)]);
      setZone(zoneData); setRecords(zoneRecords);
    } catch (reason) { setError(getApiErrorMessage(reason, "Unable to load hosted zone records.")); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [zoneId]);

  const visibleRecords = useMemo(() => records.filter((record) => {
    const haystack = `${record.name} ${record.record_type} ${record.routing_policy} ${record.values.join(" ")} ${record.alias_target || ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) &&
      (!typeFilter || record.record_type === typeFilter) &&
      (!routingFilter || record.routing_policy === routingFilter) &&
      (!aliasFilter || (aliasFilter === "yes" ? Boolean(record.alias_target) : !record.alias_target));
  }), [records, query, typeFilter, routingFilter, aliasFilter]);

  async function removeZone() {
    if (!zone || !window.confirm(`Delete hosted zone ${zone.name}? This action cannot be undone.`)) return;
    try { await deleteHostedZone(zone.id); router.push("/hosted-zones"); }
    catch (reason) { setError(getApiErrorMessage(reason, "Unable to delete hosted zone.")); }
  }
  async function removeRecord() {
    if (!selectedId || !window.confirm("Delete the selected record?")) return;
    try { await deleteRecordSet(zoneId, selectedId); setSelectedId(null); await load(); }
    catch (reason) { setError(getApiErrorMessage(reason, "Unable to delete record.")); }
  }

  if (loading && !zone) return <div className="records-page zones-page"><div className="table-state">Loading records...</div></div>;
  if (!zone) return <div className="records-page zones-page"><div className="console-error">{error || "Hosted zone not found."}</div></div>;

  return (
    <div className="records-page zones-page">
      <div className="records-zone-header">
        <div className="records-zone-title">
          <span className="zone-public-badge">{zone.private_zone ? "Private" : "Public"}</span>
          <h1>{zone.name}</h1><a href="#zone-info">Info</a>
        </div>
        <div className="records-actions">
          <button className="outline-button compact" onClick={() => void removeZone()}>Delete zone</button>
          <button className="outline-button compact" onClick={() => setError("Select a record to test DNS resolution.")}>Test record</button>
          <button className="outline-button compact" onClick={() => setError("Query logging configuration is not available in the current backend.")}>Configure query logging</button>
        </div>
      </div>
      {error && <div className="console-error">{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={15} /></button></div>}
      <section className="zone-summary-card" id="zone-info">
        <button className="zone-summary-toggle" onClick={() => setDetailsOpen(!detailsOpen)}><ChevronDown className={detailsOpen ? "rotate" : ""} size={18} /> Hosted zone details</button>
        {detailsOpen && <div className="zone-summary-content"><span>ID: Z{zone.id}</span><span>Description: {zone.comment || "-"}</span><span>Records: {records.length}</span><button className="outline-button compact" onClick={() => setModal("edit")}>Edit hosted zone</button></div>}
      </section>
      <div className="records-tabs">
        <button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>Records ({records.length})</button>
        <button className={tab === "recovery" ? "active" : ""} onClick={() => setTab("recovery")}>Accelerated recovery</button>
        <button className={tab === "dnssec" ? "active" : ""} onClick={() => setTab("dnssec")}>DNSSEC signing</button>
        <button className={tab === "tags" ? "active" : ""} onClick={() => setTab("tags")}>Hosted zone tags ({zone.tags.length})</button>
      </div>
      {tab !== "records" ? <div className="console-panel table-state"><strong>{tab === "tags" ? "Hosted zone tags" : tab === "dnssec" ? "DNSSEC signing" : "Accelerated recovery"}</strong><span>This feature is not available in the current backend.</span></div> :
        <section className="console-panel records-panel">
          <div className="records-section-heading"><div><h2>Records <span>({records.length})</span> <Info size={13} /></h2><p>Automatic mode is the current search behavior optimized for best filter results. <a href="#settings">To change modes, go to settings.</a></p></div><div className="records-actions"><button className="icon-action" onClick={() => void load()}><RefreshCw size={19} /></button><button className="outline-button compact" disabled={!selectedId} onClick={() => void removeRecord()}>Delete record</button><button className="outline-button compact">Import zone file</button><button className="create-zone-button" onClick={() => router.push(`/hosted-zones/${zoneId}/records/create`)}>Create record</button></div></div>
          <div className="records-toolbar"><div className="console-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter records by property or value" /></div><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}><option value="">Type</option>{recordTypes.map((type) => <option key={type}>{type}</option>)}</select><select className="routing-filter" value={routingFilter} onChange={(event) => setRoutingFilter(event.target.value)}><option value="">Routing policy</option><option value="simple">Simple</option></select><select value={aliasFilter} onChange={(event) => setAliasFilter(event.target.value)}><option value="">Alias</option><option value="yes">Yes</option><option value="no">No</option></select><button className="table-settings"><Settings size={18} /></button></div>
          <div className="table-scroll"><table className="records-data-table"><thead><tr><th /><th>Record name</th><th>Type</th><th>Routing policy</th><th>Differentiator</th><th>Alias</th><th>Value/Route traffic to</th><th>TTL (seconds)</th><th>Health check</th><th>Evaluate target health</th><th>Record identifier</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id} className={selectedId === record.id ? "selected-row" : ""}><td><input type="checkbox" checked={selectedId === record.id} onChange={() => setSelectedId(selectedId === record.id ? null : record.id)} /></td><td>{record.name}</td><td>{record.record_type}</td><td>{record.routing_policy}</td><td>-</td><td>{record.alias_target ? "Yes" : "No"}</td><td title={record.values.join(", ")}>{record.values.join(", ")}</td><td>{record.ttl.toLocaleString()}</td><td>{record.health_check_id || "-"}</td><td>-</td><td>-</td></tr>)}</tbody></table></div>
        </section>}
      {modal === "create" && <RecordModal zoneId={zoneId} onClose={() => setModal(null)} onSaved={() => { setModal(null); void load(); }} />}
      {modal === "edit" && <ZoneEditModal zone={zone} onClose={() => setModal(null)} onSaved={() => { setModal(null); void load(); }} />}
    </div>
  );
}

function RecordModal({ zoneId, onClose, onSaved }: { zoneId: number; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(""); const [type, setType] = useState<RecordType>("A"); const [ttl, setTtl] = useState("300"); const [value, setValue] = useState(""); const [error, setError] = useState(""); const [saving, setSaving] = useState(false);
  async function save(event: FormEvent) { event.preventDefault(); if (!name.trim() || !value.trim()) { setError("Record name and value are required."); return; } setSaving(true); try { await createRecordSet(zoneId, { name: name.trim(), record_type: type, ttl: Number(ttl) || 300, values: value.split("\n").map((item) => item.trim()).filter(Boolean), routing_policy: "simple" }); onSaved(); } catch (reason) { setError(getApiErrorMessage(reason, "Unable to create record.")); setSaving(false); } }
  return <div className="modal-backdrop"><form className="zone-modal" onSubmit={save}><div className="modal-title"><h2>Create record</h2><button type="button" onClick={onClose}><X size={19} /></button></div>{error && <div className="console-error">{error}</div>}<label>Record name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="example.com" /></label><label>Type<select value={type} onChange={(event) => setType(event.target.value as RecordType)}>{recordTypes.map((item) => <option key={item}>{item}</option>)}</select></label><label>TTL<input type="number" min="0" value={ttl} onChange={(event) => setTtl(event.target.value)} /></label><label>Value<textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="One value per line" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="create-zone-button" disabled={saving}>{saving ? "Creating..." : "Create record"}</button></div></form></div>;
}

function ZoneEditModal({ zone, onClose, onSaved }: { zone: HostedZone; onClose: () => void; onSaved: () => void }) {
  const [comment, setComment] = useState(zone.comment);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try { await updateHostedZone(zone.id, { comment }); onSaved(); }
    catch (reason) { setError(getApiErrorMessage(reason, "Unable to update hosted zone.")); setSaving(false); }
  }
  return <div className="modal-backdrop"><form className="zone-modal" onSubmit={save}><div className="modal-title"><h2>Edit hosted zone</h2><button type="button" onClick={onClose}><X size={19} /></button></div>{error && <div className="console-error">{error}</div>}<label>Hosted zone name<input value={zone.name} disabled /></label><label>Description<textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength={256} /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="create-zone-button" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button></div></form></div>;
}
