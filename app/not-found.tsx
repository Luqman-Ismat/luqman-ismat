import { PageShell, Action } from "@/components/consulting";
import { PageIntro } from "@/components/studio-sections";
export default function NotFound() {
  return (
    <PageShell>
      <PageIntro
        label="404 / Page not found"
        title="Let’s get you back."
        text="This page may have moved. Explore the services or start a conversation about what you need."
      >
        <div className="action-row">
          <Action href="/">Home</Action>
          <Action href="/ten21" secondary>
            TEN21
          </Action>
        </div>
      </PageIntro>
    </PageShell>
  );
}
