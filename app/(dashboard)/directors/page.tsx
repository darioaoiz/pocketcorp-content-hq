import { listDirectors } from "@/lib/directors/data";
import { DirectorCard } from "./DirectorCard";

export default async function DirectorsPage() {
  const directors = await listDirectors();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-label text-xs uppercase tracking-widest text-pop-orange">Roster de marca</p>
        <h1 className="font-comic text-3xl uppercase text-ink md:text-4xl">Directores</h1>
        <p className="mt-2 max-w-2xl font-body text-sm text-ink-muted">
          Cada director pinta sus piezas con su color oficial. La foto de referencia se usa para que la IA dibuje
          siempre el mismo personaje entre generaciones — subila cuando la tengas.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {directors.map((director) => (
          <DirectorCard key={director.id} director={director} />
        ))}
      </div>
    </div>
  );
}
