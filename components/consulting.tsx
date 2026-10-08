import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Footer } from "@/components/footer";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <main id="main-content" className="consulting-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
export function Action({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        secondary ? "consulting-button secondary" : "consulting-button"
      }
    >
      {children}
      <ArrowUpRight size={18} aria-hidden="true" />
    </Link>
  );
}
export function ProjectCTA({
  service,
  title = "Have a project in mind?",
}: {
  service?: string;
  title?: string;
}) {
  return (
    <section className="consulting-wrap project-cta">
      <h2>{title}</h2>
      <div className="cta-bottom">
        <p>
          Tell me what is slow, broken or missing. I reply within two business
          days.
        </p>
        <Action href={service ? `/contact?service=${service}` : "/contact"}>
          Start a project
        </Action>
      </div>
    </section>
  );
}
