import { CreditsVault } from "@/components/credits-vault";
import { RelayFrame } from "@/components/relay-frame";
import { SessionBar } from "@/components/session-bar";
import { VaultShell } from "@/components/vault-shell";
import { toPublicEvent } from "@/lib/public-event";
import { getGateSession } from "@/lib/session";
import { getActiveEvent } from "@/lib/store";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ViewPage() {
  const session = await getGateSession();
  if (!session) {
    redirect("/");
  }

  const event = await getActiveEvent();
  if (event.id !== session.eventId) {
    redirect("/");
  }

  const publicEvent = toPublicEvent(event);

  return (
    <VaultShell>
      <SessionBar event={publicEvent} email={session.email} />
      {event.destinationKind === "external" && event.destinationUrl ? (
        <RelayFrame />
      ) : (
        <CreditsVault event={publicEvent} email={session.email} />
      )}
    </VaultShell>
  );
}
