import { ChapterPage } from "@/components/chapter/chapter-page";
import { chapterById } from "@/lib/chapters";
export const metadata = {
  title: "Engineering & reliability",
  description: "An inspection planning workbench for process equipment and EngiVault engineering calculations, working in the browser.",
  alternates: { canonical: "/engineering" },
};
export default function Page() {
  return <ChapterPage chapter={chapterById("engineering")} />;
}
