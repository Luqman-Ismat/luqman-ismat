"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nextStep } from "@/lib/navigation";

/* Every page ends by pointing to the next stop on the path through the site. */
export function NextStep() {
  const next = nextStep(usePathname());
  if (!next) return null;
  return (
    <Link href={next.href} className="next-step" data-cursor="Next">
      <span className="next-step-kicker">Next · 0{next.index}</span>
      <span className="next-step-label">{next.label}</span>
      <span className="next-step-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
