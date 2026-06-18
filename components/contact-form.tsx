"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

const RECIPIENT = "Luqman.ismat@gmail.com"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) {
      toast.error("Please add a name and message before sending.")
      return
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.")
      return
    }

    setSending(true)
    const subject = `New message from ${name}`
    const body = `${message}\n\n— ${name}${email ? ` <${email}>` : ""}`
    const href = `mailto:${RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = href
    setTimeout(() => setSending(false), 800)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contact-name" className="sr-only">Your name</label>
          <Input
            id="contact-name"
            type="text"
            placeholder="Your name"
            value={name}
            autoComplete="name"
            required
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className="sr-only">Your email</label>
          <Input
            id="contact-email"
            type="email"
            placeholder="Your email (optional)"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="sr-only">Your message</label>
        <Textarea
          id="contact-message"
          placeholder="Tell me about your project, scope, timeline…"
          rows={10}
          required
          className="min-h-[260px] resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={sending} className="w-full md:w-auto">
          {sending ? "Opening mail…" : "Send Message →"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Opens your email client. No data leaves your browser.
        </p>
      </div>
    </form>
  )
}
