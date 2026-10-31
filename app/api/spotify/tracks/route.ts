import { NextRequest, NextResponse } from "next/server";
import { fetchLikedTracksPage } from "@/lib/spotify";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const data = await fetchLikedTracksPage(offset, limit);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al obtener canciones";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
