import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as Record<string, unknown>)?.role as
    | string
    | undefined;

  if (role !== "MERCHANT") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="MERCHANT" />
      <main className="flex-1 md:pl-56 pt-14 p-6">
        <h1 className="mb-6 text-2xl font-bold">Dashboard Merchant</h1>
        {children}
      </main>
    </div>
  );
}
