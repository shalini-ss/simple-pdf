"use client";

import Link from "next/link";
import { useState } from "react";

type Category = "organize" | "convert" | "optimize";

interface Tool {
  title: string;
  description: string;
  href: string;
  icon: string;
  category: Category;
}

const tools: Tool[] = [
  {
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    href: "/merge-pdf",
    icon: "merge",
    category: "organize",
  },
  {
    title: "Split PDF",
    description: "Extract pages or split a PDF into separate files.",
    href: "/split-pdf",
    icon: "split",
    category: "organize",
  },
  {
    title: "Rotate PDF",
    description: "Rotate individual pages of your PDF.",
    href: "/rotate-pdf",
    icon: "rotate",
    category: "organize",
  },
  {
    title: "JPG to PDF",
    description: "Convert your JPG images into a PDF document.",
    href: "/jpg-to-pdf",
    icon: "jpg",
    category: "convert",
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages into JPG images.",
    href: "/pdf-to-jpg",
    icon: "pdf",
    category: "convert",
  },
  {
    title: "Compress PDF",
    description: "Reduce the size of your PDF for easier sharing.",
    href: "/compress-pdf",
    icon: "compress",
    category: "optimize",
  },
];

const tabs: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All tools" },
  { id: "organize", label: "Organize" },
  { id: "convert", label: "Convert" },
  { id: "optimize", label: "Optimize" },
];

function ToolIcon({ type }: { type: string }) {
  if (type === "merge") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-6 w-6"
      >
        <rect x="5" y="3" width="10" height="15" rx="2" />
        <path d="M9 7h4M9 11h4M15 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10" />
      </svg>
    );
  }

  if (type === "split") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-6 w-6"
      >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M12 3v18M8 9l-2 3 2 3M16 9l2 3-2 3" />
      </svg>
    );
  }

  if (type === "jpg") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-6 w-6"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="9" cy="9" r="1.5" />
        <path d="m5 17 4-4 3 3 2-2 5 5" />
      </svg>
    );
  }

  if (type === "pdf") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-6 w-6"
      >
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5" />
        <path d="M8.5 15h1.5a1.5 1.5 0 0 0 0-3H8.5v5M13 17v-5h1.5a2.5 2.5 0 0 1 0 5H13M18 12h-3v5" />
      </svg>
    );
  }

  if (type === "compress") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-6 w-6"
      >
        <path d="M7 3h10v4h4v10h-4v4H7v-4H3V7h4z" />
        <path d="m9 9 3 3 3-3M12 12V7M9 15l3-3 3 3M12 12v5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-6 w-6"
    >
      <path d="M19 8a7 7 0 1 0 1 6" />
      <path d="M19 4v5h-5" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function getToolStyle(type: string) {
  const styles = {
    merge: "bg-violet-50 text-violet-600",
    split: "bg-blue-50 text-blue-600",
    rotate: "bg-rose-50 text-rose-600",
    jpg: "bg-amber-50 text-amber-600",
    pdf: "bg-sky-50 text-sky-600",
    compress: "bg-emerald-50 text-emerald-600",
  };

  return styles[type as keyof typeof styles] || styles.merge;
}

function getTopLineStyle(type: string) {
  const styles = {
    merge: "bg-violet-500",
    split: "bg-blue-500",
    rotate: "bg-rose-500",
    jpg: "bg-amber-500",
    pdf: "bg-sky-500",
    compress: "bg-emerald-500",
  };

  return styles[type as keyof typeof styles] || styles.merge;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | Category>("all");

  const filteredTools =
    activeTab === "all"
      ? tools
      : tools.filter((tool) => tool.category === activeTab);

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-[#18181B]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">

          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5B4BDB] text-sm font-bold text-white shadow-sm">
              S
            </div>

            <span className="text-[18px] font-semibold tracking-tight text-[#18181B]">
              SimplePDF
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <a
              href="#tools"
              className="text-sm font-medium text-[#666] transition hover:text-[#5B4BDB]"
            >
              Tools
            </a>

            <a
              href="#how-it-works"
              className="hidden text-sm font-medium text-[#666] transition hover:text-[#5B4BDB] sm:block"
            >
              How it works
            </a>

            <a
              href="#privacy"
              className="hidden text-sm font-medium text-[#666] transition hover:text-[#5B4BDB] sm:block"
            >
              Privacy
            </a>
          </nav>

        </div>
      </header>


      {/* HERO */}
      <section className="border-b border-[#E5E7EB] bg-gradient-to-br from-[#F3F0FF] via-white to-[#EFF7FF] px-5 py-16 sm:px-6 sm:py-20">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-[#DDD8FF] bg-white px-4 py-2 text-xs font-medium text-[#5B4BDB] shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#5B4BDB]" />
            Free PDF tools
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-[#18181B] sm:text-5xl lg:text-6xl">
            Free PDF tools.
            <span className="block text-[#5B4BDB]">
              Simple, private, and fast.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#70727A] sm:text-base">
            Merge, split, convert, rotate and compress PDF files directly
            in your browser. No complicated setup. No account required.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#666870]">
            <span className="flex items-center gap-2">
              <span className="text-[#5B4BDB]">✓</span>
              Free to use
            </span>

            <span className="flex items-center gap-2">
              <span className="text-[#5B4BDB]">✓</span>
              No signup
            </span>

            <span className="flex items-center gap-2">
              <span className="text-[#5B4BDB]">✓</span>
              Browser based
            </span>
          </div>

          <a
            href="#tools"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(91,75,219,0.22)] transition hover:-translate-y-0.5 hover:bg-[#4E3FC7]"
          >
            Explore PDF tools
            <span>↓</span>
          </a>

        </div>

      </section>


      {/* TOOLS */}
      <section id="tools" className="px-5 py-14 sm:px-6 sm:py-18">

        <div className="mx-auto max-w-6xl">

          {/* SECTION HEADING */}
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#5B4BDB]">
              PDF TOOLS
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18181B] sm:text-3xl">
              Everything you need for everyday PDFs
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#70727A]">
              Simple tools for working with PDF files without unnecessary
              steps.
            </p>
          </div>


          {/* CATEGORY NAVIGATION */}
          <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[#E1E3E8] pb-4">

            {tabs.map((tab) => {
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[#5B4BDB] text-white shadow-sm"
                      : "text-[#666] hover:bg-[#F1EFFF] hover:text-[#5B4BDB]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}

          </div>


          {/* PRODUCT GRID */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {filteredTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group relative overflow-hidden rounded-2xl border border-[#E1E3E8] bg-white p-6 shadow-[0_3px_12px_rgba(20,20,40,0.03)] transition duration-200 hover:-translate-y-1 hover:border-[#D3CFFF] hover:shadow-[0_14px_32px_rgba(91,75,219,0.10)]"
              >

                {/* TOP COLOR LINE */}
                <div
                  className={`absolute left-0 right-0 top-0 h-[3px] ${getTopLineStyle(
                    tool.icon
                  )}`}
                />

                <div className="flex items-center justify-between">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${getToolStyle(
                      tool.icon
                    )}`}
                  >
                    <ToolIcon type={tool.icon} />
                  </div>

                  <span className="text-lg text-[#B8BAC2] transition duration-200 group-hover:translate-x-1 group-hover:text-[#5B4BDB]">
                    →
                  </span>

                </div>

                <h3 className="mt-6 text-lg font-semibold tracking-tight text-[#18181B]">
                  {tool.title}
                </h3>

                <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#70727A]">
                  {tool.description}
                </p>

                <div className="mt-6 text-sm font-medium text-[#777980] transition group-hover:text-[#5B4BDB]">
                  Use tool
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>


      {/* PRIVACY SECTION */}
      <section
        id="privacy"
        className="border-y border-[#E3E5EA] bg-white px-5 py-14 sm:px-6 sm:py-16"
      >

        <div className="mx-auto max-w-5xl">

          <div className="mx-auto max-w-2xl text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1EFFF] text-xl">
              🔒
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[#18181B] sm:text-3xl">
              Your files stay private
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#70727A] sm:text-base">
              SimplePDF processes your files directly in your browser.
              Your documents do not need to be uploaded to our servers.
            </p>

          </div>


          <div className="mt-10 grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFC] p-6 text-center">
              <div className="text-2xl">🔒</div>

              <h3 className="mt-4 font-semibold text-[#18181B]">
                Private
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#70727A]">
                Your files are processed in your browser.
              </p>
            </div>


            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFC] p-6 text-center">
              <div className="text-2xl">⚡</div>

              <h3 className="mt-4 font-semibold text-[#18181B]">
                Fast
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#70727A]">
                Process your files without waiting for uploads.
              </p>
            </div>


            <div className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFC] p-6 text-center">
              <div className="text-2xl">✓</div>

              <h3 className="mt-4 font-semibold text-[#18181B]">
                No signup
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#70727A]">
                Start using the tools without creating an account.
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="px-5 py-14 sm:px-6 sm:py-16"
      >

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <p className="text-sm font-semibold text-[#5B4BDB]">
              HOW IT WORKS
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18181B] sm:text-3xl">
              Simple from start to finish
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#70727A]">
              No complicated process. Choose a tool, process your file,
              and download the result.
            </p>

          </div>


          <div className="mt-10 grid gap-5 md:grid-cols-3">

            {/* STEP 1 */}
            <div className="relative rounded-2xl border border-[#E1E3E8] bg-white p-7 text-center shadow-[0_3px_12px_rgba(20,20,40,0.03)]">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1EFFF] text-sm font-bold text-[#5B4BDB]">
                01
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Choose a tool
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#70727A]">
                Select the PDF tool that matches what you want to do.
              </p>

            </div>


            {/* STEP 2 */}
            <div className="relative rounded-2xl border border-[#E1E3E8] bg-white p-7 text-center shadow-[0_3px_12px_rgba(20,20,40,0.03)]">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1EFFF] text-sm font-bold text-[#5B4BDB]">
                02
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Process your file
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#70727A]">
                Upload your file and let the browser process it.
              </p>

            </div>


            {/* STEP 3 */}
            <div className="relative rounded-2xl border border-[#E1E3E8] bg-white p-7 text-center shadow-[0_3px_12px_rgba(20,20,40,0.03)]">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F1EFFF] text-sm font-bold text-[#5B4BDB]">
                03
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Download your result
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#70727A]">
                Download your finished file and continue with your work.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="px-5 pb-16 sm:px-6 sm:pb-20">

        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#202124] px-6 py-12 text-center text-white sm:px-10">

          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to work with your PDF?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
            Choose a tool and get started. SimplePDF is free and easy to use.
          </p>

          <a
            href="#tools"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#202124] transition hover:-translate-y-0.5 hover:bg-[#F3F3F3]"
          >
            Explore tools
            <span>↓</span>
          </a>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-[#E2E4E8] bg-[#202124] px-5 py-10 text-white sm:px-6">

        <div className="mx-auto max-w-6xl">

          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

            {/* BRAND */}
            <div>

              <Link href="/" className="flex items-center gap-2.5">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4BDB] text-xs font-bold text-white">
                  S
                </div>

                <span className="font-semibold">
                  SimplePDF
                </span>

              </Link>

              <p className="mt-3 max-w-xs text-sm leading-6 text-white/45">
                Simple tools for everyday PDF work, built with privacy in mind.
              </p>

            </div>


            {/* LINKS */}
            <div className="flex gap-14">

              <div>
                <h3 className="text-sm font-semibold text-white">
                  Tools
                </h3>

                <div className="mt-3 flex flex-col gap-2.5 text-sm text-white/50">

                  <Link
                    href="/merge-pdf"
                    className="transition hover:text-white"
                  >
                    Merge PDF
                  </Link>

                  <Link
                    href="/split-pdf"
                    className="transition hover:text-white"
                  >
                    Split PDF
                  </Link>

                  <Link
                    href="/jpg-to-pdf"
                    className="transition hover:text-white"
                  >
                    JPG to PDF
                  </Link>

                  <Link
                    href="/pdf-to-jpg"
                    className="transition hover:text-white"
                  >
                    PDF to JPG
                  </Link>

                </div>
              </div>


              <div>
                <h3 className="text-sm font-semibold text-white">
                  More
                </h3>

                <div className="mt-3 flex flex-col gap-2.5 text-sm text-white/50">

                  <Link
                    href="/compress-pdf"
                    className="transition hover:text-white"
                  >
                    Compress PDF
                  </Link>

                  <Link
                    href="/rotate-pdf"
                    className="transition hover:text-white"
                  >
                    Rotate PDF
                  </Link>

                  <a
                    href="#privacy"
                    className="transition hover:text-white"
                  >
                    Privacy
                  </a>

                </div>
              </div>

            </div>

          </div>


          {/* COPYRIGHT */}
          <div className="mt-9 border-t border-white/10 pt-6">

            <p className="text-sm text-white/35">
              © {new Date().getFullYear()} SimplePDF. All rights reserved.
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}