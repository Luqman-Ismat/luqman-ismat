import Link from "next/link"

export function Footer() {
  const footerSections = [
    {
      title: "(Pages)",
      links: [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "(Socials)",
      links: [
        { label: "Instagram", href: "https://www.instagram.com/luqman.ismat/" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/luqman-ismat/" },
        { label: "Twitter", href: "https://x.com/LuqmanMIsmat" },
        { label: "GitHub", href: "https://github.com/Luqman-Ismat" },
      ],
    },
  ]

  return (
    <footer className="bg-background py-24">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-24">
          {/* Left side - Name and Copyright */}
          <div className="space-y-2">
            <div className="text-6xl font-bold tracking-widest text-muted-foreground/20">
              <div>LUQMAN</div>
              <div>ISMAT</div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <span>©</span>
              <span>2025</span>
            </div>
          </div>

          {/* Right side - Navigation */}
          <div className="flex justify-center flex-grow">
            <div className="grid grid-cols-2 gap-12 md:gap-24">
              {footerSections.map((section) => (
                <div key={section.title} className="space-y-6">
                  <h3 className="text-muted-foreground">{section.title}</h3>
                  <ul className="space-y-4">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link href={link.href} className="hover:text-primary transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
