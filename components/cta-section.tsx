import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface CTASectionProps {
  title?: string
  description?: string
  primaryText?: string
  primaryHref?: string
  secondaryText?: string
  secondaryHref?: string
}

export function CTASection({
  title = "Ready to Transform Your Engineering Projects?",
  description = "Let's discuss how innovative engineering solutions can help your organization achieve its goals.",
  primaryText = "Get in Touch",
  primaryHref = "/contact",
  secondaryText = "View Projects",
  secondaryHref = "/projects",
}: CTASectionProps) {
  return (
    <div className="bg-foreground text-background rounded-xl p-8 md:p-12 my-12">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
        <p className="text-lg opacity-90">{description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg" variant="secondary">
            <Link href={primaryHref} className="gap-2">
              {primaryText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-transparent border-background text-background hover:bg-background/10">
            <Link href={secondaryHref}>
              {secondaryText}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

