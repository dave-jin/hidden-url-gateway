"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EventMark } from "@/components/event-mark";
import type { DestinationKind, EventRecord } from "@/lib/types";

type AdminPayload = {
  event: EventRecord;
  meta: { allowlistCount: number; usingDevSecrets: boolean };
};

export function AdminConsole() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [destinationKind, setDestinationKind] = useState<DestinationKind>("internal");
  const [destinationUrl, setDestinationUrl] = useState("");
  const [emailsText, setEmailsText] = useState("");
  const [logoPath, setLogoPath] = useState("/events/grok-bot/mark.svg");
  const [allowlistCount, setAllowlistCount] = useState(0);

  async function load() {
    const response = await fetch("/api/admin/event");
    if (response.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    if (!response.ok) {
      setError("Could not load the event.");
      setLoading(false);
      return;
    }
    const body = (await response.json()) as AdminPayload;
    hydrate(body);
    setAuthed(true);
    setLoading(false);
  }

  function hydrate(body: AdminPayload) {
    setName(body.event.name);
    setTagline(body.event.tagline);
    setDescription(body.event.description);
    setDestinationKind(body.event.destinationKind);
    setDestinationUrl(body.event.destinationUrl);
    setEmailsText(body.event.emails.join("\n"));
    setLogoPath(body.event.logoPath);
    setAllowlistCount(body.meta.allowlistCount);
  }

  useEffect(() => {
    void load();
  }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(body.error ?? "Wrong password.");
      return;
    }
    await load();
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/event", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          tagline,
          description,
          destinationKind,
          destinationUrl,
          emailsText,
        }),
      });
      const body = (await response.json()) as AdminPayload & { error?: string };
      if (!response.ok) {
        setError(body.error ?? "Save failed.");
        return;
      }
      hydrate({
        event: body.event,
        meta: { allowlistCount: body.event.emails.length, usingDevSecrets: false },
      });
      setNotice("Event saved. Destination URL stays on the server.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadLogo(file: File | undefined) {
    if (!file) return;
    setError("");
    const form = new FormData();
    form.set("logo", file);
    form.set("slot", "logo");
    const response = await fetch("/api/admin/logo", { method: "POST", body: form });
    const body = (await response.json()) as AdminPayload & { error?: string };
    if (!response.ok) {
      setError(body.error ?? "Upload failed.");
      return;
    }
    setLogoPath(body.event.logoPath);
    setNotice("Event logo updated.");
  }

  async function importCsv(file: File | undefined) {
    if (!file) return;
    const text = await file.text();
    setEmailsText((current) => [current, text].filter(Boolean).join("\n"));
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading console…</p>;
  }

  if (!authed) {
    return (
      <Card className="mx-auto w-full max-w-md border-gold/15 bg-black/35">
        <CardHeader>
          <CardTitle>Admin desk</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <Card className="border-gold/15 bg-black/35">
          <CardHeader>
            <CardTitle>Event branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Gate copy</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={(event) => void uploadLogo(event.target.files?.[0])}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gold/15 bg-black/35">
          <CardHeader>
            <CardTitle>Hidden destination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={destinationKind === "internal" ? "default" : "outline"}
                onClick={() => setDestinationKind("internal")}
              >
                Grok credits page
              </Button>
              <Button
                type="button"
                variant={destinationKind === "external" ? "default" : "outline"}
                onClick={() => setDestinationKind("external")}
              >
                External URL
              </Button>
            </div>
            {destinationKind === "external" ? (
              <div className="space-y-2">
                <Label htmlFor="destination">Destination URL</Label>
                <Input
                  id="destination"
                  type="url"
                  value={destinationUrl}
                  onChange={(event) => setDestinationUrl(event.target.value)}
                  placeholder="https://…"
                />
                <p className="text-xs text-muted-foreground">
                  Stored only in Supabase. Visitors receive `/api/relay`, never this
                  address.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                After email check, visitors see the built-in Grok Bot credit desk.
                There is no external URL to leak.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gold/15 bg-black/35">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Allowlist</CardTitle>
            <Badge variant="secondary">{allowlistCount} emails</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Paste emails</Label>
              <Textarea
                id="emails"
                value={emailsText}
                onChange={(event) => setEmailsText(event.target.value)}
                rows={10}
                placeholder={"demo@spacexai.com\ngrok@x.ai"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv">Or upload CSV</Label>
              <Input
                id="csv"
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={(event) => void importCsv(event.target.files?.[0])}
              />
            </div>
          </CardContent>
        </Card>

        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {notice ? (
          <Alert>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="submit" disabled={saving} className="h-11 px-6">
          {saving ? "Saving…" : "Save event"}
        </Button>
      </div>

      <Card className="h-fit border-gold/15 bg-black/35">
        <CardHeader>
          <CardTitle>Gate preview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <EventMark src={logoPath} name={name || "Event"} size="md" />
          <p className="mt-4 text-[11px] tracking-[0.32em] text-gold-dim uppercase">
            Private desk
          </p>
          <p className="display mt-2 text-2xl tracking-[0.14em] uppercase">
            {name || "Event"}
          </p>
          <p className="mt-1 text-xs tracking-[0.22em] text-gold uppercase">
            {tagline}
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
