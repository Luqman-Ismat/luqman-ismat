import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-24">
        <div className="container px-4">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8">AHOJ KAYO</h1>
          <p className="text-2xl md:text-3xl text-muted-foreground mb-16 max-w-2xl">
            Our mission, values, & the passionate team behind our success.
          </p>
          <div className="relative aspect-[21/9] mb-16">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-utfU7LB1rXyVDfhM0NCchCl6CQPP6m.png"
              alt="Team at work"
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-8">
                We strive to create innovative solutions that empower businesses to thrive in the digital age. Through
                our expertise in engineering and technology, we help organizations transform their operations and
                achieve sustainable growth.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-6">Our Values</h2>
              <ul className="space-y-4 text-muted-foreground">
                <li>Innovation in everything we do</li>
                <li>Excellence in service delivery</li>
                <li>Integrity in our relationships</li>
                <li>Collaboration with our clients</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

