"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import Link from "next/link";

type SelectedFile = {
  file: File;
  id: string;
};

export default function MergePdfPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);

    const invalidFiles = selectedFiles.some(
      (file) => file.type !== "application/pdf"
    );

    if (invalidFiles) {
      setError("Please select PDF files only.");
      return;
    }

    const newFiles = selectedFiles.map((file) => ({
      file,
      id: crypto.randomUUID(),
    }));

    setFiles((current) => [...current, ...newFiles]);
    setError("");
    event.target.value = "";
  }

  function removeFile(id: string) {
    setFiles((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function clearAll() {
    setFiles([]);
    setError("");
  }

  function moveFile(index: number, direction: "up" | "down") {
    setFiles((current) => {
      const newFiles = [...current];

      const newIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        newIndex < 0 ||
        newIndex >= newFiles.length
      ) {
        return current;
      }

      [newFiles[index], newFiles[newIndex]] = [
        newFiles[newIndex],
        newFiles[index],
      ];

      return newFiles;
    });
  }

  async function mergeFiles() {
    if (files.length < 2) {
      setError("Please select at least two PDF files.");
      return;
    }

    try {
      setIsMerging(true);
      setError("");

      const mergedPdf = await PDFDocument.create();

      for (const item of files) {
        const fileBytes = await item.file.arrayBuffer();

        const pdf = await PDFDocument.load(fileBytes);

        const pages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices()
        );

        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const pdfBytes = await mergedPdf.save();

      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "merged.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch {
      setError(
        "Something went wrong while merging the PDFs."
      );
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-[#18181B]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#5B4BDB] text-sm font-bold text-white shadow-sm">
              S
            </div>

            <span className="text-[18px] font-semibold tracking-tight text-[#18181B]">
              SimplePDF
            </span>
          </Link>

          <Link
            href="/#tools"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#666870] transition hover:bg-[#F1EFFF] hover:text-[#5B4BDB]"
          >
            All tools →
          </Link>

        </div>
      </header>


      {/* HERO */}
      <section className="border-b border-[#E5E7EB] bg-gradient-to-br from-[#F3F0FF] via-white to-[#EFF7FF] px-5 py-14 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#5B4BDB] shadow-sm ring-1 ring-[#E3E0FA]">
            PDF
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#18181B] sm:text-5xl">
            Merge PDF
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#70727A] sm:text-base">
            Combine multiple PDF files into one document in the order
            you choose.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#666870]">

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

        </div>

      </section>


      {/* MAIN WORKSPACE */}
      <section className="px-5 py-12 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-4xl">

          <div className="overflow-hidden rounded-3xl border border-[#E1E3E8] bg-white shadow-[0_12px_40px_rgba(20,20,40,0.06)]">

            <div className="p-5 sm:p-8">

              {/* UPLOAD AREA */}
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D9DBE3] bg-[#FAFAFC] px-5 py-12 text-center transition hover:border-[#B9B1F4] hover:bg-[#F7F5FF] sm:py-14">

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-[#5B4BDB] shadow-sm ring-1 ring-[#E1E3E8] transition group-hover:-translate-y-1">
                  +
                </div>

                <h2 className="mt-6 text-xl font-semibold text-[#18181B]">
                  Add your PDF files
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#777980]">
                  Select two or more PDF files to combine into one document.
                </p>

                <span className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.18)] transition group-hover:-translate-y-0.5 group-hover:bg-[#4D3FC4]">
                  Choose PDF files
                  <span>↑</span>
                </span>

                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />

                <p className="mt-4 text-xs text-[#999]">
                  PDF files only
                </p>

              </label>


              {/* ERROR */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}


              {/* SELECTED FILES */}
              {files.length > 0 && (
                <div className="mt-10">

                  {/* FILE HEADER */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-semibold tracking-tight text-[#18181B]">
                          Selected files
                        </h2>

                        <span className="rounded-full bg-[#F1EFFF] px-3 py-1 text-xs font-semibold text-[#5B4BDB]">
                          {files.length}{" "}
                          {files.length === 1
                            ? "file"
                            : "files"}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-6 text-[#777980]">
                        Arrange the files in the order you want them merged.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={clearAll}
                      className="self-start rounded-lg px-3 py-2 text-sm font-medium text-[#666870] transition hover:bg-[#F3F3F5] hover:text-[#18181B] sm:self-auto"
                    >
                      Clear all
                    </button>

                  </div>


                  {/* FILE LIST */}
                  <div className="mt-7 space-y-3">

                    {files.map((item, index) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-3 rounded-2xl border border-[#E1E3E8] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#D3CFFF] hover:shadow-[0_10px_25px_rgba(91,75,219,0.08)] sm:gap-4"
                      >

                        {/* NUMBER */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5B4BDB] text-sm font-semibold text-white">
                          {index + 1}
                        </div>


                        {/* PDF ICON */}
                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB] sm:flex">
                          PDF
                        </div>


                        {/* FILE INFO */}
                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium text-[#333]">
                            {item.file.name}
                          </p>

                          <p className="mt-1 text-xs text-[#999]">
                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                        </div>


                        {/* MOVE BUTTONS */}
                        <div className="flex gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              moveFile(index, "up")
                            }
                            disabled={index === 0}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E3E8] text-[#777] transition hover:bg-[#F1EFFF] hover:text-[#5B4BDB] disabled:cursor-not-allowed disabled:opacity-25"
                            aria-label="Move file up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveFile(index, "down")
                            }
                            disabled={
                              index === files.length - 1
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E1E3E8] text-[#777] transition hover:bg-[#F1EFFF] hover:text-[#5B4BDB] disabled:cursor-not-allowed disabled:opacity-25"
                            aria-label="Move file down"
                          >
                            ↓
                          </button>

                        </div>


                        {/* REMOVE */}
                        <button
                          type="button"
                          onClick={() =>
                            removeFile(item.id)
                          }
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-[#999] transition hover:bg-[#F3F3F5] hover:text-[#18181B]"
                          aria-label={`Remove ${item.file.name}`}
                        >
                          ×
                        </button>

                      </div>
                    ))}

                  </div>


                  {/* READY INFO */}
                  <div className="mt-8 rounded-2xl border border-[#E3E1FA] bg-[#F7F5FF] p-5">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-[#5B4BDB] shadow-sm ring-1 ring-[#E1DFFC]">
                        ✦
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-[#333]">
                          Ready to merge
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#777980]">
                          Your PDFs will be combined in the order shown above.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* MERGE BUTTON */}
                  <button
                    type="button"
                    onClick={mergeFiles}
                    disabled={
                      files.length < 2 ||
                      isMerging
                    }
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.16)] transition hover:-translate-y-0.5 hover:bg-[#4D3FC4] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#E5E5E7] disabled:text-[#999] disabled:shadow-none"
                  >

                    {isMerging ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Merging PDFs...
                      </>
                    ) : (
                      <>
                        Merge PDFs
                        <span>→</span>
                      </>
                    )}

                  </button>

                </div>
              )}

            </div>

          </div>


          {/* PRIVACY */}
          <div className="mt-7 flex items-center justify-center gap-2 px-4 text-center text-xs leading-5 text-[#999]">

            <span className="text-emerald-500">
              ✓
            </span>

            <span>
              Your PDF files are processed directly in your browser and are
              not uploaded to our server.
            </span>

          </div>


          {/* HOW IT WORKS */}
          <div className="mt-16 border-t border-[#E3E5EA] pt-14">

            <div className="text-center">

              <p className="text-sm font-semibold text-[#5B4BDB]">
                HOW IT WORKS
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18181B]">
                Merge PDFs in three simple steps
              </h2>

            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  01
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Select PDFs
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Choose two or more PDF files from your device.
                </p>

              </div>


              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  02
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Arrange files
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Move your files up or down to choose the final order.
                </p>

              </div>


              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  03
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Merge & download
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Merge your PDFs and download the finished document.
                </p>

              </div>

            </div>

          </div>


          {/* RELATED TOOLS */}
          <div className="mt-14 rounded-2xl border border-[#E1E3E8] bg-white p-6 sm:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold text-[#18181B]">
                  Need another PDF tool?
                </h2>

                <p className="mt-1 text-sm text-[#777980]">
                  Explore more free tools from SimplePDF.
                </p>

              </div>

              <Link
                href="/#tools"
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-[#F1EFFF] px-4 py-2.5 text-sm font-medium text-[#5B4BDB] transition hover:bg-[#E8E4FF]"
              >
                View all tools
                <span>→</span>
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-[#E2E4E8] bg-[#202124] px-5 py-9 text-white sm:px-6">

        <div className="mx-auto max-w-6xl">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <Link
              href="/"
              className="flex items-center gap-2.5 font-semibold"
            >

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4BDB] text-xs font-bold">
                S
              </span>

              SimplePDF

            </Link>

            <p className="text-sm text-white/45">
              Simple tools for everyday PDF work.
            </p>

            <p className="text-sm text-white/35">
              © {new Date().getFullYear()} SimplePDF
            </p>

          </div>

        </div>

      </footer>

    </main>
  );
}