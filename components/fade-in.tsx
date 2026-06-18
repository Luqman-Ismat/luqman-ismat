import type React from "react"

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function FadeIn({ children, delay = 0, className, as: Tag = "div" }: FadeInProps) {
  const style = delay ? { ["--reveal-delay" as string]: `${Math.round(delay * 1000)}ms` } : undefined
  return (
    <Tag className={`reveal ${className ?? ""}`.trim()} style={style as React.CSSProperties}>
      {children}
    </Tag>
  )
}
