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
  metadataBase: new URL("https://simplepdf.vercel.app"),

  title: {
    default: "SimplePDF - Free Online PDF Tools",
    template: "%s | SimplePDF",
  },

  description:
    "Free online PDF tools to compress, merge, split, rotate, and convert PDF files. Simple, fast, private, and easy to use.",

  keywords: [
    "PDF tools",
    "free PDF tools",
    "compress PDF",
    "merge PDF",
    "split PDF",
    "rotate PDF",
    "PDF to JPG",
    "JPG to PDF",
    "online PDF tools",
  ],

  authors: [{ name: "SimplePDF" }],

  creator: "SimplePDF",
  publisher: "SimplePDF",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  openGraph: {
    title: "SimplePDF - Free Online PDF Tools",
    description:
      "Compress, merge, split, rotate, and convert PDF files online for free.",
    type: "website",
    siteName: "SimplePDF",
  },

  twitter: {
    card: "summary",
    title: "SimplePDF - Free Online PDF Tools",
    description:
      "Free and simple online PDF tools for everyday document work.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}