import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AnimatedHeader } from "./animated-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { SchemaImage } from "./schema-image"

interface BlogPostLayoutProps {
  title: string
  description: string
  image: string
  content: {
    sections: {
      title: string
      content: string[]
    }[]
  }
  date: string
}

export function BlogPostLayout({ title, description, image, content, date }: BlogPostLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Header />

      {/* Main content with background */}
      <div className="relative flex-1">
        {/* Background image container that ends with content */}
        <div className="absolute inset-0 h-full">
          <SchemaImage
            src={image || "/placeholder.svg"}
            alt={`Luqman Ismat - ${title} Blog Post Cover`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <main className="relative pt-32 pb-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left side - Empty to maintain layout */}
              <div className="hidden md:block" />

              {/* Right side - Content with blurred background */}
              <div className="relative">
                <div className="bg-white/75 dark:bg-black/75 backdrop-blur-xl p-8 md:p-12 rounded-lg space-y-12 text-black dark:text-white transition-colors duration-300">
                  <div className="space-y-6">
                    <AnimatedHeader>
                      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">{title}</h1>
                    </AnimatedHeader>
                    <p className="text-xl text-black/80 dark:text-white/80">{description}</p>

                    {/* Author and Date */}
                    <div className="flex items-center gap-4 pt-4 border-t border-black/10 dark:border-white/10">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_6381.JPEG-lpIjwYNLkaXy1mKKPWSnwXK30H19ZI.jpeg"
                          alt="Luqman Ismat"
                        />
                        <AvatarFallback>LI</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Luqman Ismat</div>
                        <div className="text-sm text-black/60 dark:text-white/60">
                          {format(new Date(date), "MMMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="space-y-12">
                    {content.sections.map((section, index) => (
                      <div key={index} className="space-y-4">
                        <AnimatedHeader>
                          <h2 className="text-2xl font-bold tracking-tight">{section.title}</h2>
                        </AnimatedHeader>
                        {section.content.map((paragraph, pIndex) => (
                          <p key={pIndex} className="text-black/80 dark:text-white/80 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
