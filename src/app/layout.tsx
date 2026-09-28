import type { Metadata } from "next";
import { Mukta, Kalam } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const mukta = Mukta({
  variable: "--font-sans",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "optional",
  preload: false,
});

const kalam = Kalam({
  variable: "--font-hand",
  weight: ["400", "700"],
  subsets: ["latin", "devanagari"],
  display: "optional",
  preload: false,
});

export const metadata: Metadata = {
  title: "Let's Draw",
  description: "Speak your idea — watch it become a diagram.",
  icons: {
    icon: "/lets_draw_logo.svg",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "https://lets-draw.vercel.app"
  ),
  openGraph: {
    title: "Let's Draw",
    description: "Speak your idea — watch it become a diagram.",
    siteName: "Let's Draw",
    type: "website",
  },
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${mukta.variable} ${kalam.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          {process.env.VERCEL === "1" && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  );
}
