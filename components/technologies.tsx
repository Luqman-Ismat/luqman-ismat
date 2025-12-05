"use client"
import { AnimatedHeader } from "./animated-header"

export function Technologies() {
  const rows = [
    {
      items: ["AspenTech", "PowerBI"],
      duration: "20s",
      direction: "normal",
      fontSize: "text-3xl md:text-4xl lg:text-5xl",
      gradient: "from-gray-800 via-white to-gray-800",
    },
    {
      items: ["AutoPipe", "Python"],
      duration: "25s",
      direction: "reverse",
      fontSize: "text-4xl md:text-5xl lg:text-6xl",
      gradient: "from-black via-gray-600 to-black",
    },
    {
      items: ["Next.js", "Oracle"],
      duration: "22s",
      direction: "normal",
      fontSize: "text-2xl md:text-3xl lg:text-4xl",
      gradient: "from-gray-700 via-white to-gray-700",
    },
    {
      items: ["Primavera P6", "Wrike"],
      duration: "28s",
      direction: "reverse",
      fontSize: "text-5xl md:text-6xl lg:text-7xl",
      gradient: "from-gray-900 via-gray-400 to-gray-900",
    },
    {
      items: ["Jupyter", "AspenTech"],
      duration: "24s",
      direction: "normal",
      fontSize: "text-3xl md:text-4xl lg:text-5xl",
      gradient: "from-black via-gray-500 to-black",
    },
    {
      items: ["PowerBI", "Python"],
      duration: "26s",
      direction: "reverse",
      fontSize: "text-4xl md:text-5xl lg:text-6xl",
      gradient: "from-gray-600 via-white to-gray-600",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4">
        <div>
          <p className="text-muted-foreground text-sm md:text-base mb-4 md:mb-6">(Technologies)</p>
          <AnimatedHeader>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 md:mb-12">
              TOOLS &
              <br />
              EXPERTISE
            </h2>
          </AnimatedHeader>
          <div className="relative space-y-3 md:space-y-4">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="relative overflow-hidden">
                <div 
                  className={`flex gap-8 md:gap-12 lg:gap-16 animate-scroll-${row.direction}`}
                  style={{
                    animationDuration: row.duration,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                  }}
                >
                  {[...row.items, ...row.items, ...row.items, ...row.items, ...row.items, ...row.items].map((tech, index) => (
                    <div
                      key={`${tech}-${index}`}
                      className="flex-shrink-0 group"
                    >
                      <span
                        className={`${row.fontSize} font-bold bg-gradient-to-r ${row.gradient} bg-clip-text text-transparent animate-gradient`}
                        style={{
                          backgroundSize: "200% 200%",
                          animationDuration: "3s",
                          animationIterationCount: "infinite",
                          animationTimingFunction: "linear",
                        }}
                      >
                        {tech}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes scroll-normal {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes scroll-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-scroll-normal {
          animation-name: scroll-normal;
        }
        
        .animate-scroll-reverse {
          animation-name: scroll-reverse;
        }
        
        .animate-gradient {
          animation-name: gradient;
        }
      `}</style>
    </section>
  )
}
