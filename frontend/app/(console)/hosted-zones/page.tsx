"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Settings,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  createHostedZone,
  deleteHostedZone,
  getApiErrorMessage,
  getHostedZones,
  updateHostedZone,
} from "../../../lib/api/client";
import type { HostedZone, ZoneType } from "../../../lib/schema/types";

const PAGE_SIZE = 50;

export default function HostedZonesPage() {
  const router = useRouter();
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedHostedZone, setSelectedHostedZone] = useState<HostedZone | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editingZone, setEditingZone] = useState<HostedZone | null>(null);
  const canAct = selectedHostedZone !== null;
  const hasNextPage = zones.length === PAGE_SIZE;

  async function loadZones(nextPage = page, value = search) {
    setLoading(true);
    setError("");
    try {
      const result = await getHostedZones(value, nextPage, PAGE_SIZE);
      setZones(result);
      setPage(nextPage);
      setSelectedHostedZone(null);
      setIsDetailsPanelOpen(false);
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Unable to load hosted zones."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(() => loadZones(1, ""));
  }, []);

  function selectZone(zone: HostedZone) {
    setSelectedHostedZone(zone);
    setIsDetailsPanelOpen(true);
  }

  function openEdit() {
    if (selectedHostedZone) {
      setEditingZone(selectedHostedZone);
      setModal("edit");
    }
  }

  async function removeSelected() {
    if (!selectedHostedZone) return;
    if (!window.confirm(`Delete hosted zone ${selectedHostedZone.name}?`)) return;

    setLoading(true);
    setError("");
    try {
      await deleteHostedZone(selectedHostedZone.id);
      await loadZones(page);
    } catch (reason) {
      setLoading(false);
      setError(getApiErrorMessage(reason, "Unable to delete hosted zone."));
    }
  }

  function searchZones(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadZones(1, search);
  }

  return (
    <div className="zones-page">
      <div className={isDetailsPanelOpen && selectedHostedZone ? "zones-layout details-open" : "zones-layout"}>
        <div className="zones-content">
          <div className="zones-page-heading">
            <div>
              <h1>
                Hosted zones <span className="count">({zones.length})</span>
              </h1>
              <p>
                Automatic mode is the current search behavior optimized for best filter
                results.{" "}
                <a href="#search-settings" onClick={(event) => event.preventDefault()}>
                  To change modes, go to settings.
                </a>
              </p>
            </div>
            <div className="zones-actions">
              <button
                className="icon-action"
                onClick={() => void loadZones()}
                disabled={loading}
                aria-label="Refresh hosted zones"
                title="Refresh"
              >
                <RefreshCw size={20} className={loading ? "spin" : ""} />
              </button>
              <button className="outline-button compact" disabled={!canAct} onClick={() => setIsDetailsPanelOpen(true)}>
                <Eye size={16} /> View details
              </button>
              <button className="outline-button compact" disabled={!canAct} onClick={openEdit}>
                Edit
              </button>
              <button className="outline-button compact" disabled={!canAct} onClick={() => void removeSelected()}>
                Delete
              </button>
              <button className="create-zone-button" onClick={() => router.push("/hosted-zones/create")}>
                Create hosted zone
              </button>
            </div>
          </div>

          {error && (
            <div className="console-error">
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button>
            </div>
          )}

          <section className="console-panel zones-panel">
        <div className="zones-toolbar">
          <form onSubmit={searchZones}>
            <div className="console-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter records by property or value"
                aria-label="Filter hosted zones"
              />
            </div>
          </form>
          <div className="table-controls">
            <div className="zones-pagination">
              <button aria-label="Previous page" disabled={page === 1 || loading} onClick={() => void loadZones(page - 1)}>
                <ChevronLeft size={18} />
              </button>
              <span>{page}</span>
              <button aria-label="Next page" disabled={!hasNextPage || loading} onClick={() => void loadZones(page + 1)}>
                <ChevronRight size={18} />
              </button>
            </div>
            <button className="table-settings" aria-label="Table settings" title="Table settings">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading hosted zones...</div>
        ) : zones.length === 0 ? (
          <div className="table-state">
            <strong>No hosted zones</strong>
            <span>Create a hosted zone to get started.</span>
            <button className="create-zone-button" onClick={() => router.push("/hosted-zones/create")}>
              <Plus size={16} /> Create hosted zone
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="zones-table">
              <thead>
                <tr>
                  <th aria-label="Selection" />
                  <th>Hosted zone name</th>
                  <th>Type</th>
                  <th>Created by</th>
                  <th>Record count</th>
                  <th>Description</th>
                  <th>Hosted zone ID</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => {
                  const selected = zone.id === selectedHostedZone?.id;
                  return (
                    <tr key={zone.id} className={selected ? "selected-row" : ""} onClick={() => selectZone(zone)}>
                      <td>
                        <input
                          type="radio"
                          name="selected-zone"
                          checked={selected}
                          onChange={() => selectZone(zone)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Select ${zone.name}`}
                        />
                      </td>
                      <td>
                        <Link className="link-button" href={`/hosted-zones/${zone.id}`} onClick={(event) => event.stopPropagation()}>
                          {zone.name}
                        </Link>
                      </td>
                      <td>{zone.private_zone ? "Private" : "Public"}</td>
                      <td>Route 53</td>
                      <td>{zone.record_count}</td>
                      <td>{zone.comment || "-"}</td>
                      <td className="zone-id" title={`Z${zone.id}`}>Z{zone.id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

          </section>
        </div>

        {isDetailsPanelOpen && selectedHostedZone && (
          <ZoneDetails zone={selectedHostedZone} onClose={() => setIsDetailsPanelOpen(false)} />
        )}
      </div>

      {modal === "edit" && editingZone && (
        <ZoneModal
          zone={editingZone}
          onClose={() => { setModal(null); setEditingZone(null); }}
          onSaved={() => { setModal(null); setEditingZone(null); void loadZones(); }}
        />
      )}
    </div>
  );
}

function ZoneModal({
  zone,
  onClose,
  onSaved,
}: {
  zone?: HostedZone;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(zone?.name ?? "");
  const [comment, setComment] = useState(zone?.comment ?? "");
  const [type, setType] = useState<ZoneType>(zone?.zone_type ?? "public");
  const [tags, setTags] = useState(zone?.tags.join(", ") ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const input = { name, comment, zone_type: type, tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean) };
      if (zone) await updateHostedZone(zone.id, input);
      else await createHostedZone(input);
      onSaved();
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Unable to save hosted zone."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <form className="zone-modal" onSubmit={save}>
        <div className="modal-title">
          <h2>{zone ? "Edit hosted zone" : "Create hosted zone"}</h2>
          <button type="button" onClick={onClose} aria-label="Close"><X size={19} /></button>
        </div>
        {error && <div className="console-error">{error}</div>}
        <label>Domain name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="example.com" /></label>
        <label>Comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={3} /></label>
        <label>Tags<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="tag1, tag2" /></label>
        <fieldset>
          <legend>Hosted zone type</legend>
          <label className="radio"><input type="radio" checked={type === "public"} onChange={() => setType("public")} /> Public hosted zone</label>
          <label className="radio"><input type="radio" checked={type === "private"} onChange={() => setType("private")} /> Private hosted zone</label>
        </fieldset>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="create-zone-button" disabled={saving}>{saving ? "Saving..." : zone ? "Save changes" : "Create hosted zone"}</button>
        </div>
      </form>
    </div>
  );
}

function ZoneDetails({ zone, onClose }: { zone: HostedZone; onClose: () => void }) {
  return (
    <aside className="zone-details">
      <div className="zone-details-header">
        <h2>Hosted zone details</h2>
        <div className="zone-details-controls">
          <Settings size={18} />
          <button onClick={onClose} aria-label="Close details"><ChevronRight size={22} /></button>
        </div>
      </div>
      <div className="zone-details-body">
        <dl>
          <dt>Hosted zone name</dt><dd>{zone.name || "-"}</dd>
          <dt>Hosted zone ID</dt><dd>Z{zone.id}</dd>
          <dt>Description</dt><dd>{zone.comment || "-"}</dd>
          <dt>Query log</dt><dd>-</dd>
          <dt>Type</dt><dd>{zone.private_zone ? "Private hosted zone" : "Public hosted zone"}</dd>
          <dt>Record count</dt><dd>{zone.record_count}</dd>
          <dt>Name servers</dt>
          <dd><ul><li>-</li></ul></dd>
        </dl>
        <Link className="details-link" href={`/hosted-zones/${zone.id}`} onClick={onClose}>
          Open records <ExternalLink size={15} />
        </Link>
      </div>
    </aside>
  );
}
