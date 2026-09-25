import { GateForm } from "@/components/gate-form";
import { EventMark } from "@/components/event-mark";
import { MakerCredit } from "@/components/maker-credit";
import { VaultShell } from "@/components/vault-shell";
import { localeFromAcceptLanguage } from "@/lib/locale";
import { copyFor } from "@/lib/messages";
import { toPublicEvent } from "@/lib/public-event";
import { getGateSession } from "@/lib/session";
import { getActiveEvent } from "@/lib/store";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GatePage() {
  const [event, session] = await Promise.all([getActiveEvent(), getGateSession()]);
  if (session) {
    redirect("/view");
  }
  const publicEvent = toPublicEvent(event);
  const locale = localeFromAcceptLanguage((await headers()).get("accept-language"));
  const copy = copyFor(locale);

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
          {copy.privateDesk}
        </p>
        <h1 className="sr-only">{publicEvent.name}</h1>
        <p className="mt-3 text-center text-sm tracking-[0.32em] text-gold uppercase">
          {publicEvent.tagline}
        </p>
        <p className="mt-6 max-w-sm text-center text-sm leading-6 text-muted-foreground">
          {publicEvent.description}
        </p>
        <div className="mt-10 w-full rounded-2xl border border-gold/15 bg-black/35 p-6 backdrop-blur-sm">
          <GateForm locale={locale} />
        </div>
        <p className="mt-8 text-center text-xs leading-5 text-muted-foreground">
          {copy.gateFoot}
        </p>
        <div className="mt-12">
          <MakerCredit />
        </div>
        <a
          href="/admin"
          className="mt-8 text-[10px] tracking-[0.32em] text-white/25 uppercase transition-colors hover:text-gold-dim"
        >
          {copy.admin}
        </a>
      </main>
    </VaultShell>
  );
}
