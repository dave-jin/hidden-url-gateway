"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function GateForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/gate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error ?? "Access denied.");
        return;
      }
      router.push("/view");
      router.refresh();
    } catch {
      setError("The desk is unavailable. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[11px] tracking-[0.22em] text-gold-dim uppercase">
          Invited email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@spacexai.com"
          className="h-12 rounded-xl border-gold/20 bg-black/40 px-4 text-base"
        />
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl text-sm tracking-[0.18em] uppercase"
      >
        {pending ? "Checking…" : "Enter"}
      </Button>
    </form>
  );
}
