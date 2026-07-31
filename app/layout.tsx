import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bubble Priority Todo",
  description: "A mobile-friendly todo map sorted by importance and urgency.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
