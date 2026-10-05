import Image from "next/image";
import Link from "next/link";
import { PageShell, Action, ProjectCTA } from "@/components/consulting";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { toolGroups } from "@/lib/experience";
export const metadata = {
  title: "About Luqman | Background & Experience",
  description:
    "Meet Luqman Ismat: Houston-based industrial engineering graduate, Risk Analyst, and builder of engineering software and connected systems.",
  alternates: { canonical: "/about" },
};
export default function Page() {
  return (
    <PageShell>
      <section className="site-container about-hero">
        <div>
          <p className="eyebrow">About me / Houston, Texas</p>
          <h1>
            Hi, I’m Luqman.
            <br />
            <span>
              I connect the technical
              <br />
              and the practical.
            </span>
          </h1>
          <p>
            I’m an industrial engineering graduate, Risk Analyst, and builder of
            software, analytical tools, and connected workflows. My background
            spans process engineering, safety, piping systems, reliability, and
            project controls.
          </p>
          <p>
            I work where those disciplines meet: understanding a complex
            problem, organizing the information, and building something people
            can use. That includes connecting Workday APIs to PostgreSQL, building reconciliation and reporting workflows, and implementing authentication and project-scoped access controls.
          </p>
          <div className="action-row">
            <Action href="/portfolio">Explore my experience</Action>
            <Action href="/projects" secondary>
              Try the work
            </Action>
          </div>
        </div>
        <figure>
          <Image
            src="/images/luqman-portrait-blue.jpeg"
            alt="Luqman Ismat"
            width={1179}
            height={1492}
            sizes="(max-width:760px) 100vw, 35vw"
            loading="eager"
          />
          <figcaption>Luqman Ismat / Houston</figcaption>
        </figure>
      </section>
      <section className="site-container about-background">
        <div>
          <p className="eyebrow">Background</p>
          <h2>
            Engineering roots.
            <br />A wider perspective.
          </h2>
        </div>
        <div>
          <p>
            I grew up in Katy, Texas. My studies began in chemical engineering
            before I moved into industrial engineering at the University of
            Houston, where I graduated in May 2026.
          </p>
          <p>
            At Chemex Global, I worked across process engineering, process
            safety, and piping systems. Those experiences showed me how closely
            technical decisions depend on clear documentation, useful data, and
            communication between teams.
          </p>
          <p>
            At Pinnacle, my path has included reliability data analysis and
            project controls consulting. I’m currently a Risk Analyst. Alongside
            that work, I develop EngiVault and TEN21, bringing the same
            attention to detail to software and physical products.
          </p>
        </div>
      </section>
      <ExperienceTimeline />
      <section className="site-container about-education">
        <div>
          <p className="eyebrow">Education</p>
          <h2>University of Houston</h2>
          <p>
            Bachelor of Science in Industrial Engineering
            <br />
            Graduated May 2026
          </p>
        </div>
        <div>
          <p className="eyebrow">Approach</p>
          <h3>Understand the work before building the tool.</h3>
          <p>
            I’m interested in systems that make decisions easier to understand:
            calculations with clear assumptions, dashboards with traceable
            numbers, and workflows with a visible next step.
          </p>
        </div>
      </section>
      <section className="site-container tools-section">
        <p className="eyebrow">Tools & capabilities</p>
        <h2>A toolkit across disciplines.</h2>
        <div className="tools-grid">
          {toolGroups.map((g) => (
            <div key={g.label}>
              <h3>{g.label}</h3>
              <ul>
                {g.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="site-container about-personal">
        <div>
          <p className="eyebrow">Beyond the work</p>
          <h2>
            Faith, family,
            <br />
            and curiosity.
          </h2>
        </div>
        <div>
          <p>
            I became a Hafiz at 15. Quran recitation, leading Taraweeh, and
            serving my community are an important part of my life. Growing up
            with four younger brothers also shaped how I think about
            responsibility and leadership.
          </p>
          <p>
            I enjoy food and the craft behind it, especially Pakistani, Afghani,
            Arab, Italian, and Japanese cooking. Outside work, you’ll also find
            me watching anime, playing games, or listening to music.
          </p>
          <Link
            className="inline-link"
            href="https://youtube.com/@luqmanmuhammadismat"
            target="_blank"
            rel="noopener noreferrer"
          >
            Listen to my recitations ↗
          </Link>
        </div>
      </section>
      <ProjectCTA title="Let’s build something useful." />
    </PageShell>
  );
}
