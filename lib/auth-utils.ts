import { auth } from "@/lib/auth";
import type { UserRole } from "@/types";

interface AuthUser {
  id: string;
  role?: UserRole;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as AuthUser;
}

export async function requireRole(
  role: UserRole
): Promise<{ user: null; error: Response } | { user: AuthUser; error: null }> {
  const { NextResponse } = await import("next/server");
  const user = await getSessionUser();
  if (!user || user.role !== role) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { user, error: null };
}
