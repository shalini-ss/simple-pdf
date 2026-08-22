import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online Free",
  description:
    "Split PDF files online for free. Extract selected pages from a PDF and download them as separate PDF files quickly and securely in your browser.",
};

export default function SplitPdfLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}