"use client";

type EventMarkProps = {
  src: string;
  name: string;
  size?: "sm" | "md" | "lg";
  variant?: "mark" | "wordmark";
};

const sizes = {
  mark: {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  },
  wordmark: {
    sm: "h-7 w-[9rem]",
    md: "h-10 w-[14rem]",
    lg: "h-14 w-[21rem] max-w-[85vw]",
  },
};

export function EventMark({
  src,
  name,
  size = "md",
  variant = "mark",
}: EventMarkProps) {
  const fallback =
    variant === "wordmark"
      ? "/events/grok-bot/wordmark.svg"
      : "/events/grok-bot/logo.svg";

  return (
    <div className={`flex items-center justify-center ${sizes[variant][size]}`}>
      {/* Event logos are uploaded or bundled locally; next/image remote patterns would leak destinations. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} mark`}
        className="h-full w-full object-contain"
        onError={(event) => {
          event.currentTarget.src = fallback;
        }}
      />
    </div>
  );
}
