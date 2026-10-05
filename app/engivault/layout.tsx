import { PageShell } from "@/components/consulting";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      <div className="vault">{children}</div>
    </PageShell>
  );
}
