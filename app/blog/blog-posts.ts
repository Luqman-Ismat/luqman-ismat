export type BlogPost = {
  title: string
  category: string
  image: string
  description: string
  href: string
  /** ISO-8601 publication date. Used by the index list and the RSS feed. */
  date: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    title: "Quantifying Service Profitability: A CVP Analysis of Mobile Service Operations in Houston, TX",
    category: "PROJECT MANAGEMENT",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "An in-depth Cost-Volume-Profit analysis examining revenue drivers, variable costs, and profitability thresholds for mobile service operations in Houston, Texas.",
    href: "/blog/cvp-analysis-mobile-service-operations",
    date: "2025-01-15T03:00:00.000Z",
  },
  {
    title: "Process Safety Management in Industrial Settings",
    category: "PROCESS ENGINEERING",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "A comprehensive guide to Process Safety Management, HAZOP, LOPA, and risk assessment methodologies for ensuring safety in industrial facilities.",
    href: "/blog/process-safety-management",
    date: "2025-10-11T12:00:00.000Z",
  },
  {
    title: "The Role of Digital Twins in Modern Engineering",
    category: "ENGINEERING TECHNOLOGY",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "Discover how digital twin technology is revolutionizing engineering through virtual replicas, real-time monitoring, and predictive capabilities.",
    href: "/blog/digital-twins",
    date: "2025-10-11T13:00:00.000Z",
  },
  {
    title: "Heat Exchanger Design and Selection Guide",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "A comprehensive guide to heat exchanger design principles, types, thermal calculations, and selection criteria for optimal performance.",
    href: "/blog/heat-exchanger-design",
    date: "2025-10-11T14:00:00.000Z",
  },
  {
    title: "Project Management Best Practices for Engineers",
    category: "PROJECT MANAGEMENT",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "Master the essential project management skills that every engineering professional needs, from planning to stakeholder management.",
    href: "/blog/project-management-engineers",
    date: "2025-10-11T15:00:00.000Z",
  },
  {
    title: "Understanding Process Piping Systems",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "Comprehensive guide to process piping design including pipe sizing, materials selection, and pressure drop optimization.",
    href: "/blog/process-piping-systems",
    date: "2025-10-11T16:00:00.000Z",
  },
  {
    title: "AI and Machine Learning in Engineering Design",
    category: "ENGINEERING TECHNOLOGY",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "Discover how AI and ML are revolutionizing engineering through optimization algorithms, predictive analytics, and intelligent automation.",
    href: "/blog/ai-machine-learning-engineering",
    date: "2025-10-11T17:00:00.000Z",
  },
  {
    title: "Energy Efficiency in Industrial Processes",
    category: "PROCESS ENGINEERING",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "Comprehensive guide to improving energy efficiency through pinch analysis, waste heat recovery, and advanced optimization techniques.",
    href: "/blog/energy-efficiency-industrial",
    date: "2025-10-11T18:00:00.000Z",
  },
  {
    title: "Career Development for Engineering Professionals",
    category: "CAREER DEVELOPMENT",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "Strategic guidance for advancing your engineering career through certifications, networking, continuous learning, and leadership roles.",
    href: "/blog/career-development-engineers",
    date: "2025-10-11T19:00:00.000Z",
  },
  {
    title: "Detailed Engineering: The Backbone of EPC Project Execution",
    category: "EPC LIFECYCLE",
    image: "/images/detailed-engineering-blog.jpeg",
    description:
      "Exploring the critical role of detailed engineering in ensuring constructability, efficiency, and cost control in EPC projects.",
    href: "/blog/detailed-engineering",
    date: "2025-03-11T03:00:00.000Z",
  },
  {
    title: "FEL Stages Explained: The Blueprint for Successful EPC Projects",
    category: "EPC LIFECYCLE",
    image: "/images/fel-stages-blog.jpeg",
    description:
      "Breaking down the Front-End Loading (FEL) stages and their role in minimizing risk and maximizing project success in EPC.",
    href: "/blog/fel-stages",
    date: "2025-03-11T03:00:00.000Z",
  },
  {
    title: "The Critical Role of Estimating in EPC: Accuracy, Risk, and Cost Control",
    category: "EPC LIFECYCLE",
    image: "/images/epc-estimating-blog.jpeg",
    description:
      "Understanding why precise estimation is the backbone of successful EPC project execution, from conceptual estimates to detailed cost analysis.",
    href: "/blog/epc-estimating",
    date: "2025-03-11T03:00:00.000Z",
  },
  {
    title: "Breaking Down the EPC Lifecycle: From Concept to Operation",
    category: "EPC LIFECYCLE",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thomas-werneken-2hC-ehLJIjg-unsplash%20(2).jpg-fmamlXgtD43e1ssjbkGTKnvFZCKLc7.jpeg",
    description:
      "A comprehensive guide to the Engineering, Procurement, and Construction lifecycle, from initial concept to final operation.",
    href: "/blog/epc-lifecycle",
    date: "2025-10-11T20:00:00.000Z",
  },
  {
    title: "The Current State of Engineering Technology: Progress, Gaps, and the Road Ahead",
    category: "ENGINEERING TECHNOLOGY",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/blake-connally-IKUYGCFmfw4-unsplash.jpg-0z59RONP3VknWJW7WTTxt5BTdr6NFr.jpeg",
    description:
      "An in-depth analysis of engineering technology's current state, examining progress, challenges, and the path forward in digital transformation.",
    href: "/blog/engineering-technology",
    date: "2025-10-11T21:00:00.000Z",
  },
  {
    title: "The Communication Challenge in EPC Projects: Why It's a Make-or-Break Factor",
    category: "EPC LIFECYCLE",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/product-school-XZkk5xT8Xrk-unsplash%20(1).jpg-xdC0zNLpYvZV5amqGy0gWaBLGJa5ny.jpeg",
    description:
      "Explore how effective communication shapes EPC project success, and learn strategies to overcome common communication challenges in complex engineering projects.",
    href: "/blog/epc-communication",
    date: "2025-10-11T22:00:00.000Z",
  },
]

export const BLOG_CATEGORIES = Array.from(new Set(BLOG_POSTS.map((p) => p.category))).sort()
