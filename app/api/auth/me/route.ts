import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session.isLoggedIn || !session.user) {
    return NextResponse.json(
      { isLoggedIn: false, user: null },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    {
      isLoggedIn: true,
      user: session.user,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
