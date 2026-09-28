import { calculators } from "@/lib/engivault/calculator-data";
import { VaultCatalog } from "@/components/engivault/catalog";
export const metadata = {
  title: "EngiVault | Engineering Workspace",
  description:
    "Use EngiVault engineering calculators directly on Luqman Ismat. Explicit inputs, units, methods, and reference sources.",
  alternates: { canonical: "/engivault" },
};
export default function Page() {
  return (
    <div className="site-container vault-content">
      <div className="vault-intro">
        <div>
          <p className="eyebrow">The engineering resource library</p>
          <h1>
            A clearer path
            <br />
            from question to result.
          </h1>
        </div>
        <p>
          Calculate, check your units, and understand the method. EngiVault’s
          engineering tools now live within this website. Public tools work
          without an account.
        </p>
      </div>
      <VaultCatalog
        items={Object.entries(calculators).map(([slug, c]) => ({
          slug,
          title: c.title,
          category: c.category,
        }))}
      />
    </div>
  );
}
