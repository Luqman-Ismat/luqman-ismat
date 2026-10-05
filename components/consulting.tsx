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
  title = "Let’s make the next step concrete.",
}: {
  service?: string;
  title?: string;
}) {
  return (
    <section className="consulting-wrap project-cta">
      <p className="eyebrow">Start a conversation</p>
      <h2>{title}</h2>
      <div className="cta-bottom">
        <p>
          Send the problem, the starting point, and the deadline. We’ll define a
          useful first deliverable together.
        </p>
        <Action href={service ? `/contact?service=${service}` : "/contact"}>
          Discuss your project
        </Action>
      </div>
    </section>
  );
}
