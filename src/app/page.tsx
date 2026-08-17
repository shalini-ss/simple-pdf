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

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | Category>("all");

  const filteredTools =
    activeTab === "all"
      ? tools
      : tools.filter((tool) => tool.category === activeTab);

  return (
    <main className="min-h-screen bg-[#F7F7F5] text-[#171717]">

     {/* NAVBAR */}
<header className="sticky top-0 z-50 border-b border-[#E5E5E2] bg-[#F7F7F5]/95 backdrop-blur">
  <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">

    <Link href="/" className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-xs font-bold text-white">
        S
      </div>

      <span className="text-[18px] font-semibold tracking-tight">
        SimplePDF
      </span>
    </Link>

    <a
      href="#tools"
      className="text-sm font-medium text-[#666] transition hover:text-[#171717]"
    >
      Tools
    </a>

  </div>
</header>
{/* HERO */}
<section className="px-6 pb-14 pt-8 sm:pb-20 sm:pt-12">
  <div className="mx-auto max-w-4xl text-center">

    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#DFDFDB] bg-white px-4 py-2 text-xs font-medium text-[#666] shadow-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-[#171717]" />
      Simple PDF tools
    </div>

    <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
      PDF work,
      <br />
      <span className="text-[#999]">made simple.</span>
    </h1>

    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#666] sm:text-lg">
      Simple tools for merging, splitting, converting,
      compressing and rotating your PDF files.
    </p>

    <div className="mt-7 flex flex-wrap justify-center gap-3">
      <a
        href="#tools"
        className="rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#303030]"
      >
        Explore tools
      </a>

      <a
        href="#privacy"
        className="rounded-xl border border-[#DEDED9] bg-white px-6 py-3.5 text-sm font-medium text-[#555] transition hover:border-[#CFCFC9] hover:bg-[#FAFAF8]"
      >
        Privacy first
      </a>
    </div>

    <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-[#999]">
      <span>✓ No account required</span>
      <span>✓ Free to use</span>
      <span>✓ Browser based</span>
    </div>

  </div>
</section>
  
      {/* PRODUCT / TOOLS */}
      <section
        id="tools"
        className="border-y border-[#E1E1DD] bg-[#ECEDE8] px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">

          {/* Section heading */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A8A84]">
                SimplePDF Tools
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                Choose what you need.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-[#777] sm:text-right">
              Everything you need for everyday PDF work,
              without unnecessary features.
            </p>

          </div>

          {/* Product box */}
          <div className="overflow-hidden rounded-3xl border border-[#D8D9D3] bg-[#F8F8F6] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">

            {/* Tabs */}
            <div className="border-b border-[#DFE0DA] bg-[#F3F4F0] px-5 pt-5 sm:px-7">

              <div className="flex gap-2 overflow-x-auto">

                {tabs.map((tab) => {
                  const active = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`shrink-0 rounded-t-xl px-5 py-3 text-sm font-medium transition ${
                        active
                          ? "bg-[#F8F8F6] text-[#171717] shadow-[0_-1px_0_#D8D9D3]"
                          : "text-[#777] hover:text-[#171717]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}

              </div>
            </div>

            {/* Product header */}
            <div className="border-b border-[#E2E2DE] px-6 py-6 sm:px-8">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-lg font-semibold">
                    PDF Tools
                  </h3>

                  <p className="mt-1 text-sm text-[#777]">
                    Select a tool to get started.
                  </p>
                </div>

                <span className="hidden rounded-full border border-[#DCDDD7] bg-white px-3 py-1.5 text-xs font-medium text-[#777] sm:block">
                  {filteredTools.length} tools
                </span>

              </div>

            </div>

            {/* Cards */}
            <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">

              {filteredTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-2xl border border-[#DCDDD7] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#BEBFB9] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)]"
                >

                  {/* Icon */}
                  <div className="flex items-center justify-between">

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECEDE8] text-[#30302E] transition group-hover:bg-[#171717] group-hover:text-white">
                      <ToolIcon type={tool.icon} />
                    </div>

                    <span className="text-lg text-[#B2B2AC] transition group-hover:translate-x-1 group-hover:text-[#171717]">
                      →
                    </span>

                  </div>

                  {/* Text */}
                  <h3 className="mt-6 text-lg font-semibold tracking-tight">
                    {tool.title}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-[#70706B]">
                    {tool.description}
                  </p>

                  {/* Action */}
                  <div className="mt-6 flex items-center text-sm font-medium text-[#777] transition group-hover:text-[#171717]">
                    Use tool
                    <span className="ml-2 transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>

                </Link>
              ))}

            </div>

          </div>

          {/* Small trust line */}
          <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs text-[#888]">
            <span>✓ Free</span>
            <span>✓ No signup</span>
            <span>✓ No watermark</span>
            <span>✓ Browser processing</span>
          </div>

        </div>
      </section>

      {/* PRIVACY */}
      <section
        id="privacy"
        className="bg-white px-6 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">

          <div className="rounded-3xl border border-[#E2E2DE] bg-[#F7F7F5] p-8 sm:p-10">

            <div className="max-w-2xl">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-white">
                ✓
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-tight">
                Your files stay yours.
              </h2>

              <p className="mt-4 text-base leading-7 text-[#666]">
                SimplePDF is designed around straightforward,
                browser-based document processing. Wherever possible,
                your files are processed directly on your device.
              </p>

            </div>

            <div className="mt-10 grid gap-6 border-t border-[#E1E1DD] pt-8 sm:grid-cols-3">

              <div>
                <p className="font-medium">
                  Browser based
                </p>

                <p className="mt-2 text-sm leading-6 text-[#777]">
                  Work with your files directly in your browser.
                </p>
              </div>

              <div>
                <p className="font-medium">
                  No account
                </p>

                <p className="mt-2 text-sm leading-6 text-[#777]">
                  Open a tool and start working immediately.
                </p>
              </div>

              <div>
                <p className="font-medium">
                  Simple by design
                </p>

                <p className="mt-2 text-sm leading-6 text-[#777]">
                  No unnecessary steps or complicated interfaces.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E2DE] bg-[#F7F7F5] px-6 py-8">

        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-[#888] sm:flex-row sm:items-center sm:justify-between">

          <Link
            href="/"
            className="font-semibold text-[#333]"
          >
            SimplePDF
          </Link>

          <span>
            Simple tools for everyday PDF work.
          </span>

          <span>
            © {new Date().getFullYear()} SimplePDF
          </span>

        </div>

      </footer>

    </main>
  );
}