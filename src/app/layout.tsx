import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Analytics Presidencia | Colombia Electoral",
  description: "Plataforma de análisis estadístico de resultados electorales presidenciales de Colombia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-surface text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
