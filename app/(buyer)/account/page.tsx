import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import ProfilePage from "@/app/(buyer)/profile/page";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <ProfilePage />;
}
