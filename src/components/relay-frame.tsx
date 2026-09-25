"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function RelayFrame() {
  const [ready, setReady] = useState(false);

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full bg-black">
      {!ready ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <Skeleton className="h-24 w-64 rounded-xl" />
          <p className="text-[11px] tracking-[0.28em] text-gold-dim uppercase">
            Opening hidden page
          </p>
        </div>
      ) : null}
      <iframe
        title="Secured destination"
        src="/api/relay"
        className="h-full w-full border-0 bg-white"
        onLoad={() => setReady(true)}
        referrerPolicy="no-referrer"
        sandbox="allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}
