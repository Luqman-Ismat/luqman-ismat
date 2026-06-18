"use client"

import { useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"

interface CodeBlockProps {
  code: string
  /** Optional filename shown above the block. */
  filename?: string
  /** Hint for tokenizer. "ts" / "js" / "py" / "txt". Defaults to "ts". */
  language?: "ts" | "js" | "py" | "txt"
  /** Optional className applied to the outer figure. */
  className?: string
}

const TS_KEYWORDS = new Set([
  "const", "let", "var", "function", "return", "if", "else", "for", "while",
  "import", "from", "export", "default", "class", "extends", "interface",
  "type", "async", "await", "new", "this", "true", "false", "null",
  "undefined", "in", "of", "as", "void", "try", "catch", "throw",
])
const PY_KEYWORDS = new Set([
  "def", "return", "import", "from", "as", "if", "elif", "else", "for", "while",
  "class", "try", "except", "with", "lambda", "True", "False", "None", "yield",
  "raise", "global", "nonlocal", "and", "or", "not", "in", "is", "pass",
])

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!))
}

/**
 * Tiny regex tokenizer — not a full parser. Good enough for short snippets.
 * Pulls comments and strings first (so keywords inside don't get colored),
 * then keywords, numbers, and function calls.
 */
function tokenize(code: string, language: CodeBlockProps["language"] = "ts") {
  const keywords = language === "py" ? PY_KEYWORDS : TS_KEYWORDS
  // Order matters: comments + strings first.
  const re =
    language === "py"
      ? /(#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)\b/g
      : /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(\d+(?:\.\d+)?)\b|\b([A-Za-z_$][\w$]*)\b/g

  let out = ""
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(code))) {
    out += escapeHtml(code.slice(last, m.index))
    if (m[1] != null) {
      out += `<span class="tok-comment">${escapeHtml(m[1])}</span>`
    } else if (m[2] != null) {
      out += `<span class="tok-string">${escapeHtml(m[2])}</span>`
    } else if (m[3] != null) {
      out += `<span class="tok-number">${escapeHtml(m[3])}</span>`
    } else if (m[4] != null) {
      const word = m[4]
      const after = code[re.lastIndex]
      if (keywords.has(word)) {
        out += `<span class="tok-keyword">${escapeHtml(word)}</span>`
      } else if (after === "(") {
        out += `<span class="tok-fn">${escapeHtml(word)}</span>`
      } else {
        out += escapeHtml(word)
      }
    }
    last = re.lastIndex
  }
  out += escapeHtml(code.slice(last))
  return out
}

export function CodeBlock({ code, filename, language = "ts", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const html = useMemo(() => tokenize(code, language), [code, language])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard blocked — silently ignore */
    }
  }

  return (
    <figure className={`my-6 overflow-hidden rounded-xl border border-border bg-muted ${className ?? ""}`.trim()}>
      <figcaption className="flex items-center justify-between border-b border-border bg-background/40 px-4 py-2 text-xs">
        <span className="font-mono text-muted-foreground">
          {filename ?? language.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </figcaption>
      <pre className="!my-0 !rounded-none !border-0">
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </pre>
    </figure>
  )
}
