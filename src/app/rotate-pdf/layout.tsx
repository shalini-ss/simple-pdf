import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rotate PDF Online Free",
  description:
    "Rotate individual PDF pages online for free. Quickly rotate PDF pages and download the corrected PDF securely in your browser.",
};

export default function RotatePdfLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}