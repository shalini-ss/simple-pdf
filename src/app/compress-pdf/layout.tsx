import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free",
  description:
    "Compress PDF files online for free and reduce PDF size while keeping your document readable. Fast, simple, and browser-based.",
};

export default function CompressPdfLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}