import type { Metadata } from "next";
import "@/styles/globals/normalize.scss";
import "@/styles/globals/base.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Yearly Spotify Playlists",
  description: "Organiza tus canciones favoritas de Spotify en playlists por año automáticamente",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
