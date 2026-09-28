import {WorkFeatureIndex} from '@/components/work-explained';
import { PageShell, ProjectCTA } from "@/components/consulting";
import { WorkShowcase } from "@/components/studio-sections";
import { DemoGallery } from "@/components/demo-gallery";
export const metadata = {
  title: "Selected Work | Platforms, Demos & Product Development",
  description:
    "Explore interactive project-controls, inspection-planning, and integration demos, alongside EngiVault and original Indus Blue CAD.",
  alternates: { canonical: "/projects" },
};
export default function Projects() {
  return (
    <PageShell>
      <header className="site-container work-index-intro">
        <h1>Work & interactive demos</h1>
        <p>Explore the software, analytical tools, and original CAD. Open a project to use it or see how it was built.</p>
      </header>
      <DemoGallery compact />
      <WorkFeatureIndex />
      <WorkShowcase index />
      <ProjectCTA title="Have a different kind of project?" />
    </PageShell>
  );
}
