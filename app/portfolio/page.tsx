"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import { useState, useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { format, differenceInMonths, differenceInYears, parse, startOfMonth, endOfMonth, eachMonthOfInterval, eachYearOfInterval, startOfYear, endOfYear } from "date-fns"
import { GanttTaskRow } from "@/components/gantt-task-row"

// Scroll-triggered animation component
function ScrollReveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ExperienceDetail {
  title: string
  period?: string
  content: string
}

interface GanttTask {
  id: string
  title: string
  startDate: Date
  endDate: Date
  color: string
  barColor: string
  company: string
  description: string
  logo?: string
  location?: string
  type?: "work" | "education" | "skills"
  experiences?: ExperienceDetail[]
  details?: {
    items?: string[]
    honors?: string[]
    degree?: string
    institution?: string
    gpa?: string
    graduationDate?: string
  }
}

export default function PortfolioPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [imagesLoaded, setImagesLoaded] = useState<Record<string, boolean>>({
    chemex: false,
    pinnacle: false,
  })
  const [timeframe, setTimeframe] = useState<"month" | "year">("month")
  const ganttRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  // Parse date ranges and create Gantt tasks
  const parseDate = (dateStr: string): Date => {
    try {
      return parse(dateStr, "MMMM yyyy", new Date())
    } catch {
      return new Date()
    }
  }

  const parseEndDate = (dateStr: string): Date => {
    if (dateStr === "Present") return new Date()
    try {
      return endOfMonth(parse(dateStr, "MMMM yyyy", new Date()))
    } catch {
      return new Date()
    }
  }

  // Calculate earliest start date for education/skills
  const educationStartDate = parseDate("August 2020") // Approximate start of college
  const currentDate = new Date()
  
  // Timeline should start from 2022 when work started
  const workStartDate = parseDate("January 2022")

  const tasks: GanttTask[] = [
    {
      id: "chemex-process",
      title: "Process Engineering",
      startDate: parseDate("May 2022"),
      endDate: parseEndDate("March 2024"),
      color: "bg-blue-500",
      barColor: "bg-blue-500",
      company: "Chemex Global",
      description: "Led P&ID development, AI integration, and process simulation",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chemex-9RNC0f2kDrJf3iwUKYu1jkNPZuJ2BZ.png",
      location: "Houston, TX",
      type: "work",
      experiences: [
        {
          title: "P&ID Development and AI Integration",
          content:
            "Led the development and delivery of over 100 Piping & Instrumentation Diagrams (P&IDs) for complex systems including pyrolysis reactors and gas detection networks. Pioneered an AI-powered validation tool that revolutionized the review process, achieving a 20% reduction in errors and significantly improving efficiency. This tool incorporated machine learning algorithms to detect common design inconsistencies and verify compliance with ASME and client-specific standards.",
        },
        {
          title: "Process Simulation and Optimization",
          content:
            "Developed a sophisticated heat and material balance (HMB) export tool for Aspen HYSYS that transformed data extraction and analysis workflows. This innovation resulted in a 10% improvement in system efficiency and enhanced accuracy in process calculations. The tool automated complex data processing tasks, enabling rapid iteration of design scenarios and optimization of process parameters. Additionally, implemented advanced simulation models for critical unit operations, leading to optimized operating conditions and reduced energy consumption.",
        },
        {
          title: "Equipment Design and Specifications",
          content:
            "Managed comprehensive design and sizing initiatives for critical process equipment across multiple projects. This included detailed engineering for tanks, vessels, heat exchangers, pumps, distillation columns, knockout drums, flares, and firewater systems. Developed and maintained extensive technical documentation, including Basis of Design (BOD), Block Flow Diagrams (BFD), Process Flow Diagrams (PFD), and Material Selection Diagrams (MSD). Implemented innovative design methodologies that resulted in optimized equipment performance and reduced capital costs while maintaining strict compliance with industry standards.",
        },
        {
          title: "Safety and Operational Excellence",
          content:
            "Played a pivotal role in HAZOP and HAZIP studies, successfully identifying and resolving over 30 critical safety and operability issues. Developed comprehensive startup and commissioning calculations for major projects including Freepoint (Simon, Eloy, Ghent) and Tesla (Mosaic). Created detailed operating procedures and troubleshooting guides that significantly reduced startup times and improved operational reliability. Implemented risk assessment methodologies that enhanced process safety while maintaining optimal production efficiency.",
        },
      ],
    },
    {
      id: "chemex-safety",
      title: "Process Safety Lead",
      startDate: parseDate("January 2023"),
      endDate: parseEndDate("August 2024"),
      color: "bg-purple-500",
      barColor: "bg-purple-500",
      company: "Chemex Global",
      description: "Safety management systems and analytics",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chemex-9RNC0f2kDrJf3iwUKYu1jkNPZuJ2BZ.png",
      location: "Houston, TX",
      type: "work",
      experiences: [
        {
          title: "Safety System Development",
          content:
            "Architected and implemented a comprehensive safety management system for Design Change Notifications (DCNs) and Management of Change (MOCs). This innovative system transformed interdepartmental communication and coordination, establishing clear workflows and accountability measures. Developed standardized templates and procedures that streamlined the review process while ensuring thorough evaluation of safety impacts. Implemented digital tracking systems that provided real-time visibility of safety-critical changes across the organization.",
        },
        {
          title: "Process Optimization",
          content:
            "Pioneered the development of advanced spreadsheet systems for DCN and MOC tracking, achieving a remarkable 20% reduction in resolution times. Implemented automated notification systems that kept stakeholders informed of critical updates and pending actions. Created dynamic dashboards that provided instant visibility of safety metrics and process status, enabling proactive management of potential issues. Established KPIs that measured system effectiveness and identified areas for continuous improvement.",
        },
        {
          title: "Data Analytics Integration",
          content:
            "Leveraged Power BI to develop sophisticated analytics tools that transformed safety data into actionable insights. Created predictive models that identified potential safety risks before they materialized, enabling proactive mitigation strategies. Implemented trend analysis tools that tracked safety performance across multiple projects and identified systemic issues requiring attention. Developed custom visualizations that effectively communicated complex safety data to various stakeholder groups.",
        },
        {
          title: "Cross-Functional Leadership",
          content:
            "Successfully coordinated safety processes across diverse teams, establishing effective communication channels and decision-making protocols. Led cross-functional workshops that aligned safety objectives with operational goals. Developed comprehensive training programs that enhanced safety awareness and compliance across all organizational levels. Created and maintained detailed documentation systems that ensured consistent implementation of safety measures throughout project lifecycles.",
        },
      ],
    },
    {
      id: "chemex-piping",
      title: "Piping Systems Engineering",
      startDate: parseDate("March 2024"),
      endDate: parseEndDate("August 2024"),
      color: "bg-green-500",
      barColor: "bg-green-500",
      company: "Chemex Global",
      description: "Complex piping layouts and system optimization",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Chemex-9RNC0f2kDrJf3iwUKYu1jkNPZuJ2BZ.png",
      location: "Houston, TX",
      type: "work",
      experiences: [
        {
          title: "Project Implementation and Optimization",
          content:
            "Spearheaded the design and implementation of complex piping layouts for major projects including the Braven (Cobra) Pyrolysis and Arcanum (Hawk) Hexene Plant projects. Achieved remarkable results with a 15% increase in system efficiency and 10% reduction in costs through innovative design solutions and material optimization. Developed and implemented advanced routing strategies that minimized pipe lengths while maintaining accessibility for maintenance and operations. Utilized 3D modeling software to optimize space utilization and reduce potential interference issues.",
        },
        {
          title: "Technical Analysis and Standards Compliance",
          content:
            "Conducted comprehensive stress analysis using advanced simulation tools to ensure system integrity under various operating conditions. Implemented rigorous quality control processes that significantly reduced design non-conformities. Reviewed and validated over 1,000 equipment connections, developing standardized procedures that improved integration accuracy and minimized field modifications. Created detailed technical specifications that ensured full compliance with ASME, API, and client-specific requirements while maintaining project efficiency.",
        },
        {
          title: "Documentation and Workflow Optimization",
          content:
            "Revolutionized documentation processes by developing automated templates for Piping Item Lists, including comprehensive catalogs for valves, pipes, and specialty items. This innovation streamlined both construction and engineering workflows, reducing documentation time by 40% while improving accuracy. Implemented digital collaboration tools that enhanced communication between design teams and field personnel, resulting in faster issue resolution and reduced rework.",
        },
        {
          title: "Safety System Design",
          content:
            "Led the design and implementation of critical safety systems, including PSV and flare header designs, ensuring full compliance with API standards. Developed innovative solutions for pressure relief systems that optimized performance while maintaining safety margins. Provided extensive field technical support, implementing rapid response protocols that resolved design conflicts efficiently and contributed to early milestone completion. Created comprehensive documentation packages that facilitated smooth handover to operations teams.",
        },
      ],
    },
    {
      id: "pinnacle-analyst",
      title: "Reliability Data Analyst",
      startDate: parseDate("May 2025"),
      endDate: parseEndDate("Present"),
      color: "bg-orange-500",
      barColor: "bg-orange-500",
      company: "Pinnacle Reliability",
      description: "Data-driven reliability optimization and analytics",
      logo: "/images/pinnacle-logo.png",
      location: "Houston, TX",
      type: "work",
      experiences: [
        {
          title: "Data Analysis and Reporting",
          content:
            "Developed comprehensive reliability analytics dashboards using Power BI and SQL, transforming raw operational data into strategic insights. Created automated reporting systems that tracked key performance indicators (KPIs) including MTBF, MTTR, and asset availability. Designed predictive models that identified potential failure modes before they impacted operations, enabling proactive maintenance strategies.",
        },
        {
          title: "Statistical Analysis and Modeling",
          content:
            "Applied advanced statistical methods including Weibull analysis, regression modeling, and reliability block diagrams to assess asset performance and optimize maintenance intervals. Utilized Python and R for complex data manipulation and statistical analysis, processing large datasets from CMMS and SCADA systems. Developed reliability-centered maintenance (RCM) recommendations based on data-driven failure analysis.",
        },
        {
          title: "Root Cause Analysis",
          content:
            "Led data-driven root cause investigations for equipment failures, combining statistical analysis with engineering principles to identify underlying issues. Created visualization tools that facilitated cross-functional collaboration and communication of findings to technical and non-technical stakeholders. Implemented structured problem-solving methodologies that improved investigation efficiency and accuracy.",
        },
        {
          title: "Process Improvement",
          content:
            "Designed and implemented data collection workflows that enhanced data quality and completeness. Developed standardized templates and procedures for reliability analysis that improved consistency across multiple projects. Collaborated with engineering and operations teams to translate analytical findings into actionable maintenance strategies, resulting in improved asset performance and reduced operational costs.",
        },
      ],
    },
    {
      id: "technical-skills",
      title: "Technical Skills",
      startDate: workStartDate,
      endDate: currentDate,
      color: "bg-indigo-500",
      barColor: "bg-indigo-500",
      company: "Continuous Development",
      description: "Engineering tools, programming, data analysis, and documentation",
      type: "skills",
      details: {
        items: [
          "Engineering Tools: AutoCAD, Aspen HYSYS, Bentley, AutoPIPE, CAD/CAM, SolidWorks",
          "Programming: Python, JavaScript, HTML5, React, Three.js, VS Code, Next.js, Prismic.io",
          "Data Analysis: Power BI, R Studio, Jupyter, SQL",
          "Documentation: MS Office Suite, Excel Macros, InEight, Primavera P6",
        ],
      },
    },
    {
      id: "education",
      title: "Education",
      startDate: workStartDate,
      endDate: parseEndDate("May 2026"),
      color: "bg-teal-500",
      barColor: "bg-teal-500",
      company: "University of Houston",
      description: "Bachelor of Science in Industrial Engineering",
      location: "Houston, TX",
      type: "education",
      details: {
        institution: "University of Houston, Cullen College of Engineering",
        degree: "Bachelor of Science in Industrial Engineering",
        graduationDate: "May 2026",
        gpa: "UH Major GPA: 3.33",
        honors: ["Academic Excellence Scholarship", "Cougar Engineer Freshman Scholarship"],
      },
    },
  ]

  // Calculate timeline range - start from 2022 when work started
  const minDate = startOfMonth(workStartDate)
  const maxDate = endOfMonth(currentDate)
  
  // Generate timeline intervals based on timeframe selection
  const timelineIntervals = timeframe === "month" 
    ? eachMonthOfInterval({ start: minDate, end: maxDate })
    : eachYearOfInterval({ start: startOfYear(minDate), end: endOfYear(maxDate) })

  // Calculate position and width for a task bar
  const getTaskPosition = (task: GanttTask) => {
    if (timeframe === "month") {
      const start = startOfMonth(task.startDate)
      const end = endOfMonth(task.endDate)
      const totalMonths = differenceInMonths(maxDate, minDate) + 1
      const startOffset = differenceInMonths(start, minDate)
      const duration = differenceInMonths(end, start) + 1
      const leftPercent = (startOffset / totalMonths) * 100
      const widthPercent = (duration / totalMonths) * 100
      return { leftPercent, widthPercent, duration, unit: "mo" as const }
    } else {
      const start = startOfYear(task.startDate)
      const end = endOfYear(task.endDate)
      const totalYears = differenceInYears(endOfYear(maxDate), startOfYear(minDate)) + 1
      const startOffset = differenceInYears(start, startOfYear(minDate))
      const duration = differenceInYears(end, start) + 1
      const leftPercent = (startOffset / totalYears) * 100
      const widthPercent = (duration / totalYears) * 100
      return { leftPercent, widthPercent, duration, unit: "yr" as const }
    }
  }

  return (
    <ScrollToTopWrapper>
      <div
        className="flex flex-col min-h-screen w-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--muted)) 100%)",
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.01) 10px, rgba(255,255,255,0.01) 20px),
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)
          `,
          backgroundSize: "20px 20px, 20px 20px",
        }}
      >
        <Header />
        <main className="pt-32 pb-24">
          <div className="container px-4">
              {/* Header Section */}
            <ScrollReveal>
              <div className="mb-16">
                <AnimatedHeader>
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">PORTFOLIO</h1>
                </AnimatedHeader>
                <p className="text-2xl text-muted-foreground max-w-3xl mb-6">
                  Professional experience timeline showcasing innovative engineering solutions and data-driven insights.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimeframe("month")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeframe === "month"
                        ? "bg-card border border-border/50 text-foreground shadow-md"
                        : "bg-card/50 border border-border/30 text-muted-foreground hover:bg-card/70 hover:text-foreground"
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setTimeframe("year")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      timeframe === "year"
                        ? "bg-card border border-border/50 text-foreground shadow-md"
                        : "bg-card/50 border border-border/30 text-muted-foreground hover:bg-card/70 hover:text-foreground"
                    }`}
                  >
                    Year
                  </button>
                </div>
                    </div>
            </ScrollReveal>

            {/* Gantt Chart */}
            <div
              ref={ganttRef}
              className="bg-card/90 backdrop-blur-sm border border-border/40 rounded-xl overflow-hidden shadow-xl"
              style={{
                background: "hsl(var(--card))",
                backgroundImage: `
                  repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px),
                  radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)
                `,
                backgroundSize: "20px 20px, 20px 20px",
              }}
            >
              {/* Gantt Header */}
              <div className="border-b border-border/40 bg-card/60 backdrop-blur-sm">
                <div className="flex">
                  <div className="w-[300px] flex-shrink-0 p-5 border-r border-border/40">
                    <h2 className="text-lg font-semibold mb-0.5 text-foreground">Role / Company</h2>
                    <p className="text-xs text-muted-foreground">Professional Experience</p>
                  </div>
                  <div className="flex-1 p-5">
                    <h2 className="text-lg font-semibold mb-0.5 text-foreground">Timeline</h2>
                    <p className="text-xs text-muted-foreground">
                      {timeframe === "month" 
                        ? `${format(minDate, "MMM yyyy")} - ${format(maxDate, "MMM yyyy")}`
                        : `${format(startOfYear(minDate), "yyyy")} - ${format(endOfYear(maxDate), "yyyy")}`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Timeline Container */}
              <div className="overflow-x-auto scrollbar-hide">
              {/* Timeline Header */}
              <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-20">
                <div className="flex min-w-max">
                  <div className="w-[300px] flex-shrink-0 p-3 border-r border-border/40"></div>
                  <div className="relative flex" style={{ minHeight: "50px" }}>
                    {timelineIntervals.map((interval, index) => {
                      const isCurrent = timeframe === "month"
                        ? format(interval, "yyyy-MM") === format(new Date(), "yyyy-MM")
                        : format(interval, "yyyy") === format(new Date(), "yyyy")
                      return (
                        <div
                          key={index}
                          className="flex-shrink-0 border-r border-border/20 relative"
                          style={{ minWidth: timeframe === "month" ? "120px" : "200px" }}
                        >
                          <div className="p-2 text-center">
                            {timeframe === "month" ? (
                              <>
                                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                                  {format(interval, "MMM")}
                                </div>
                                <div className="text-xs font-semibold text-foreground">{format(interval, "yyyy")}</div>
                              </>
                            ) : (
                              <div className="text-sm font-semibold text-foreground">{format(interval, "yyyy")}</div>
                            )}
                  </div>
                          {isCurrent && (
                            <div className="absolute top-0 bottom-0 w-0.5 bg-purple-500 left-1/2 -translate-x-1/2 z-30">
                              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-card" />
                  </div>
                          )}
                  </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Gantt Rows */}
              <div className="divide-y divide-border/20">
                  {tasks.map((task, index) => {
                    const { leftPercent, widthPercent, duration, unit } = getTaskPosition(task)

                    return (
                      <div key={task.id} className="relative">
                        <ScrollReveal delay={index * 0.15}>
                          <GanttTaskRow
                            task={task}
                            leftPercent={leftPercent}
                            widthPercent={widthPercent}
                            duration={duration}
                            durationUnit={unit}
                            index={index}
                            timelineIntervals={timelineIntervals}
                            timeframe={timeframe}
                            imagesLoaded={imagesLoaded}
                            isLoading={isLoading}
                            onImageLoad={(key) => setImagesLoaded((prev) => ({ ...prev, [key]: true }))}
                            getTaskPosition={(taskDates) => {
                              if (timeframe === "month") {
                                const start = startOfMonth(taskDates.startDate)
                                const end = endOfMonth(taskDates.endDate)
                                const totalMonths = differenceInMonths(maxDate, minDate) + 1
                                const startOffset = differenceInMonths(start, minDate)
                                const duration = differenceInMonths(end, start) + 1
                                const leftPercent = (startOffset / totalMonths) * 100
                                const widthPercent = (duration / totalMonths) * 100
                                return { leftPercent, widthPercent, duration, unit: "mo" as const }
                              } else {
                                const start = startOfYear(taskDates.startDate)
                                const end = endOfYear(taskDates.endDate)
                                const totalYears = differenceInYears(endOfYear(maxDate), startOfYear(minDate)) + 1
                                const startOffset = differenceInYears(start, startOfYear(minDate))
                                const duration = differenceInYears(end, start) + 1
                                const leftPercent = (startOffset / totalYears) * 100
                                const widthPercent = (duration / totalYears) * 100
                                return { leftPercent, widthPercent, duration, unit: "yr" as const }
                              }
                            }}
                          />
                        </ScrollReveal>
                  </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </ScrollToTopWrapper>
  )
}
