import Link from "next/link";
import { PageShell } from "@/components/consulting";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      <div className="vault-bar">
        <Link href="/engivault" className="vault-wordmark">
          ENGiVAULT<span>Engineering workspace</span>
        </Link>
        <nav aria-label="EngiVault navigation">
          <Link href="/engivault">Calculators</Link>
          <Link href="/engivault/unit-converter">Unit converter</Link>
          <Link href="/projects/engivault">About the product</Link>
        </nav>
      </div>
      {children}
    </PageShell>
  );
}
