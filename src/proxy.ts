import { NextRequest, NextResponse } from "next/server";

// Only these paths require authentication
const PROTECTED_PATHS = [
  "/session-builder",
  "/planner",
  "/timer",
  "/training-log",
  "/upgrade",
  "/profile",
  "/stats",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only check auth for protected paths
  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  // Check for Firebase session cookie
  const session = req.cookies.get("__session")?.value;

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
