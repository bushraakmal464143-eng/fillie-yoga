import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import IconSprites from "@/components/IconSprites";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Om At Home · Live Virtual Yoga from Around the World",
  description:
    "Live virtual yoga with Fillie Faragi — Yin, Vinyasa, Pilates, and more. Connecting practitioners in 40+ countries, every day.",
  openGraph: {
    title: "Om At Home · Live Virtual Yoga from Around the World",
    description:
      "Live virtual yoga with Fillie Faragi — Yin, Vinyasa, Pilates, and more. Connecting practitioners in 40+ countries, every day.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        <IconSprites />
        {children}
      </body>
    </html>
  );
}
