import "@fontsource-variable/host-grotesk";
import "@fontsource-variable/martian-mono";
import "@/styles/globals.css";
import "@/styles/engivault.css";
import "@/styles/vault.css";
import "@/styles/system.css";
import "@/styles/products.css";
import { Header } from "@/components/site/header";
import { Motion } from "@/components/site/motion";
import { GridLines } from "@/components/site/roll";
import { SiteAnalytics } from "@/components/site/analytics";
import { FIRST_TOUCH_SCRIPT } from "@/lib/leads/attribution";
import { site } from "@/lib/site";
import { services, startingPoints } from "@/lib/services";
import type { Metadata, Viewport } from "next";

const title = "TEN21 Consulting | Websites, payments, automation and data in Houston";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s | TEN21 Consulting" },
  description: site.description,
  authors: [{ name: site.founder }],
  creator: site.founder,
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title,
    description: site.description,
    images: [{ url: "/social-card.png", width: 1200, height: 630, alt: "TEN21 Consulting by Luqman Ismat" }],
  },
  twitter: { card: "summary_large_image", title, description: site.description, images: ["/social-card.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0b0a",
  colorScheme: "dark",
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": site.url + "/#person",
      name: site.founder,
      url: site.url + "/about",
      jobTitle: "Founder, TEN21 Consulting",
      image: site.url + "/images/about/luqman-uh-graduation.jpg",
      address: { "@type": "PostalAddress", addressLocality: "Houston", addressRegion: "TX", addressCountry: "US" },
      alumniOf: { "@type": "CollegeOrUniversity", name: "University of Houston", url: "https://www.uh.edu" },
      knowsAbout: ["Web development", "Stripe payments", "Workflow automation", "Knowledge bases", "Dashboards", "Data integration", "PostgreSQL", "Project controls", "Industrial engineering"],
      sameAs: [site.linkedin, site.github],
    },
    {
      "@type": "ProfessionalService",
      "@id": site.url + "/#practice",
      name: site.name,
      url: site.url,
      description: site.description,
      email: site.email,
      telephone: "+1-832-679-6731",
      founder: { "@id": site.url + "/#person" },
      image: site.url + "/social-card.png",
      areaServed: [
        { "@type": "City", name: "Houston" },
        { "@type": "Country", name: "United States" },
      ],
      address: { "@type": "PostalAddress", addressLocality: "Houston", addressRegion: "TX", addressCountry: "US" },
      serviceType: services.map((s) => s.name),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Starting points",
        itemListElement: startingPoints.map((p) => ({
          "@type": "Offer",
          name: p.name,
          description: p.text,
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "USD",
            ...(p.price.includes("+") ? { minPrice: Number(p.price.replace(/[^0-9.]/g, "")) } : { price: Number(p.price.replace(/[^0-9.]/g, "")) }),
          },
        })),
      },
    },
    { "@type": "WebSite", name: site.name, url: site.url },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-motion')" }} />
        <script dangerouslySetInnerHTML={{ __html: FIRST_TOUCH_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content" data-no-curtain>
          Skip to content
        </a>
        <GridLines />
        <Header />
        {children}
        <Motion />
        <SiteAnalytics />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
