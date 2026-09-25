"use client";

import { useState } from "react";
import { RELAY_PREFIX } from "@/lib/proxy";
import { Skeleton } from "@/components/ui/skeleton";

export function RelayFrame({ src = RELAY_PREFIX }: { src?: string }) {
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
        src={src}
        className="h-full w-full border-0 bg-white"
        onLoad={() => setReady(true)}
        referrerPolicy="same-origin"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
      />
    </div>
  );
}
