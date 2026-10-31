import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // In local development, if navigating to localhost:3000,
  // redirect to 127.0.0.1:3000 to unify cookie sessions
  // and strictly match Spotify's OAuth loopback policy
  if (host.startsWith("localhost")) {
    const url = request.nextUrl.clone();
    url.hostname = "127.0.0.1";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Next.js conventions compatibility
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all routes except internal Next.js assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
