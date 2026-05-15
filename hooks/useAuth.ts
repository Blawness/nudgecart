"use client";

import { useSession, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return {
    user: user ?? null,
    userId: user?.id ?? null,
    role: (user as Record<string, unknown> | undefined)?.role as string | null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    signOut: () => signOut({ callbackUrl: "/" }),
  };
}
