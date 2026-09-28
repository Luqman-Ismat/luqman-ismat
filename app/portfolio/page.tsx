import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { PageIntro } from "@/components/studio-sections";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { DemoGallery } from "@/components/demo-gallery";
export const metadata = {
  title: "Experience & Portfolio",
  description:
    "Explore Luqman Ismat’s career timeline across engineering, reliability, project controls, and risk analysis.",
  alternates: { canonical: "/portfolio" },
};
export default function Page() {
  return (
    <PageShell>
      <PageIntro
        label="Professional experience"
        title="The experience behind the work."
        text="From process engineering and safety to project controls, analytics, and risk. Explore the timeline, then see examples of the systems I build."
      >
        <Action href="/about">More about me</Action>
      </PageIntro>
      <ExperienceTimeline />
      <DemoGallery />
      <ProjectCTA />
    </PageShell>
  );
}
