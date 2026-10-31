import { NextRequest, NextResponse } from "next/server";
import { buildSpotifyAuthorizeUrl } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;
    const authUrl = buildSpotifyAuthorizeUrl(undefined, origin);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error initializing Spotify login";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
