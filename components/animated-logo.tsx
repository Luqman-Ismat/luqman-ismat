import Link from "next/link"

export function AnimatedLogo() {
  return (
    <Link
      href="/"
      aria-label="Luqman Ismat — home"
      className="group inline-flex items-baseline text-xl font-bold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
    >
      <span aria-hidden="true">L</span>
      <span
        aria-hidden="true"
        className="ml-0 inline-flex overflow-hidden whitespace-pre max-w-0 opacity-0 transition-[max-width,opacity,margin] duration-500 ease-out group-hover:max-w-[12ch] group-hover:opacity-100 group-hover:ml-[2px] group-focus-visible:max-w-[12ch] group-focus-visible:opacity-100 group-focus-visible:ml-[2px]"
        style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
      >
        UQMAN&nbsp;ISMAT
      </span>
      <span className="sr-only">Luqman Ismat</span>
    </Link>
  )
}
