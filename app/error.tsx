"use client";
import Link from "next/link";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="site-container page-intro">
      <p className="eyebrow">Something went wrong</p>
      <h1>Let’s try that again.</h1>
      <p>The page couldn’t load. Retry, or return to the homepage.</p>
      <div className="action-row">
        <button type="button" className="consulting-button" onClick={retry}>
          Try again
        </button>
        <Link className="consulting-button secondary" href="/">
          Return home
        </Link>
      </div>
    </main>
  );
}
