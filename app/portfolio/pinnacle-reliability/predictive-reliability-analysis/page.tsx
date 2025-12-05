import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "@/components/animated-header"
import Image from "next/image"
import { ScrollToTopWrapper } from "@/components/scroll-to-top-wrapper"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Portfolio | Predictive Reliability Analysis - Luqman Ismat",
  description:
    "Advanced statistical modeling and predictive analytics for asset reliability optimization at Pinnacle Reliability.",
  alternates: {
    canonical: "https://www.luqmanismat.com/portfolio/pinnacle-reliability/predictive-reliability-analysis",
  },
}

export default function PredictiveReliabilityAnalysisPage() {
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
                    Predictive Reliability Analysis
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
                  Advanced statistical modeling and predictive analytics for asset reliability optimization.
                </p>
              </div>

              {/* Overview Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Overview</h2>
                </AnimatedHeader>
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    Developed comprehensive predictive reliability models using advanced statistical methods to forecast
                    asset failure probabilities and optimize maintenance strategies. This project involved extensive data
                    analysis, statistical modeling, and implementation of reliability-centered maintenance principles to
                    enhance operational efficiency and reduce unplanned downtime.
                  </p>
                </div>
              </section>

              {/* Statistical Analysis Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Statistical Analysis and Modeling</h2>
                </AnimatedHeader>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Weibull Analysis Implementation</h3>
                    <p className="text-muted-foreground">
                      Applied Weibull distribution analysis to model failure patterns across multiple asset types,
                      enabling accurate prediction of failure times and identification of failure modes. Developed Python
                      scripts to automate Weibull parameter estimation and goodness-of-fit testing, processing thousands
                      of failure records efficiently. Created visualization dashboards in Power BI that displayed failure
                      distributions, reliability curves, and confidence intervals for decision-making.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Regression Modeling and Trend Analysis</h3>
                    <p className="text-muted-foreground">
                      Built regression models to identify relationships between operating conditions and failure rates,
                      incorporating variables such as operating hours, environmental conditions, and maintenance history.
                      Developed time-series analysis tools to detect degradation trends and predict maintenance
                      requirements. Implemented machine learning algorithms to improve prediction accuracy and identify
                      complex patterns in operational data.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Processing Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Data Processing and Integration</h2>
                </AnimatedHeader>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Multi-Source Data Integration</h3>
                    <p className="text-muted-foreground">
                      Integrated data from multiple sources including CMMS systems, SCADA databases, and maintenance
                      records to create comprehensive reliability datasets. Developed SQL queries and ETL processes to
                      clean, transform, and standardize data from disparate systems. Created automated data validation
                      procedures to ensure data quality and completeness for analysis.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Advanced Analytics Workflows</h3>
                    <p className="text-muted-foreground">
                      Designed and implemented Python-based analytical workflows using libraries including pandas,
                      scipy, and scikit-learn for statistical analysis. Developed R scripts for specialized reliability
                      analysis including accelerated life testing and degradation modeling. Created reproducible analysis
                      pipelines that could be applied across multiple asset classes and facilities.
                    </p>
                  </div>
                </div>
              </section>

              {/* Results and Impact Section */}
              <section className="mb-24">
                <AnimatedHeader>
                  <h2 className="text-3xl md:text-4xl font-bold mb-8">Results and Impact</h2>
                </AnimatedHeader>
                <div className="space-y-6 text-muted-foreground">
                  <p>
                    The predictive reliability analysis project delivered significant value through improved maintenance
                    planning, reduced unplanned failures, and optimized resource allocation. The models successfully
                    identified high-risk assets requiring immediate attention and enabled proactive maintenance
                    scheduling that minimized operational disruptions.
                  </p>
                  <p>
                    Key outcomes included enhanced visibility into asset reliability, data-driven maintenance
                    prioritization, and establishment of predictive analytics capabilities that continue to support
                    ongoing reliability improvements.
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

