import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio | Luqman Ismat - Process Engineer",
  description:
    "View the professional portfolio of Luqman Ismat, a skilled process engineer from Katy and The Woodlands, TX, showcasing experience in EPC projects and innovative engineering solutions.",
}

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

