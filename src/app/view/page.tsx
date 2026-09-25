import { CreditsVault } from "@/components/credits-vault";
import { EventClaimDesk } from "@/components/event-claim-desk";
import { RelayFrame } from "@/components/relay-frame";
import { SessionBar } from "@/components/session-bar";
import { VaultShell } from "@/components/vault-shell";
import {
  fetchEventCodeInfo,
  parseCursorRedeemCode,
} from "@/lib/cursor-redeem";
import { relayFrameSrc } from "@/lib/proxy";
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
  const redeemCode =
    event.destinationKind === "external" && event.destinationUrl
      ? parseCursorRedeemCode(event.destinationUrl)
      : null;

  let claimInfo = null;
  let claimError = "";
  if (redeemCode) {
    try {
      claimInfo = await fetchEventCodeInfo(redeemCode);
    } catch (error) {
      claimError =
        error instanceof Error ? error.message : "The hidden claim page could not be opened.";
    }
  }

  return (
    <VaultShell>
      <SessionBar event={publicEvent} email={session.email} />
      {redeemCode ? (
        <EventClaimDesk
          event={publicEvent}
          email={session.email}
          info={claimInfo}
          error={claimError}
        />
      ) : event.destinationKind === "external" && event.destinationUrl ? (
        <RelayFrame src={relayFrameSrc(event.destinationUrl)} />
      ) : (
        <CreditsVault event={publicEvent} email={session.email} />
      )}
    </VaultShell>
  );
}
