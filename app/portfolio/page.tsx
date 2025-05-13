import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Image from "next/image"
import Link from "next/link"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"

export const metadata = {
  title: "Portfolio | Luqman Ismat - Process Engineer",
  description:
    "View the professional portfolio of Luqman Ismat, a skilled process engineer from Katy and The Woodlands, TX, showcasing experience in EPC projects and innovative engineering solutions.",
}

export default function PortfolioPage() {
  return (
    <ScrollToTopWrapper>
      <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
        <Header />
        <main className="pt-32 pb-24">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              {/* Header Section */}
              <div className="mb-16">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 mb-8">
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">PORTFOLIO</h1>
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chemex-9RNC0f2kDrJf3iwUKYu1jkNPZuJ2BZ.png"
                    alt="Chemex Global - Luqman Ismat's Previous Employer"
                    width={200}
                    height={80}
                    className="w-[200px] h-auto"
                  />
                </div>
                <div className="space-y-6">
                  <p className="text-2xl text-muted-foreground">
                    Innovative and results-driven engineer with a strong background in Process and Piping Systems
                    Engineering, specializing in leveraging data analysis and Artificial Intelligence to streamline
                    project workflows and enhance deliverables.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="mailto:Luqman.ismat@gmail.com"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Luqman.ismat@gmail.com
                    </Link>
                    <span className="text-muted-foreground">|</span>
                    <Link
                      href="tel:+1-832-679-6731"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      (832)-679-6731
                    </Link>
                    <span className="text-muted-foreground">|</span>
                    <Link
                      href="https://www.linkedin.com/in/luqman-ismat/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      linkedin.com/in/luqmanismat
                    </Link>
                  </div>
                </div>
              </div>

              {/* Process Engineering Section */}
              <section id="process-engineering" className="mb-24 scroll-mt-32">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Process Engineering</h2>
                </AnimatedHeader>
                <div className="space-y-8">
                  <p className="text-muted-foreground">
                    As a Junior Process Engineer at Chemex Global, LLC from May 2022 to March 2024, I spearheaded
                    innovative solutions in process design, optimization, and safety compliance while leveraging
                    cutting-edge technology to improve efficiency.
                  </p>
                  <div className="grid gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">P&ID Development and AI Integration</h3>
                      <p className="text-muted-foreground">
                        Led the development and delivery of over 100 Piping & Instrumentation Diagrams (P&IDs) for
                        complex systems including pyrolysis reactors and gas detection networks. Pioneered an AI-powered
                        validation tool that revolutionized the review process, achieving a 20% reduction in errors and
                        significantly improving efficiency. This tool incorporated machine learning algorithms to detect
                        common design inconsistencies and verify compliance with ASME and client-specific standards.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Process Simulation and Optimization</h3>
                      <p className="text-muted-foreground">
                        Developed a sophisticated heat and material balance (HMB) export tool for Aspen HYSYS that
                        transformed data extraction and analysis workflows. This innovation resulted in a 10%
                        improvement in system efficiency and enhanced accuracy in process calculations. The tool
                        automated complex data processing tasks, enabling rapid iteration of design scenarios and
                        optimization of process parameters. Additionally, implemented advanced simulation models for
                        critical unit operations, leading to optimized operating conditions and reduced energy
                        consumption.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Equipment Design and Specifications</h3>
                      <p className="text-muted-foreground">
                        Managed comprehensive design and sizing initiatives for critical process equipment across
                        multiple projects. This included detailed engineering for tanks, vessels, heat exchangers,
                        pumps, distillation columns, knockout drums, flares, and firewater systems. Developed and
                        maintained extensive technical documentation, including Basis of Design (BOD), Block Flow
                        Diagrams (BFD), Process Flow Diagrams (PFD), and Material Selection Diagrams (MSD). Implemented
                        innovative design methodologies that resulted in optimized equipment performance and reduced
                        capital costs while maintaining strict compliance with industry standards.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Safety and Operational Excellence</h3>
                      <p className="text-muted-foreground">
                        Played a pivotal role in HAZOP and HAZIP studies, successfully identifying and resolving over 30
                        critical safety and operability issues. Developed comprehensive startup and commissioning
                        calculations for major projects including Freepoint (Simon, Eloy, Ghent) and Tesla (Mosaic).
                        Created detailed operating procedures and troubleshooting guides that significantly reduced
                        startup times and improved operational reliability. Implemented risk assessment methodologies
                        that enhanced process safety while maintaining optimal production efficiency.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Piping Systems Section */}
              <section id="piping-systems-engineering" className="mb-24 scroll-mt-32">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Piping Systems Engineering</h2>
                </AnimatedHeader>
                <div className="space-y-8">
                  <p className="text-muted-foreground">
                    In my role as Junior Piping Systems Engineer from March 2024 to August 2024, I led innovative piping
                    design initiatives while implementing cutting-edge solutions for system optimization and safety
                    compliance.
                  </p>
                  <div className="grid gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Project Implementation and Optimization</h3>
                      <p className="text-muted-foreground">
                        Spearheaded the design and implementation of complex piping layouts for major projects including
                        the Braven (Cobra) Pyrolysis and Arcanum (Hawk) Hexene Plant projects. Achieved remarkable
                        results with a 15% increase in system efficiency and 10% reduction in costs through innovative
                        design solutions and material optimization. Developed and implemented advanced routing
                        strategies that minimized pipe lengths while maintaining accessibility for maintenance and
                        operations. Utilized 3D modeling software to optimize space utilization and reduce potential
                        interference issues.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Technical Analysis and Standards Compliance</h3>
                      <p className="text-muted-foreground">
                        Conducted comprehensive stress analysis using advanced simulation tools to ensure system
                        integrity under various operating conditions. Implemented rigorous quality control processes
                        that significantly reduced design non-conformities. Reviewed and validated over 1,000 equipment
                        connections, developing standardized procedures that improved integration accuracy and minimized
                        field modifications. Created detailed technical specifications that ensured full compliance with
                        ASME, API, and client-specific requirements while maintaining project efficiency.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Documentation and Workflow Optimization</h3>
                      <p className="text-muted-foreground">
                        Revolutionized documentation processes by developing automated templates for Piping Item Lists,
                        including comprehensive catalogs for valves, pipes, and specialty items. This innovation
                        streamlined both construction and engineering workflows, reducing documentation time by 40%
                        while improving accuracy. Implemented digital collaboration tools that enhanced communication
                        between design teams and field personnel, resulting in faster issue resolution and reduced
                        rework.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Safety System Design</h3>
                      <p className="text-muted-foreground">
                        Led the design and implementation of critical safety systems, including PSV and flare header
                        designs, ensuring full compliance with API standards. Developed innovative solutions for
                        pressure relief systems that optimized performance while maintaining safety margins. Provided
                        extensive field technical support, implementing rapid response protocols that resolved design
                        conflicts efficiently and contributed to early milestone completion. Created comprehensive
                        documentation packages that facilitated smooth handover to operations teams.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Process Safety Section */}
              <section id="process-safety-leadership" className="mb-24 scroll-mt-32">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Process Safety Lead</h2>
                </AnimatedHeader>
                <div className="space-y-8">
                  <p className="text-muted-foreground">
                    As Process Safety Lead from January 2023 to August 2024, I revolutionized safety management systems
                    through the integration of data analytics and innovative process improvements.
                  </p>
                  <div className="grid gap-6">
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Safety System Development</h3>
                      <p className="text-muted-foreground">
                        Architected and implemented a comprehensive safety management system for Design Change
                        Notifications (DCNs) and Management of Change (MOCs). This innovative system transformed
                        interdepartmental communication and coordination, establishing clear workflows and
                        accountability measures. Developed standardized templates and procedures that streamlined the
                        review process while ensuring thorough evaluation of safety impacts. Implemented digital
                        tracking systems that provided real-time visibility of safety-critical changes across the
                        organization.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Process Optimization</h3>
                      <p className="text-muted-foreground">
                        Pioneered the development of advanced spreadsheet systems for DCN and MOC tracking, achieving a
                        remarkable 20% reduction in resolution times. Implemented automated notification systems that
                        kept stakeholders informed of critical updates and pending actions. Created dynamic dashboards
                        that provided instant visibility of safety metrics and process status, enabling proactive
                        management of potential issues. Established KPIs that measured system effectiveness and
                        identified areas for continuous improvement.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Data Analytics Integration</h3>
                      <p className="text-muted-foreground">
                        Leveraged Power BI to develop sophisticated analytics tools that transformed safety data into
                        actionable insights. Created predictive models that identified potential safety risks before
                        they materialized, enabling proactive mitigation strategies. Implemented trend analysis tools
                        that tracked safety performance across multiple projects and identified systemic issues
                        requiring attention. Developed custom visualizations that effectively communicated complex
                        safety data to various stakeholder groups.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Cross-Functional Leadership</h3>
                      <p className="text-muted-foreground">
                        Successfully coordinated safety processes across diverse teams, establishing effective
                        communication channels and decision-making protocols. Led cross-functional workshops that
                        aligned safety objectives with operational goals. Developed comprehensive training programs that
                        enhanced safety awareness and compliance across all organizational levels. Created and
                        maintained detailed documentation systems that ensured consistent implementation of safety
                        measures throughout project lifecycles.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Technical Skills Section */}
              <section id="technical-skills" className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Technical Skills</h2>
                </AnimatedHeader>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Engineering Tools</h3>
                    <p className="text-muted-foreground">
                      AutoCAD, Aspen HYSYS, Bentley, AutoPIPE, CAD/CAM, SolidWorks
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Programming</h3>
                    <p className="text-muted-foreground">
                      Python, JavaScript, HTML5, React, Three.js, VS Code, Next.js, Prismic.io
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Data Analysis</h3>
                    <p className="text-muted-foreground">Power BI, R Studio, Jupyter</p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Documentation</h3>
                    <p className="text-muted-foreground">MS Office Suite, Excel Macros, InEight, Primavera P6</p>
                  </div>
                </div>
              </section>

              {/* Education Section */}
              <section id="education">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Education</h2>
                </AnimatedHeader>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">University of Houston, Cullen College of Engineering</h3>
                  <p className="text-muted-foreground">Bachelor of Science in Industrial Engineering</p>
                  <p className="text-muted-foreground">Expected Graduation: May 2026</p>
                  <p className="text-muted-foreground">UH Major GPA: 3.33</p>
                  <div className="pt-4">
                    <h4 className="font-semibold mb-2">Honors</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Academic Excellence Scholarship</li>
                      <li>Cougar Engineer Freshman Scholarship</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
