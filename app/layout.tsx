import "@fontsource-variable/montserrat";
import "@/styles/globals.css";
import "@/styles/studio.css";
import "@/styles/engivault.css";
import "@/styles/work.css";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/lib/site";
import type { Metadata, Viewport } from "next";
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Luqman Ismat | Consulting & Product Development",
    template: "%s | Luqman Ismat",
  },
  description: site.description,
  authors: [{ name: site.name }],
  creator: site.name,
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: site.name,
    title: "Luqman Ismat | Consulting & Product Development",
    description: site.description,
    images: [
      {
        url: "/social-card.png",
        width: 1200,
        height: 630,
        alt: "Luqman Ismat: Consulting, connected systems, and Indus Blue",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Luqman Ismat | Consulting & Product Development",
    description: site.description,
    images: ["/social-card.png"],
  },
  robots: { index: true, follow: true },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Header />
          <ScrollToTopWrapper>{children}</ScrollToTopWrapper>
          <Toaster />
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": site.url + "/#person",
                  name: site.name,
                  url: site.url,
                  jobTitle: "Independent consultant",
                  sameAs: [
                    "https://www.linkedin.com/in/luqman-ismat/",
                    "https://github.com/Luqman-Ismat",
                  ],
                },
                {
                  "@type": "ProfessionalService",
                  "@id": site.url + "/#practice",
                  name: "Luqman Ismat Consulting",
                  url: site.url,
                  description: site.description,
                  email: site.email,
                  founder: { "@id": site.url + "/#person" },
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Houston",
                    addressRegion: "TX",
                    addressCountry: "US",
                  },
                  serviceType: [
                    "Project management",
                    "Project controls",
                    "Custom dashboards",
                    "Workflow automation",
                    "System integrations",
                    "Engineering systems",
                    "Apparel product development",
                  ],
                },
                {
                  "@type": "Brand",
                  "@id": site.url + "/indus-blue#brand",
                  name: "Indus Blue",
                  url: site.url + "/indus-blue",
                  description:
                    "Independent apparel label in development and contract apparel development.",
                },
                { "@type": "WebSite", name: site.name, url: site.url },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
