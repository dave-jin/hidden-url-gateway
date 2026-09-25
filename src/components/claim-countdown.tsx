"use client";

import { useEffect, useState } from "react";
import type { EventClaimState } from "@/lib/cursor-redeem";

function formatRemaining(ms: number, dayUnit: string) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}${dayUnit} ${clock}` : clock;
}

export function ClaimCountdown({
  state,
  startsAtMs,
  endsAtMs,
  timeLeft,
  opensIn,
  ended,
  dayUnit,
}: {
  state: EventClaimState;
  startsAtMs: number;
  endsAtMs: number;
  timeLeft: string;
  opensIn: string;
  ended: string;
  dayUnit: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const upcoming = state === "EVENT_CODE_CLAIM_STATE_UPCOMING";
  const open = state === "EVENT_CODE_CLAIM_STATE_OPEN";
  const target = upcoming ? startsAtMs : open ? endsAtMs : 0;
  const label = upcoming ? opensIn : timeLeft;
  const remaining = target && now !== null ? target - now : null;
  const finished = remaining !== null && remaining <= 0;

  return (
    <div>
      <p className="text-[11px] tracking-[0.22em] text-gold-dim uppercase">{finished || !target ? ended : label}</p>
      {target ? (
        <p className="mt-3 font-mono text-3xl tabular-nums tracking-wide text-foreground">
          {now === null ? "—" : finished ? "00:00:00" : formatRemaining(remaining ?? 0, dayUnit)}
        </p>
      ) : null}
    </div>
  );
}
