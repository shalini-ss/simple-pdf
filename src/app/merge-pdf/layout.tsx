import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Online Free",
  description:
    "Merge multiple PDF files into one document online for free. Simple, fast, and secure browser-based PDF merging.",
};

export default function MergePdfLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}