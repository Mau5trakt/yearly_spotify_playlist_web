import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    id: string;
    displayName: string;
    email?: string;
    imageUrl?: string;
  };
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

const isHttps =
  (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith("https://")) ||
  Boolean(process.env.VERCEL);

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    "complex_password_at_least_32_characters_long_for_spotify_app_2025",
  cookieName: "yearly_spotify_session",
  cookieOptions: {
    // Enable Secure only on HTTPS connections (SSL / production), not on local HTTP
    secure: process.env.NODE_ENV === "production" && isHttps,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}
