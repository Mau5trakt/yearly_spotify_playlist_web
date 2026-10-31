import { getSession } from "../auth";

export const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
export const SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "user-library-read",
  "playlist-read-private",
  "playlist-modify-public",
  "playlist-modify-private",
].join(" ");

export function getSpotifyRedirectUri(origin?: string): string {
  if (process.env.SPOTIFY_REDIRECT_URI) {
    return process.env.SPOTIFY_REDIRECT_URI;
  }
  let base = origin || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
  // Spotify strictly forbids "localhost" in registered Redirect URIs; requires 127.0.0.1
  if (base.includes("localhost")) {
    base = base.replace("localhost", "127.0.0.1");
  }
  return `${base.replace(/\/$/, "")}/api/auth/callback`;
}

export function buildSpotifyAuthorizeUrl(state?: string, origin?: string): string {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error("Missing SPOTIFY_CLIENT_ID environment variable");
  }

  const redirectUri = getSpotifyRedirectUri(origin);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: SPOTIFY_SCOPES,
    redirect_uri: redirectUri,
    show_dialog: "true",
  });

  if (state) {
    params.set("state", state);
  }

  return `${SPOTIFY_ACCOUNTS_URL}/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, origin?: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const redirectUri = getSpotifyRedirectUri(origin);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange token with Spotify: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(`${SPOTIFY_ACCOUNTS_URL}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh token with Spotify: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
  };

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function getValidAccessToken(): Promise<string> {
  const session = await getSession();

  if (!session.isLoggedIn || !session.accessToken || !session.refreshToken) {
    throw new Error("UNAUTHORIZED");
  }

  // Refresh access token if expiring within 60 seconds
  const isExpiringSoon = session.expiresAt ? Date.now() > session.expiresAt - 60000 : true;

  if (isExpiringSoon) {
    const refreshed = await refreshAccessToken(session.refreshToken);
    session.accessToken = refreshed.accessToken;
    session.refreshToken = refreshed.refreshToken;
    session.expiresAt = refreshed.expiresAt;
    await session.save();
    return refreshed.accessToken;
  }

  return session.accessToken;
}

export async function fetchSpotifyUserProfile(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch Spotify user profile: ${response.status} ${err}`);
  }

  return response.json() as Promise<{
    id: string;
    display_name: string;
    email?: string;
    images?: { url: string }[];
  }>;
}
