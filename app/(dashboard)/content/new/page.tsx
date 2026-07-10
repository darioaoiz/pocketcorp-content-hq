import { listDirectors } from "@/lib/directors/data";
import { getCurrentBrandBible } from "@/lib/brand-bible/data";
import { Card } from "@/components/ui/Card";
import { NewContentForm } from "./NewContentForm";

export default async function NewContentPage() {
  const [directors, brandBible] = await Promise.all([listDirectors(), getCurrentBrandBible()]);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <p className="font-label text-xs uppercase tracking-widest text-pop-orange">Nueva pieza</p>
        <h1 className="font-comic text-3xl uppercase text-ink md:text-4xl">Crear contenido</h1>
      </div>
      <Card>
        <NewContentForm directors={directors} pillarSuggestions={brandBible?.content_pillars ?? []} />
      </Card>
    </div>
  );
}
