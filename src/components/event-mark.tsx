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
    <div className={`flex items-center justify-center ${sizes[size]}`}>
      {/* Event logos are uploaded or bundled locally; next/image remote patterns would leak destinations. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} mark`}
        className="h-full w-full object-contain"
        onError={(event) => {
          event.currentTarget.src = "/events/grok-bot/mark.svg";
        }}
      />
    </div>
  );
}
