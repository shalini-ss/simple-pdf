"use client";

import Link from "next/link";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";

type SelectedFile = {
  file: File;
  id: string;
};

export default function MergePdfPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);

    const invalidFile = selectedFiles.some(
      (file) => file.type !== "application/pdf"
    );

    if (invalidFile) {
      setError("Please select PDF files only.");
      return;
    }

    const newFiles = selectedFiles.map((file) => ({
      file,
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
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

  function moveFile(
    index: number,
    direction: "up" | "down"
  ) {
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
        const fileBytes =
          await item.file.arrayBuffer();

        const pdf =
          await PDFDocument.load(fileBytes);

        const pages =
          await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );

        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const pdfBytes =
        await mergedPdf.save();

      const blob = new Blob(
        [pdfBytes as BlobPart],
        {
          type: "application/pdf",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

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
    <main className="min-h-screen bg-[#F7F7F5] text-[#171717]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#E5E5E2] bg-[#F7F7F5]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">

          <Link
            href="/"
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-xs font-bold text-white">
              S
            </div>

            <span className="text-[18px] font-semibold tracking-tight">
              SimplePDF
            </span>
          </Link>

          <Link
            href="/#tools"
            className="text-sm font-medium text-[#666] transition hover:text-[#171717]"
          >
            All tools
          </Link>

        </div>
      </header>


      {/* HERO */}
      <section className="px-6 pb-10 pt-10 sm:pb-12 sm:pt-14">

        <div className="mx-auto max-w-4xl text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-semibold shadow-sm ring-1 ring-[#E1E1DD]">
            M
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Merge PDF
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#666]">
            Combine multiple PDF files into one document
            in the order you choose.
          </p>

        </div>

      </section>


      {/* WORKSPACE */}
      <section className="border-y border-[#E1E1DD] bg-[#ECEDE8] px-6 py-12 sm:py-14">

        <div className="mx-auto max-w-5xl">

          {/* Main product box */}
          <div className="overflow-hidden rounded-3xl border border-[#D8D9D3] bg-[#F8F8F6] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">

            {/* Workspace header */}
            <div className="border-b border-[#E1E1DD] px-6 py-5 sm:px-8">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#999991]">
                    PDF Tool
                  </p>

                  <h2 className="mt-1.5 text-lg font-semibold">
                    Combine your files
                  </h2>
                </div>

                {files.length > 0 && (
                  <span className="rounded-full border border-[#DCDDD7] bg-white px-3 py-1.5 text-xs font-medium text-[#666]">
                    {files.length}{" "}
                    {files.length === 1
                      ? "file"
                      : "files"}
                  </span>
                )}

              </div>

            </div>


            {/* CONTENT */}
            <div className="p-5 sm:p-8">

              {/* UPLOAD */}
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D5D6D0] bg-white px-6 py-12 text-center transition hover:border-[#AFAFA9] hover:bg-[#FCFCFA]">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ECEDE8] text-2xl font-medium text-[#444] transition group-hover:bg-[#171717] group-hover:text-white">
                  +
                </div>

                <h3 className="mt-5 text-lg font-semibold">
                  Add PDF files
                </h3>

                <p className="mt-2 text-sm text-[#777]">
                  Select two or more PDF files to combine.
                </p>

                <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white transition group-hover:bg-[#303030]">
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

                <p className="mt-4 text-xs text-[#A0A09A]">
                  PDF files only
                </p>

              </label>


              {/* ERROR WHEN NO FILE */}
              {error && files.length === 0 && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}


              {/* FILES */}
              {files.length > 0 && (
                <div className="mt-8">

                  {/* FILE HEADER */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-lg font-semibold">
                        Selected files
                      </h3>

                      <p className="mt-1 text-sm text-[#777]">
                        Arrange the files in the order
                        you want them merged.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={clearAll}
                      className="self-start rounded-lg px-3 py-2 text-sm font-medium text-[#777] transition hover:bg-white hover:text-[#171717]"
                    >
                      Clear all
                    </button>

                  </div>


                  {/* FILE LIST */}
                  <div className="mt-6 space-y-3">

                    {files.map((item, index) => (
                      <div
                        key={item.id}
                        className="group flex items-center gap-3 rounded-2xl border border-[#DCDDD7] bg-white p-4 transition hover:border-[#C5C6C0] hover:shadow-sm sm:gap-4"
                      >

                        {/* Number */}
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#171717] text-sm font-semibold text-white">
                          {index + 1}
                        </div>


                        {/* PDF */}
                        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ECEDE8] text-xs font-bold text-[#555] sm:flex">
                          PDF
                        </div>


                        {/* INFO */}
                        <div className="min-w-0 flex-1">

                          <p className="truncate text-sm font-medium text-[#333]">
                            {item.file.name}
                          </p>

                          <p className="mt-1 text-xs text-[#999]">
                            {(
                              item.file.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>

                        </div>


                        {/* MOVE */}
                        <div className="flex gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              moveFile(
                                index,
                                "up"
                              )
                            }
                            disabled={index === 0}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFDFDB] text-[#777] transition hover:bg-[#F7F7F5] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-25"
                            aria-label="Move file up"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveFile(
                                index,
                                "down"
                              )
                            }
                            disabled={
                              index ===
                              files.length - 1
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DFDFDB] text-[#777] transition hover:bg-[#F7F7F5] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-25"
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
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-[#999] transition hover:bg-[#F3F3F0] hover:text-[#171717]"
                          aria-label={`Remove ${item.file.name}`}
                        >
                          ×
                        </button>

                      </div>
                    ))}

                  </div>


                  {/* ERROR */}
                  {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}


                  {/* READY MESSAGE */}
                  <div className="mt-6 rounded-2xl border border-[#DCDDD7] bg-white p-5">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECEDE8] text-sm text-[#555]">
                        ✓
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#333]">
                          Ready to merge
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#777]">
                          Your PDFs will be combined
                          in the order shown above.
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
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#303030] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#D9D9D5] disabled:text-[#999] disabled:shadow-none"
                  >

                    {isMerging ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#777] border-t-white" />
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


          {/* TRUST */}
          <div className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs text-[#888]">
            <span>✓ Browser processing</span>
            <span>✓ No account</span>
            <span>✓ Free to use</span>
            <span>✓ No watermark</span>
          </div>

        </div>

      </section>


      {/* PRIVACY */}
      <section
        id="privacy"
        className="bg-white px-6 py-14 sm:py-16"
      >

        <div className="mx-auto max-w-6xl">

          <div className="rounded-3xl border border-[#E2E2DE] bg-[#F7F7F5] p-8 sm:p-10">

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">

              <div className="max-w-2xl">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-sm font-medium text-white">
                  ✓
                </div>

                <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Your files stay yours.
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#666] sm:text-base">
                  Your PDF files are processed directly
                  in your browser. They are not uploaded
                  to our server for merging.
                </p>

              </div>

              <div className="shrink-0 rounded-xl border border-[#DCDDD7] bg-white px-4 py-3 text-xs font-medium text-[#777]">
                Private by design
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

          <Link
            href="/#tools"
            className="transition hover:text-[#171717]"
          >
            All tools
          </Link>

          <span>
            © {new Date().getFullYear()} SimplePDF
          </span>

        </div>

      </footer>

    </main>
  );
}