import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-label text-xs uppercase tracking-widest text-pop-orange mb-2">Yuju × PocketCorp</p>
          <h1 className="font-comic text-4xl uppercase text-ink">Content HQ</h1>
        </div>
        <div className="border-brutal bg-paper shadow-brutal-lg p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
