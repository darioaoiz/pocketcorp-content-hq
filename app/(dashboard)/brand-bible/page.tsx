import { getCurrentBrandBible, listBrandBibleVersions } from "@/lib/brand-bible/data";
import { Card } from "@/components/ui/Card";
import { BrandBibleForm } from "./BrandBibleForm";

export default async function BrandBiblePage() {
  const [current, versions] = await Promise.all([getCurrentBrandBible(), listBrandBibleVersions()]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <p className="font-label text-xs uppercase tracking-widest text-pop-orange">Documento de marca</p>
        <h1 className="font-comic text-3xl uppercase text-ink md:text-4xl">Brand Bible</h1>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Esta es la unica fuente de verdad para generar copy. Todo lo que no este aca, el sistema no lo puede
          inventar.
        </p>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold uppercase text-ink">
            Version vigente {current ? `#${current.version_number}` : ""}
          </h2>
        </div>
        <BrandBibleForm current={current} />
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-lg font-extrabold uppercase text-ink">Historial de versiones</h2>
        {versions.length === 0 ? (
          <p className="font-body text-sm text-ink-muted">Todavia no hay versiones guardadas.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {versions.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between border-brutal bg-cream px-3 py-2 font-body text-sm"
              >
                <span>
                  Version #{v.version_number} — {new Date(v.created_at).toLocaleString("es")}
                </span>
                {v.is_current && (
                  <span className="border-brutal bg-state-aprobado px-2 py-0.5 font-label text-[10px] uppercase">
                    Vigente
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
