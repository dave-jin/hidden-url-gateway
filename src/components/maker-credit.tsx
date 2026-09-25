export function MakerCredit({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "flex items-center gap-2"
          : "flex flex-col items-center gap-3 text-center"
      }
    >
      {/* Official SpaceXAI marks from the attached brand kit. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={compact ? "/brand/spacexai-mark.svg" : "/brand/spacexai-wordmark.svg"}
        alt="SpaceXAI"
        className={
          compact
            ? "h-4 w-10 object-contain opacity-55"
            : "h-3.5 w-auto max-w-[11rem] object-contain opacity-70"
        }
      />
      <p
        className={
          compact
            ? "text-[10px] tracking-[0.14em] text-white/35 uppercase"
            : "text-[10px] tracking-[0.22em] text-white/40 uppercase"
        }
      >
        Made by Dave Jin · SpaceXAI Community
      </p>
    </div>
  );
}
