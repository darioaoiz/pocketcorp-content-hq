"use client";

import { SupabaseNotConfiguredError } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DashboardError({ error, reset }: { error: Error & { message: string }; reset: () => void }) {
  const isSupabaseIssue = error.message?.includes(new SupabaseNotConfiguredError().message.slice(0, 30));

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <h1 className="mb-3 font-comic text-2xl uppercase text-ink">
          {isSupabaseIssue ? "Supabase no esta configurado" : "Algo salio mal"}
        </h1>
        <p className="mb-4 font-body text-sm text-ink-muted">{error.message}</p>
        {isSupabaseIssue && (
          <p className="mb-4 font-body text-sm text-ink-muted">
            Define <code className="font-label">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
            <code className="font-label">SUPABASE_SERVICE_ROLE_KEY</code>, corre las migraciones en{" "}
            <code className="font-label">supabase/migrations</code> y crea el admin con{" "}
            <code className="font-label">npm run create-admin</code>.
          </p>
        )}
        <Button onClick={reset}>Reintentar</Button>
      </Card>
    </div>
  );
}
