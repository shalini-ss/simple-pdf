import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to JPG Converter Online Free",
  description:
    "Convert PDF pages to JPG images online for free. Fast, simple, and secure browser-based PDF to JPG conversion.",
};

export default function PdfToJpgLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}