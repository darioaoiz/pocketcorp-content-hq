/**
 * Crea (o reemplaza) el unico usuario administrador de PocketCorp Content HQ.
 * Se corre a mano una vez (`npm run create-admin`) para no tener que guardar
 * el email/password del admin como variables de entorno en Railway.
 */
import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createClient } from "@supabase/supabase-js";
import { hashPassword } from "../lib/auth/password";
import type { Database } from "../types/database";

const ENTER_CODE = 13;
const NEWLINE_CODE = 10;
const CTRL_C_CODE = 3;
const BACKSPACE_CODE = 127;

async function promptVisible(question: string): Promise<string> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function promptHidden(question: string): Promise<string> {
  return new Promise((resolve) => {
    stdout.write(question);
    let collected = "";

    const onData = (char: Buffer) => {
      const code = char[0];

      if (code === ENTER_CODE || code === NEWLINE_CODE) {
        stdin.setRawMode?.(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(collected);
        return;
      }
      if (code === CTRL_C_CODE) {
        stdout.write("\n");
        process.exit(1);
      }
      if (code === BACKSPACE_CODE) {
        collected = collected.slice(0, -1);
        return;
      }
      collected += char.toString();
    };

    stdin.resume();
    stdin.setRawMode?.(true);
    stdin.on("data", onData);
  });
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.error(
      "Falta NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno. Definilos (por ejemplo en .env.local y corriendo con `dotenv -e .env.local -- npm run create-admin`) y volve a intentar."
    );
    process.exit(1);
  }

  const email = (await promptVisible("Email del administrador: ")).toLowerCase();
  if (!email.includes("@")) {
    console.error("Email invalido.");
    process.exit(1);
  }

  const password = await promptHidden("Contrasena: ");
  const confirm = await promptHidden("Confirma la contrasena: ");

  if (password.length < 8) {
    console.error("La contrasena debe tener al menos 8 caracteres.");
    process.exit(1);
  }
  if (password !== confirm) {
    console.error("Las contrasenas no coinciden.");
    process.exit(1);
  }

  const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false } });
  const passwordHash = await hashPassword(password);

  const { data: existing } = await supabase.from("admin_users").select("id").limit(1).maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("admin_users")
      .update({ email, password_hash: passwordHash })
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`Admin actualizado (${email}).`);
  } else {
    const { error } = await supabase.from("admin_users").insert({ email, password_hash: passwordHash });
    if (error) throw error;
    console.log(`Admin creado (${email}).`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
