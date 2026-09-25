"use client";

type EventMarkProps = {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-10 w-10",
  md: "h-20 w-20",
  lg: "h-28 w-28",
};

export function EventMark({ src, name, size = "md" }: EventMarkProps) {
  return (
    <div
      className={`overflow-hidden rounded-full border border-gold/25 bg-black/40 shadow-[0_0_40px_oklch(0.72_0.1_85/0.18)] ${sizes[size]}`}
    >
      {/* Event logos are uploaded or bundled locally; next/image remote patterns would leak destinations. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} mark`}
        className="h-full w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = "/events/grok-bot/mark.svg";
        }}
      />
    </div>
  );
}
