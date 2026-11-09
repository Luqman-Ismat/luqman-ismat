import Link from "next/link";
import { Page } from "@/components/site/footer";
import { Roll } from "@/components/site/roll";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Page>
      <header className="page-head" style={{ minHeight: "70vh" }}>
        <p className="label">(404)</p>
        <h1 className="h-xl" data-lines>
          Nothing here.
        </h1>
        <div className="lede">
          <p className="body">This page may have moved. The services and the journal are still where you left them.</p>
          <div className="action-row">
            <Link className="btn" href="/">
              <Roll text="Home" />
            </Link>
            <Link className="btn ghost" href="/services">
              <Roll text="Services" />
            </Link>
          </div>
        </div>
      </header>
    </Page>
  );
}
