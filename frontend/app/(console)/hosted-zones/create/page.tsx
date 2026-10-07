"use client";

import { Info, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createHostedZone, getApiErrorMessage } from "../../../../lib/api/client";
import type { ZoneType } from "../../../../lib/schema/types";

type Tag = { key: string; value: string };

const domainPattern = /^(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.?$/;

export default function CreateHostedZonePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ZoneType>("public");
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [saving, setSaving] = useState(false);

  function validateName(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "Enter a domain name.";
    if (!domainPattern.test(trimmed)) return "Enter a valid domain name.";
    return "";
  }

  function addTag() {
    if (tags.length < 50) setTags((current) => [...current, { key: "", value: "" }]);
  }

  function updateTag(index: number, field: keyof Tag, value: string) {
    setTags((current) => current.map((tag, tagIndex) => tagIndex === index ? { ...tag, [field]: value } : tag));
  }

  function removeTag(index: number) {
    setTags((current) => current.filter((_, tagIndex) => tagIndex !== index));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    const validationError = validateName(name);
    setNameError(validationError);
    if (validationError) return;
    if (tags.some((tag) => !tag.key.trim() || !tag.value.trim())) {
      setError("Complete both the key and value for each tag.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createHostedZone({
        name: trimmedName,
        comment: description,
        zone_type: type,
        tags: tags.map((tag) => `${tag.key.trim()}=${tag.value.trim()}`),
      });
      router.push("/hosted-zones");
    } catch (reason) {
      setError(getApiErrorMessage(reason, "Unable to create hosted zone."));
      setSaving(false);
    }
  }

  return (
    <div className="create-zone-page">
      <nav className="create-zone-breadcrumbs" aria-label="Breadcrumb">
        <span>Route 53</span><b>›</b><a href="/hosted-zones">Hosted zones</a><b>›</b><strong>Create hosted zone</strong>
      </nav>
      <form onSubmit={submit}>
        <div className="create-zone-title">
          <h1>Create hosted zone</h1><Info size={15} aria-label="Information" />
        </div>
        {error && <div className="console-error">{error}</div>}

        <section className="create-zone-card">
          <h2>Hosted zone configuration</h2>
          <p className="create-zone-intro">A hosted zone is a container that holds information about how you want to route traffic for a domain, such as example.com, and its subdomains.</p>

          <FormLabel title="Domain name" />
          <p className="create-zone-help">This is the name of the domain that you want to route traffic for.</p>
          <input className={nameError ? "create-zone-input input-error" : "create-zone-input"} value={name} onChange={(event) => { setName(event.target.value); setNameError(""); }} placeholder="example.com" aria-label="Domain name" />
          {nameError ? <p className="create-zone-error">{nameError}</p> : <p className="create-zone-help">Valid characters: a-z, 0-9, '-', '.', and '_'</p>}

          <FormLabel title="Description - optional" />
          <p className="create-zone-help">This value lets you distinguish hosted zones that have the same name.</p>
          <textarea className="create-zone-input create-zone-description" value={description} maxLength={256} onChange={(event) => setDescription(event.target.value)} placeholder="The hosted zone is used for..." aria-label="Description" />
          <p className="create-zone-counter">{description.length}/256</p>

          <FormLabel title="Type" />
          <p className="create-zone-help">The type indicates whether you want to route traffic on the internet or in an Amazon VPC.</p>
          <div className="zone-type-options">
            <ZoneTypeOption selected={type === "public"} title="Public hosted zone" description="A public hosted zone determines how traffic is routed on the internet." onClick={() => setType("public")} />
            <ZoneTypeOption selected={type === "private"} title="Private hosted zone" description="A private hosted zone determines how traffic is routed within an Amazon VPC." onClick={() => setType("private")} />
          </div>
        </section>

        <section className="create-zone-card tags-card">
          <h2>Tags <Info size={14} /></h2>
          <p className="create-zone-intro">Apply tags to hosted zones to help organize and identify them.</p>
          {tags.length === 0 && <p className="create-zone-help">No tags associated with the resource.</p>}
          {tags.map((tag, index) => (
            <div className="tag-row" key={index}>
              <input className="create-zone-input" value={tag.key} onChange={(event) => updateTag(index, "key", event.target.value)} placeholder="Key" aria-label={`Tag ${index + 1} key`} />
              <input className="create-zone-input" value={tag.value} onChange={(event) => updateTag(index, "value", event.target.value)} placeholder="Value" aria-label={`Tag ${index + 1} value`} />
              <button type="button" className="tag-remove" onClick={() => removeTag(index)} aria-label={`Remove tag ${index + 1}`}><Minus size={16} /></button>
            </div>
          ))}
          <button type="button" className="add-tag-button" onClick={addTag} disabled={tags.length >= 50}><Plus size={15} /> Add tag</button>
          <p className="create-zone-help">You can add up to {50 - tags.length} more tags.</p>
        </section>

        <div className="create-zone-actions">
          <button type="button" className="create-zone-cancel" onClick={() => router.push("/hosted-zones")}>Cancel</button>
          <button className="create-zone-button" disabled={saving}>{saving ? "Creating..." : "Create hosted zone"}</button>
        </div>
      </form>
    </div>
  );
}

function FormLabel({ title }: { title: string }) {
  return <label className="create-zone-label">{title} <Info size={13} /></label>;
}

function ZoneTypeOption({ selected, title, description, onClick }: { selected: boolean; title: string; description: string; onClick: () => void }) {
  return (
    <button type="button" className={selected ? "zone-type-option selected" : "zone-type-option"} onClick={onClick}>
      <span className="zone-type-radio">{selected ? "●" : "○"}</span>
      <span><strong>{title}</strong><small>{description}</small></span>
    </button>
  );
}
