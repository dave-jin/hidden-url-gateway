import { AdminConsole } from "@/components/admin-console";
import { VaultShell } from "@/components/vault-shell";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <VaultShell>
      <main className="px-4 py-10 sm:px-8">
        <p className="mb-2 text-[11px] tracking-[0.32em] text-gold-dim uppercase">
          Hidden URL Gateway
        </p>
        <h1 className="display mb-8 text-3xl tracking-[0.12em] uppercase">
          Admin
        </h1>
        <AdminConsole />
      </main>
    </VaultShell>
  );
}
