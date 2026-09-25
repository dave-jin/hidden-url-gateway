import { GateForm } from "@/components/gate-form";
import { EventMark } from "@/components/event-mark";
import { VaultShell } from "@/components/vault-shell";
import { toPublicEvent } from "@/lib/public-event";
import { getGateSession } from "@/lib/session";
import { getActiveEvent } from "@/lib/store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GatePage() {
  const [event, session] = await Promise.all([getActiveEvent(), getGateSession()]);
  if (session) {
    redirect("/view");
  }
  const publicEvent = toPublicEvent(event);

  return (
    <VaultShell>
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6 py-16">
        <EventMark
          src={publicEvent.wordmarkPath}
          name={publicEvent.name}
          size="lg"
          variant="wordmark"
        />
        <p className="mt-8 text-[11px] tracking-[0.42em] text-gold-dim uppercase">
          Private desk
        </p>
        <h1 className="sr-only">{publicEvent.name}</h1>
        <p className="mt-3 text-center text-sm tracking-[0.32em] text-gold uppercase">
          {publicEvent.tagline}
        </p>
        <p className="mt-6 max-w-sm text-center text-sm leading-6 text-muted-foreground">
          {publicEvent.description}
        </p>
        <div className="mt-10 w-full rounded-2xl border border-gold/15 bg-black/35 p-6 backdrop-blur-sm">
          <GateForm />
        </div>
        <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
          The destination never appears in the address bar, the page source, or a
          shareable link.
        </p>
        <a
          href="/admin"
          className="mt-10 text-[10px] tracking-[0.32em] text-white/25 uppercase transition-colors hover:text-gold-dim"
        >
          Admin
        </a>
      </main>
    </VaultShell>
  );
}
