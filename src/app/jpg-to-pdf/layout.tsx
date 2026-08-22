import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter – Convert Images to PDF Online",
  description:
    "Convert JPG and other images to PDF online for free. Combine multiple images into a single PDF quickly and securely with SimplePDF.",
};

export default function JPGToPDFLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}