import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./db";
import * as schema from "@/drizzle/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    usersTable: schema.users as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    accountsTable: schema.accounts as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sessionsTable: schema.sessions as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verificationTokensTable: schema.verificationTokens as any,
  }),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          password,
          user.passwordHash
        );
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatarUrl,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as unknown as Record<string, unknown>).role =
          token.role;
        (session.user as unknown as Record<string, unknown>).onboardingCompleted =
          (token as unknown as Record<string, unknown>).onboardingCompleted;
        (session.user as unknown as Record<string, unknown>).onboardingSkipped =
          (token as unknown as Record<string, unknown>).onboardingSkipped;
      }

      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        (token as unknown as Record<string, unknown>).role = (
          user as unknown as Record<string, unknown>
        ).role;
      }
      // Re-query onboarding status on sign-in OR when session.update() is called
      if (user || trigger === "update") {
        const userId = (token.id ?? user?.id) as string;
        const [prefs] = await db
          .select({
            onboardingCompleted: schema.userPreferences.onboardingCompleted,
            onboardingSkipped: schema.userPreferences.onboardingSkipped,
          })
          .from(schema.userPreferences)
          .where(eq(schema.userPreferences.userId, userId))
          .limit(1);
        (token as unknown as Record<string, unknown>).onboardingCompleted =
          prefs?.onboardingCompleted ?? false;
        (token as unknown as Record<string, unknown>).onboardingSkipped =
          prefs?.onboardingSkipped ?? false;
      }
      return token;
    },
  },
});
