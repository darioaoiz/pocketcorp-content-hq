"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";

export interface LoginState {
  error: string | null;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  if (!isSupabaseConfigured()) {
    return { error: "Supabase no esta configurado todavia. Define las variables de entorno." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Completa email y contrasena." };
  }

  const supabase = getSupabaseServerClient();
  const { data: user, error } = await supabase.from("admin_users").select("*").eq("email", email).maybeSingle();

  if (error || !user) {
    return { error: "Credenciales invalidas." };
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return { error: "Credenciales invalidas." };
  }

  await setSessionCookie({ sub: user.id, email: user.email });
  redirect("/calendar");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
