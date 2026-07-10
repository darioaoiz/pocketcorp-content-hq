import { requireSession } from "@/lib/auth/session";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardNav email={session.email} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
