import Link from "next/link"

export function Footer() {
  const footerSections = [
    {
      title: "(Pages)",
      links: [
        { label: "Home", href: "/" },
        { label: "Service", href: "/service" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "(CMS)",
      links: [
        { label: "Work", href: "/work" },
        { label: "Work Single", href: "/work/single" },
        { label: "Blog", href: "/blog" },
        { label: "Blog Single", href: "/blog/single" },
        { label: "Pricing", href: "/pricing" },
        { label: "Cart (3)", href: "/cart", italic: true },
      ],
    },
    {
      title: "(Utility Pages)",
      links: [
        { label: "404", href: "/404" },
        { label: "Password Page", href: "/password" },
        { label: "Changelog", href: "/changelog" },
        { label: "Licensing", href: "/licensing" },
        { label: "Styleguide", href: "/styleguide" },
      ],
    },
    {
      title: "(Socials)",
      links: [
        { label: "Instagram", href: "https://instagram.com" },
        { label: "Behance", href: "https://behance.net" },
        { label: "Dribbble", href: "https://dribbble.com" },
        { label: "Pinterest", href: "https://pinterest.com" },
      ],
    },
  ]

  return (
    <footer className="bg-background py-24">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-muted-foreground mb-6">{section.title}</h3>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`hover:text-primary transition-colors ${link.italic ? "italic" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

