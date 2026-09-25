"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function RelayFrame() {
  const [ready, setReady] = useState(false);

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full bg-black">
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-24 w-64 rounded-xl" />
        </div>
      ) : null}
      <iframe
        title="Secured destination"
        src="/api/relay"
        className="h-full w-full border-0 bg-[#07080A]"
        onLoad={() => setReady(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
