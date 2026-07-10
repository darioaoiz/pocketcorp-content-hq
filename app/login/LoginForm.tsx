"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/fields";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div>
        <Label htmlFor="password">Contrasena</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state.error && (
        <p className="rounded-brutal-sm border-brutal bg-[#FF2E93] px-3 py-2 font-label text-xs uppercase text-white">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
