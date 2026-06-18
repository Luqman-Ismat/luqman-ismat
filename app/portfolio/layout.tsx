import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio by Luqman Ismat — EPC Process Engineering Experience | Houston, TX",
  description:
    "Career portfolio of Luqman Ismat: process engineering, piping systems, process safety leadership, and reliability data analysis across EPC projects in Houston and the Texas Gulf Coast.",
  keywords: [
    "Luqman Ismat",
    "Luqman Ismat portfolio",
    "Luqman Ismat process engineer",
    "Luqman Ismat EPC",
    "Portfolio engineering Houston",
    "Process Safety Lead Texas",
    "Piping Systems Engineer",
    "Pinnacle Reliability",
    "Reliability Data Analyst",
  ],
  alternates: { canonical: "https://www.luqmanismat.com/portfolio" },
  openGraph: {
    type: "website",
    url: "https://www.luqmanismat.com/portfolio",
    title: "Portfolio by Luqman Ismat — EPC Engineering Experience",
    description:
      "Process engineering, piping systems, process safety, and reliability work by Luqman Ismat across the EPC industry.",
    images: [
      { url: "https://www.luqmanismat.com/og-image.jpg", width: 1200, height: 630, alt: "Luqman Ismat — Portfolio" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio by Luqman Ismat",
    description: "EPC engineering experience by Luqman Ismat.",
    images: ["https://www.luqmanismat.com/og-image.jpg"],
  },
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
