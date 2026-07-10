"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

const LINKS = [
  { href: "/calendar", label: "Calendario" },
  { href: "/brand-bible", label: "Brand Bible" },
  { href: "/directors", label: "Directores" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2">
      {LINKS.map((link) => {
        const active = pathname?.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "rounded-brutal-pill border-brutal px-4 py-2.5 font-label text-xs uppercase tracking-wide transition-all",
              active
                ? "bg-pop-orange text-white shadow-brutal-sm"
                : "bg-paper text-ink hover:shadow-brutal-sm hover:translate-x-[1px] hover:translate-y-[1px]"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardNav({ email }: { email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r-2 md:border-ink md:bg-paper md:p-5">
        <Link href="/calendar" className="mb-8 block">
          <p className="font-label text-[10px] uppercase tracking-widest text-pop-orange">Yuju × PocketCorp</p>
          <h1 className="font-comic text-2xl uppercase leading-none text-ink">Content HQ</h1>
        </Link>
        <NavLinks />
        <div className="mt-auto pt-6">
          <p className="mb-2 truncate font-label text-[11px] text-ink-muted">{email}</p>
          <form action={logoutAction}>
            <Button type="submit" variant="secondary" className="w-full">
              Salir
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b-2 border-ink bg-paper px-4 py-3 md:hidden">
        <Link href="/calendar">
          <h1 className="font-comic text-xl uppercase leading-none text-ink">Content HQ</h1>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          className="rounded-brutal-pill border-brutal bg-paper px-3 py-2 shadow-brutal-sm font-label text-xs uppercase"
        >
          {open ? "Cerrar" : "Menu"}
        </button>
      </header>
      {open && (
        <div className="border-b-2 border-ink bg-paper p-4 md:hidden">
          <NavLinks onNavigate={() => setOpen(false)} />
          <div className="mt-4 border-t-2 border-ink pt-4">
            <p className="mb-2 truncate font-label text-[11px] text-ink-muted">{email}</p>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" className="w-full">
                Salir
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
