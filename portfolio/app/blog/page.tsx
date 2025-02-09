import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"
import Link from "next/link"

const blogPosts = [
  {
    title: "5 ESSENTIAL BRANDING TIPS FOR BUSINESSES",
    category: "Studio",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-s3njYaZdQuTDkIeLZBDqgOVSRqyKzz.png",
    description: "Discover key strategies to create a strong brand identity that resonates with your audience.",
    href: "/blog/branding-tips",
  },
  {
    title: "HOW TO DESIGN A USER-FRIENDLY WEBSITE",
    category: "Design",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-s3njYaZdQuTDkIeLZBDqgOVSRqyKzz.png",
    description: "Learn practical tips for designing websites that deliver exceptional user experiences.",
    href: "/blog/user-friendly-design",
  },
  {
    title: "THE IMPORTANCE OF RESPONSIVE DESIGN",
    category: "Design",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-s3njYaZdQuTDkIeLZBDqgOVSRqyKzz.png",
    description: "Why responsive design is crucial for modern web development.",
    href: "/blog/responsive-design",
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container px-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">JOURNAL</h1>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-16 max-w-2xl">
            Explore insights, tips, and trends to elevate your brand strategy.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <Link key={post.title} href={post.href} className="group block">
                <div className="relative aspect-[4/3] mb-6 overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 right-4 bg-black text-white p-2 rounded-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M7 17L17 7M17 7H7M17 7V17"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">({post.category})</div>
                <h2 className="text-xl font-bold mb-2">{post.title}</h2>
                <p className="text-muted-foreground">{post.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

