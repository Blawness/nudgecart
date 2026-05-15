import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userRole = (session?.user as Record<string, unknown>)?.role as
    | string
    | undefined;

  if (!session?.user || userRole !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar role="ADMIN" />
      <main className="flex-1 md:ml-56">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
