// Blog Post to Pinterest URL Mapping
// Pinterest pin.it URLs are shortened links for Pinterest sharing/SEO
// Pinterest image URLs are direct image links for display
export const blogPinterestMapping: Record<
  string,
  { pinterestUrl: string; imageUrl: string; altText: string }
> = {
  "cvp-analysis-mobile-service-operations": {
    pinterestUrl: "https://pin.it/4T3EHi3J7",
    imageUrl: "https://i.pinimg.com/1200x/02/b4/9f/02b49fda2f0acdf2791226541faf8e06.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Quantifying Service Profitability: A CVP Analysis of Mobile Service Operations",
  },
  "process-safety-management": {
    pinterestUrl: "https://pin.it/3E6cqi3Jj",
    imageUrl: "https://i.pinimg.com/736x/fb/17/f8/fb17f8189bcf259b927f95e73a9c7563.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Process Safety Management in Industrial Settings",
  },
  "digital-twins": {
    pinterestUrl: "https://pin.it/4JHilwunv",
    imageUrl: "https://i.pinimg.com/736x/55/3c/da/553cda4326ff0de1da4c887e72cd4174.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - The Role of Digital Twins in Modern Engineering",
  },
  "heat-exchanger-design": {
    pinterestUrl: "https://pin.it/2YpbioFKf",
    imageUrl: "https://i.pinimg.com/736x/83/97/8b/83978b0923fe34000f95176090570c66.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Heat Exchanger Design and Selection Guide",
  },
  "project-management-engineers": {
    pinterestUrl: "https://pin.it/o6Aqfnq73",
    imageUrl: "https://i.pinimg.com/736x/f7/4a/d2/f74ad2ba167c47820a501d3219c66a63.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Project Management Best Practices for Engineers",
  },
  "process-piping-systems": {
    pinterestUrl: "https://pin.it/6pfDFGTNF",
    imageUrl: "https://i.pinimg.com/1200x/db/32/cc/db32cc711cc4877bebcf2a6328306e28.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Understanding Process Piping Systems",
  },
  "ai-machine-learning-engineering": {
    pinterestUrl: "https://pin.it/7zY26cTCw",
    imageUrl: "https://i.pinimg.com/736x/6a/0f/cf/6a0fcf78670152c919f00d1d4e99fd31.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - AI and Machine Learning in Engineering Design",
  },
  "energy-efficiency-industrial": {
    pinterestUrl: "https://pin.it/1wQWKWKO4",
    imageUrl: "https://i.pinimg.com/1200x/3f/d6/cd/3fd6cdd9727d3c106e3a279b8873209f.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Energy Efficiency in Industrial Processes",
  },
  "career-development-engineers": {
    pinterestUrl: "https://pin.it/3gnDVrgvZ",
    imageUrl: "https://i.pinimg.com/736x/76/1a/e1/761ae13bbc5a70a569fef997f9878ad6.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Career Development for Engineering Professionals",
  },
  "detailed-engineering": {
    pinterestUrl: "https://pin.it/5dxBShoOD",
    imageUrl: "https://i.pinimg.com/736x/82/66/f5/8266f58234822a6fa736ffdad0ec91be.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Detailed Engineering: The Backbone of EPC Project Execution",
  },
  "fel-stages": {
    pinterestUrl: "https://pin.it/78NAfbeGa",
    imageUrl: "https://i.pinimg.com/736x/af/69/20/af6920aa15a91dbb249e222843699ec6.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - FEL Stages Explained: The Blueprint for Successful EPC Projects",
  },
  "epc-estimating": {
    pinterestUrl: "https://pin.it/1d40p5wae",
    imageUrl: "https://i.pinimg.com/736x/31/bf/ae/31bfae62a577179429f6217cfbaaf96f.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - The Critical Role of Estimating in EPC: Accuracy, Risk, and Cost Control",
  },
  "epc-lifecycle": {
    pinterestUrl: "https://pin.it/15w2m4oxb",
    imageUrl: "https://i.pinimg.com/736x/ba/b8/2c/bab82c35ea22e7e32a6674585ae46e5e.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - Breaking Down the EPC Lifecycle: From Concept to Operation",
  },
  "engineering-technology": {
    pinterestUrl: "https://pin.it/TS6ncLXmF",
    imageUrl: "https://i.pinimg.com/1200x/a6/f0/5e/a6f05e81832acc0c8d1e42a561f30eff.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - The Current State of Engineering Technology: Progress, Gaps, and the Road Ahead",
  },
  "epc-communication": {
    pinterestUrl: "https://pin.it/7MvNLCngB",
    imageUrl: "https://i.pinimg.com/1200x/5c/8c/8d/5c8c8d96326e22b5f305b99569a99cb9.jpg",
    altText: "Luqman Ismat, Engineering Consultant, Houston TX - The Communication Challenge in EPC Projects: Why It's a Make-or-Break Factor",
  },
}

// Helper to get Pinterest URL for a blog slug
export function getPinterestUrl(slug: string): string | undefined {
  return blogPinterestMapping[slug]?.pinterestUrl
}

// Helper to get image URL for a blog slug
export function getBlogImageUrl(slug: string): string | undefined {
  return blogPinterestMapping[slug]?.imageUrl
}

// Helper to get SEO-optimized alt text for a blog slug
export function getBlogAltText(slug: string): string {
  return blogPinterestMapping[slug]?.altText || `${slug} - Luqman Ismat Engineering Blog`
}

