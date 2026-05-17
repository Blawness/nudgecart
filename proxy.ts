import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isLoggedIn = !!session?.user;
  const userRole = (session?.user as unknown as Record<string, unknown>)?.role as
    | string
    | undefined;

  const isMerchantRoute = nextUrl.pathname.startsWith("/merchant");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isBuyerRoute =
    nextUrl.pathname.startsWith("/cart") ||
    nextUrl.pathname.startsWith("/checkout") ||
    nextUrl.pathname.startsWith("/orders") ||
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/onboarding");

  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  if (isAuthRoute && isLoggedIn) {
    if (userRole === "MERCHANT")
      return NextResponse.redirect(new URL("/merchant/dashboard", nextUrl));
    if (userRole === "ADMIN")
      return NextResponse.redirect(new URL("/admin", nextUrl));
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn || userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  if (isMerchantRoute) {
    if (!isLoggedIn || userRole !== "MERCHANT") {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  if (isBuyerRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
