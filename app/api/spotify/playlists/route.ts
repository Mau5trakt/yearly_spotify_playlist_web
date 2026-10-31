import { NextRequest, NextResponse } from "next/server";
import { CreatePlaylistSchema, createOrUpdateYearlyPlaylist } from "@/lib/spotify";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = CreatePlaylistSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos invalidos", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await createOrUpdateYearlyPlaylist(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear playlist";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
