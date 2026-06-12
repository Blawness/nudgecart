import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as unknown as Record<string, unknown>)?.role as
    | string
    | undefined;

  if (role !== "MERCHANT") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MERCHANT" />
      <main className="flex-1 min-w-0 md:pl-56">
        <div className="p-4 pt-18 md:p-6">{children}</div>
      </main>
    </div>
  );
}
