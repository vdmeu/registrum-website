import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Registrum — The Dependable Companies House API",
  description:
    "Structured UK company financials, director networks, and intelligent caching on top of Companies House. Integration in 10 minutes. Free to start.",
  metadataBase: new URL("https://registrum.co.uk"),
  openGraph: {
    title: "Registrum — The Dependable Companies House API",
    description:
      "Structured financials, director networks, intelligent caching. One clean API.",
    url: "https://registrum.co.uk",
    siteName: "Registrum",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
