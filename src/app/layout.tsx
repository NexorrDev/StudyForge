import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], weight: ["400","500","600","700","800"], variable: "--font-syne", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  title: "StudyForge — Révision de nouvelle génération",
  description: "Maîtrisez vos cours avec des flashcards intelligentes, la répétition espacée et une expérience gamifiée.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${syne.variable} ${dmSans.variable}`}>
      <body style={{ fontFamily: "var(--font-dm-sans, DM Sans), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
