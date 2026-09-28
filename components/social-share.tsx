"use client";
import { useState } from "react";
export function SocialShare({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description?: string;
}) {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      setStatus("Copy the address from your browser to share this article.");
    }
  }
  return (
    <div className="article-share">
      <div>
        <button type="button" onClick={copy}>
          Copy link
        </button>
        <a
          href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent((description || "") + "\n\n" + url)}`}
        >
          Email
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn ↗
        </a>
      </div>
      <p role="status">{status}</p>
    </div>
  );
}
