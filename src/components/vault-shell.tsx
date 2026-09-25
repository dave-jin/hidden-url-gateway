import type { ReactNode } from "react";

export function VaultShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#07080A] text-foreground">
      <div className="vault-glow pointer-events-none absolute inset-0" />
      <div className="vault-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#07080A_88%)]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
