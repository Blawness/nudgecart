import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getBaseUrl(req: NextRequest): string {
  // Vercel sets x-forwarded-host and x-forwarded-proto
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedHost && forwardedProto) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  // Fallback to NEXTAUTH_URL or nextUrl origin
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  return req.nextUrl.origin;
}

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const baseUrl = getBaseUrl(req);

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
    nextUrl.pathname.startsWith("/account") ||
    nextUrl.pathname.startsWith("/onboarding");

  const isAuthRoute =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");

  if (isAuthRoute && isLoggedIn) {
    if (userRole === "MERCHANT")
      return NextResponse.redirect(new URL("/merchant/dashboard", baseUrl));
    if (userRole === "ADMIN")
      return NextResponse.redirect(new URL("/admin", baseUrl));
    return NextResponse.redirect(new URL("/", baseUrl));
  }

  if (isAdminRoute) {
    if (!isLoggedIn || userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", baseUrl));
    }
  }

  if (isMerchantRoute) {
    if (!isLoggedIn || userRole !== "MERCHANT") {
      return NextResponse.redirect(new URL("/login", baseUrl));
    }
  }

  if (isBuyerRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", baseUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
