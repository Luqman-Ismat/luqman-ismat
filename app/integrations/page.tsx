import { ChapterPage } from "@/components/chapter/chapter-page";
import { chapterById } from "@/lib/chapters";
export const metadata = {
  title: "Integrations & reporting",
  description: "Hours reconciliation, cost and margin, productivity and quality reporting on connected data, with the data model and access design behind it.",
  alternates: { canonical: "/integrations" },
};
export default function Page() {
  return <ChapterPage chapter={chapterById("integrations")} />;
}
