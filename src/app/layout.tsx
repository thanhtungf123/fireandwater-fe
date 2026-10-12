import type { Metadata } from "next";
import { Baloo_2, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getSiteChrome } from "@/lib/api";

const display = Baloo_2({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getSiteChrome();
  const name = chrome?.headerTitle || SITE_NAME;
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `Trò chơi ${name}`,
      template: `%s – ${name}`,
    },
    description:
      "Chơi Lửa và Nước (Fireboy and Watergirl) trực tiếp trên trình duyệt. Đủ các phần Forest, Light, Ice, Crystal, Elements, Fairy Tales.",
    icons: chrome?.faviconUrl
      ? {
          icon: [{ url: chrome.faviconUrl }],
          shortcut: [{ url: chrome.faviconUrl }],
          apple: [{ url: chrome.faviconUrl }],
        }
      : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${display.variable} ${body.variable}`}>
      <body className="min-h-screen text-slate-800 antialiased">{children}</body>
    </html>
  );
}
