import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Image from "next/image"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Data-Driven Maintenance Optimization — Luqman Ismat | Pinnacle Reliability",
  description:
    "How Luqman Ismat optimized maintenance strategies at Pinnacle Reliability using reliability data, statistical modeling, and analytics for industrial assets.",
  keywords: [
    "Luqman Ismat",
    "Maintenance optimization",
    "Reliability-centered maintenance",
    "RCM",
    "Pinnacle Reliability",
    "Reliability data",
    "Predictive maintenance",
  ],
  openGraph: {
    type: "article",
    url: "https://www.luqmanismat.com/portfolio/pinnacle-reliability/maintenance-optimization",
    title: "Data-Driven Maintenance Optimization — by Luqman Ismat",
    description:
      "Reliability-data-driven maintenance optimization by Luqman Ismat at Pinnacle Reliability.",
    images: [{ url: "https://www.luqmanismat.com/og-image.jpg", width: 1200, height: 630, alt: "Maintenance Optimization — by Luqman Ismat" }],
  },
  alternates: { canonical: "https://www.luqmanismat.com/portfolio/pinnacle-reliability/maintenance-optimization" },
}

export default function MaintenanceOptimizationPage() {
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
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter">
                    Data-Driven Maintenance Optimization
                  </h1>
                  <Image
                    src="/images/pinnacle-logo.png"
                    alt="Pinnacle Reliability - DATA-DRIVEN RELIABILITY"
                    width={200}
                    height={80}
                    className="w-[200px] h-auto"
                  />
                </div>
                <p className="text-2xl text-muted-foreground">
                  Comprehensive analysis and optimization of maintenance strategies using reliability data.
                </p>
              </div>

              {/* Overview Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Overview</h2>
                </AnimatedHeader>
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    Led a comprehensive analysis project to optimize maintenance strategies through data-driven
                    methodologies, combining reliability analysis with cost optimization principles. This initiative
                    involved evaluating current maintenance practices, analyzing failure patterns, and developing
                    recommendations for improved maintenance intervals and strategies that balanced reliability
                    requirements with operational costs.
                  </p>
                </div>
              </section>

              {/* Maintenance Strategy Analysis Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Maintenance Strategy Analysis</h2>
                </AnimatedHeader>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Current State Assessment</h3>
                    <p className="text-muted-foreground">
                      Conducted comprehensive analysis of existing maintenance programs, reviewing maintenance
                      frequencies, task effectiveness, and resource utilization. Developed data collection frameworks
                      to capture maintenance history, failure events, and associated costs. Created analytical models
                      to quantify the effectiveness of different maintenance strategies and identify opportunities for
                      optimization.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Reliability-Centered Maintenance (RCM) Implementation</h3>
                    <p className="text-muted-foreground">
                      Applied RCM principles to systematically evaluate maintenance requirements for critical assets,
                      determining optimal maintenance tasks based on failure modes and consequences. Developed failure
                      mode and effects analysis (FMEA) tools to prioritize maintenance activities. Created maintenance
                      strategy matrices that balanced preventive, predictive, and run-to-failure approaches based on
                      risk and cost considerations.
                    </p>
                  </div>
                </div>
              </section>

              {/* Cost-Benefit Analysis Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Cost-Benefit Analysis and Optimization</h2>
                </AnimatedHeader>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Economic Analysis Models</h3>
                    <p className="text-muted-foreground">
                      Developed cost-benefit analysis models that evaluated maintenance strategies from both reliability
                      and economic perspectives. Quantified the total cost of ownership including maintenance costs,
                      downtime costs, and failure consequences. Created optimization algorithms to identify maintenance
                      intervals that minimized total lifecycle costs while meeting reliability targets.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">KPI Development and Tracking</h3>
                    <p className="text-muted-foreground">
                      Established key performance indicators (KPIs) including maintenance cost per unit production,
                      maintenance effectiveness, and overall equipment effectiveness (OEE). Designed Power BI dashboards
                      that tracked KPIs in real-time, enabling continuous monitoring of maintenance program performance.
                      Developed automated reporting systems that provided insights to management for strategic
                      decision-making.
                    </p>
                  </div>
                </div>
              </section>

              {/* Implementation and Results Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Implementation and Results</h2>
                </AnimatedHeader>
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    The maintenance optimization project resulted in significant improvements in both reliability and
                    cost efficiency. By applying data-driven methodologies, we identified opportunities to optimize
                    maintenance intervals, eliminate unnecessary tasks, and reallocate resources to higher-value
                    activities. The analysis provided actionable recommendations that were implemented across multiple
                    facilities, leading to improved asset reliability and reduced maintenance costs.
                  </p>
                  <p>
                    The project established a framework for ongoing maintenance optimization that continues to deliver
                    value through continuous improvement and data-driven decision-making. The methodologies and tools
                    developed have been adopted as standard practices for maintenance strategy evaluation.
                  </p>
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

