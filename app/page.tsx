import { PageShell } from "@/components/consulting";
import { HomeJourney } from "@/components/journey/home-journey";

export const metadata = {
  title: {
    absolute: "Luqman Ismat | Consulting, Connected Systems & Indus Blue",
  },
  description:
    "Consulting for engineering, project management, project controls, dashboards, and integrations. Apparel collections and contract development through Indus Blue.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Luqman Ismat | Consulting & Product Development",
    description: "Engineering insight, connected systems, and useful work. Based in Houston.",
    url: "/",
    images: [{ url: "/images/editorial/waterwall-social.jpg", width: 1200, height: 630, alt: "Cascading water framed by oak branches in warm evening light" }],
  },
  twitter: { card: "summary_large_image", images: ["/images/editorial/waterwall-social.jpg"] },
};

export default function Home() {
  return (
    <PageShell>
      <HomeJourney />
    </PageShell>
  );
}
