import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-pocketcorp.png" alt="PocketCorp" className="mb-4 h-20 w-auto" />
          <h1 className="font-comic text-4xl uppercase text-ink">Content HQ</h1>
          <p className="mt-1 font-label text-xs uppercase tracking-widest text-ink-muted">by Yuju</p>
        </div>
        <div className="rounded-brutal border-brutal bg-paper shadow-brutal-lg p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
