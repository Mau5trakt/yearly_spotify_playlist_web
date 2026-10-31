import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens, fetchSpotifyUserProfile } from "@/lib/spotify";
import { sessionOptions, type SessionData } from "@/lib/auth";
import { getIronSession, webCookies } from "iron-session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  let origin = request.nextUrl.origin;
  if (origin.includes("localhost")) {
    origin = origin.replace("localhost", "127.0.0.1");
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(error || "missing_code")}`, origin)
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code, origin);
    const profile = await fetchSpotifyUserProfile(tokens.accessToken);

    const redirectUrl = new URL("/?auth=success", origin);
    const response = NextResponse.redirect(redirectUrl);

    // Use webCookies(request, response) to ensure Set-Cookie header
    // is sealed directly onto the HTTP 307 redirect response
    const session = await getIronSession<SessionData>(
      webCookies(request, response),
      sessionOptions
    );

    session.isLoggedIn = true;
    session.accessToken = tokens.accessToken;
    session.refreshToken = tokens.refreshToken;
    session.expiresAt = tokens.expiresAt;
    session.user = {
      id: profile.id,
      displayName: profile.display_name || profile.id,
      email: profile.email,
      imageUrl: profile.images && profile.images.length > 0 ? profile.images[0].url : undefined,
    };

    await session.save();

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return NextResponse.redirect(
      new URL(`/?auth_error=${encodeURIComponent(message)}`, origin)
    );
  }
}
