import { notFound } from "next/navigation";
import { getContentItem } from "@/lib/content/data";
import { listDirectors } from "@/lib/directors/data";
import { ContentWorkspace } from "./ContentWorkspace";

export default async function ContentDetailPage({ params }: PageProps<"/content/[id]">) {
  const { id } = await params;
  const [item, directors] = await Promise.all([getContentItem(id), listDirectors()]);

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <ContentWorkspace initialItem={item} directors={directors} />
    </div>
  );
}
