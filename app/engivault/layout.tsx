import { Page } from "@/components/site/footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Page>
      <div className="vault">{children}</div>
      <div style={{ height: "clamp(110px, 14vw, 200px)" }} />
    </Page>
  );
}
