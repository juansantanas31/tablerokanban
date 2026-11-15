import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tablero Kanban | 03-tablero-kanban",
  description:
    "Tablero Kanban accesible con arrastrar y soltar, construido con Next.js 16 y React 19.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>
        <Header />
        <main id="contenido-principal" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
