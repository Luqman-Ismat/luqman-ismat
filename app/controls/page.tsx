import { ChapterPage } from "@/components/chapter/chapter-page";
import { chapterById } from "@/lib/chapters";
export const metadata = {
  title: "Project controls",
  description: "Working project controls components: schedule, capacity heatmaps, MS Project import, forecast approval and portfolio risk, with fictional data.",
  alternates: { canonical: "/controls" },
};
export default function Page() {
  return <ChapterPage chapter={chapterById("controls")} />;
}
