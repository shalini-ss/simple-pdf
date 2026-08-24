"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import Link from "next/link";

export default function SplitPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageRange, setPageRange] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("Loading PDF...");

      const bytes = await selectedFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);

      setFile(selectedFile);
      setPageCount(pdf.getPageCount());
      setPageRange("");
      setIsCustom(false);

      setMessage(
        `${pdf.getPageCount()} ${
          pdf.getPageCount() === 1 ? "page" : "pages"
        } loaded.`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not load the PDF. It may be corrupted or password-protected."
      );

      setFile(null);
      setPageCount(0);
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  async function splitAllPages() {
    if (!file) return;

    try {
      setIsProcessing(true);
      setError("");
      setMessage("Preparing split PDFs...");

      const bytes = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(bytes);
      const zip = new JSZip();

      for (let i = 0; i < pageCount; i++) {
        setMessage(
          `Processing page ${i + 1} of ${pageCount}...`
        );

        const newPdf = await PDFDocument.create();

        const [page] = await newPdf.copyPages(
          originalPdf,
          [i]
        );

        newPdf.addPage(page);

        const pdfBytes = await newPdf.save();

        zip.file(`page-${i + 1}.pdf`, pdfBytes);
      }

      setMessage("Creating ZIP file...");

      const zipBlob = await zip.generateAsync({
        type: "blob",
      });

      downloadBlob(zipBlob, "split-pages.zip");

      const sizeMB =
        zipBlob.size / (1024 * 1024);

      setMessage(
        `Done! ${pageCount} pages split and downloaded (${sizeMB.toFixed(
          2
        )} MB).`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while splitting the PDF."
      );

      setMessage("");
    } finally {
      setIsProcessing(false);
    }
  }

  async function extractPages() {
    if (!file) return;

    if (!pageRange.trim()) {
      setError("Enter at least one page number or range.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setMessage("");

      const pagesToExtract = new Set<number>();

      for (const part of pageRange.split(",")) {
        const value = part.trim();

        if (!value) continue;

        if (value.includes("-")) {
          const rangeParts = value.split("-");

          if (rangeParts.length !== 2) {
            throw new Error(
              `"${value}" isn't a valid page range.`
            );
          }

          const start = Number(
            rangeParts[0].trim()
          );

          const end = Number(
            rangeParts[1].trim()
          );

          if (
            !Number.isInteger(start) ||
            !Number.isInteger(end) ||
            start < 1 ||
            end > pageCount ||
            start > end
          ) {
            throw new Error(
              `"${value}" is out of range. This PDF has pages 1–${pageCount}.`
            );
          }

          for (
            let page = start;
            page <= end;
            page++
          ) {
            pagesToExtract.add(page);
          }
        } else {
          const page = Number(value);

          if (
            !Number.isInteger(page) ||
            page < 1 ||
            page > pageCount
          ) {
            throw new Error(
              `"${value}" is out of range. This PDF has pages 1–${pageCount}.`
            );
          }

          pagesToExtract.add(page);
        }
      }

      const selectedPages = Array.from(
        pagesToExtract
      ).sort((a, b) => a - b);

      if (selectedPages.length === 0) {
        throw new Error(
          "Enter at least one valid page."
        );
      }

      setMessage(
        `Extracting ${selectedPages.length} ${
          selectedPages.length === 1
            ? "page"
            : "pages"
        }...`
      );

      const bytes = await file.arrayBuffer();

      const originalPdf =
        await PDFDocument.load(bytes);

      const newPdf =
        await PDFDocument.create();

      const pageIndexes = selectedPages.map(
        (page) => page - 1
      );

      const pages = await newPdf.copyPages(
        originalPdf,
        pageIndexes
      );

      pages.forEach((page) => {
        newPdf.addPage(page);
      });

      const pdfBytes = await newPdf.save();

      const blob = new Blob(
        [pdfBytes as BlobPart],
        {
          type: "application/pdf",
        }
      );

      downloadBlob(
        blob,
        "extracted-pages.pdf"
      );

      const sizeMB =
        blob.size / (1024 * 1024);

      setMessage(
        `Done! ${selectedPages.length} ${
          selectedPages.length === 1
            ? "page"
            : "pages"
        } extracted (${sizeMB.toFixed(2)} MB).`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while extracting the pages."
      );

      setMessage("");
    } finally {
      setIsProcessing(false);
    }
  }

  function downloadBlob(
    blob: Blob,
    filename: string
  ) {
    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
  }

  function removeFile() {
    setFile(null);
    setPageCount(0);
    setPageRange("");
    setIsCustom(false);
    setError("");
    setMessage("");
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
            ✂
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#18181B] sm:text-5xl">
            Split PDF
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#70727A] sm:text-base">
            Split your PDF into individual pages or
            extract only the pages you need.
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


      {/* MAIN */}
      <section className="px-5 py-12 sm:px-6 sm:py-16">

        <div className="mx-auto max-w-4xl">

          <div className="overflow-hidden rounded-3xl border border-[#E1E3E8] bg-white shadow-[0_12px_40px_rgba(20,20,40,0.06)]">

            <div className="p-5 sm:p-8">

              {/* UPLOAD */}
              {!file && (

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D9DBE3] bg-[#FAFAFC] px-5 py-12 text-center transition hover:border-[#B9B1F4] hover:bg-[#F7F5FF] sm:py-14">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-[#5B4BDB] shadow-sm ring-1 ring-[#E1E3E8] transition group-hover:-translate-y-1">
                    +
                  </div>

                  <h2 className="mt-6 text-xl font-semibold text-[#18181B]">
                    Add your PDF
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#777980]">
                    Select the PDF you want to split
                    into separate pages.
                  </p>

                  <span className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.18)] transition group-hover:-translate-y-0.5 group-hover:bg-[#4D3FC4]">
                    Choose PDF
                    <span>↑</span>
                  </span>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFile}
                    className="hidden"
                  />

                  <p className="mt-4 text-xs text-[#999]">
                    PDF files only
                  </p>

                </label>

              )}


              {/* LOADING */}
              {isLoading && (
                <div className="mt-5 rounded-xl border border-[#E1E3E8] bg-[#FAFAFC] px-5 py-4 text-center text-sm text-[#666870]">
                  Loading PDF...
                </div>
              )}


              {/* ERROR */}
              {error && !file && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}


              {/* FILE */}
              {file && !isLoading && (

                <div className="mt-10">

                  {/* HEADER */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-semibold tracking-tight text-[#18181B]">
                          Selected PDF
                        </h2>

                        <span className="rounded-full bg-[#F1EFFF] px-3 py-1 text-xs font-semibold text-[#5B4BDB]">
                          {pageCount}{" "}
                          {pageCount === 1
                            ? "page"
                            : "pages"}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-6 text-[#777980]">
                        Choose how you want to split
                        this PDF.
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="self-start rounded-lg px-3 py-2 text-sm font-medium text-[#666870] transition hover:bg-[#F3F3F5] hover:text-[#18181B] sm:self-auto"
                    >
                      Change PDF
                    </button>

                  </div>


                  {/* FILE CARD */}
                  <div className="mt-7 flex items-center gap-4 rounded-2xl border border-[#E1E3E8] bg-white p-4 transition hover:border-[#D3CFFF] hover:shadow-[0_10px_25px_rgba(91,75,219,0.06)]">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                      PDF
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-medium text-[#333]">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-[#999]">
                        {(file.size / 1024 / 1024).toFixed(
                          2
                        )}{" "}
                        MB · {pageCount}{" "}
                        {pageCount === 1
                          ? "page"
                          : "pages"}
                      </p>

                    </div>

                  </div>


                  {/* OPTIONS */}
                  {!isCustom && (

                    <div className="mt-10">

                      <div>

                        <h2 className="text-xl font-semibold tracking-tight text-[#18181B]">
                          How would you like to split it?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#777980]">
                          Choose an option below to
                          continue.
                        </p>

                      </div>


                      <div className="mt-7 grid gap-4 sm:grid-cols-2">

                        {/* SPLIT ALL */}
                        <button
                          type="button"
                          onClick={splitAllPages}
                          disabled={isProcessing}
                          className="group rounded-2xl border border-[#E1E3E8] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#D3CFFF] hover:shadow-[0_10px_25px_rgba(91,75,219,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                          <div className="flex items-center justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1EFFF] text-lg text-[#5B4BDB]">
                              ⎘
                            </div>

                            <span className="text-lg text-[#B2B2AC] transition group-hover:translate-x-1 group-hover:text-[#5B4BDB]">
                              →
                            </span>

                          </div>

                          <h3 className="mt-6 text-lg font-semibold">
                            Split all pages
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#777980]">
                            Create a separate PDF for
                            every page and download
                            them together in a ZIP file.
                          </p>

                          <div className="mt-6 text-sm font-semibold text-[#5B4BDB]">
                            {isProcessing
                              ? "Splitting..."
                              : "Split all pages →"}
                          </div>

                        </button>


                        {/* EXTRACT */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustom(true);
                            setError("");
                            setMessage("");
                          }}
                          disabled={isProcessing}
                          className="group rounded-2xl border border-[#E1E3E8] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#D3CFFF] hover:shadow-[0_10px_25px_rgba(91,75,219,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                          <div className="flex items-center justify-between">

                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1EFFF] text-lg text-[#5B4BDB]">
                              ✂
                            </div>

                            <span className="text-lg text-[#B2B2AC] transition group-hover:translate-x-1 group-hover:text-[#5B4BDB]">
                              →
                            </span>

                          </div>

                          <h3 className="mt-6 text-lg font-semibold">
                            Extract specific pages
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#777980]">
                            Pick individual pages or
                            ranges, like 1-5, 8, or
                            12-15.
                          </p>

                          <div className="mt-6 text-sm font-semibold text-[#5B4BDB]">
                            Choose pages →
                          </div>

                        </button>

                      </div>

                    </div>

                  )}


                  {/* CUSTOM */}
                  {isCustom && (

                    <div className="mt-10">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h2 className="text-xl font-semibold tracking-tight text-[#18181B]">
                            Select pages
                          </h2>

                          <p className="mt-2 text-sm leading-6 text-[#777980]">
                            Enter page numbers or ranges
                            to extract.
                          </p>

                        </div>

                        <span className="shrink-0 rounded-full bg-[#F1EFFF] px-3 py-1.5 text-xs font-semibold text-[#5B4BDB]">
                          {pageCount} pages
                        </span>

                      </div>


                      <label className="mt-7 block text-sm font-medium text-[#555]">
                        Pages to extract
                      </label>

                      <input
                        type="text"
                        value={pageRange}
                        onChange={(event) => {
                          setPageRange(
                            event.target.value
                          );
                          setError("");
                          setMessage("");
                        }}
                        placeholder="1-5, 8, 12-15"
                        className="mt-2 w-full rounded-xl border border-[#DCDDE3] bg-white px-4 py-3.5 text-sm text-[#18181B] outline-none transition placeholder:text-[#999] focus:border-[#5B4BDB] focus:ring-2 focus:ring-[#5B4BDB]/10"
                      />

                      <p className="mt-2 text-xs text-[#999]">
                        Example: 1-5, 8, 12-15
                      </p>


                      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">

                        <button
                          type="button"
                          onClick={() => {
                            setIsCustom(false);
                            setPageRange("");
                            setError("");
                            setMessage("");
                          }}
                          className="rounded-xl border border-[#E1E3E8] bg-white px-6 py-3.5 text-sm font-medium text-[#555] transition hover:bg-[#F7F7FA] hover:text-[#18181B]"
                        >
                          Back
                        </button>

                        <button
                          type="button"
                          onClick={extractPages}
                          disabled={
                            !pageRange.trim() ||
                            isProcessing
                          }
                          className="flex-1 rounded-xl bg-[#5B4BDB] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.16)] transition hover:-translate-y-0.5 hover:bg-[#4D3FC4] disabled:cursor-not-allowed disabled:bg-[#E5E5E7] disabled:text-[#999] disabled:shadow-none"
                        >
                          {isProcessing
                            ? "Extracting..."
                            : "Extract pages →"}
                        </button>

                      </div>

                    </div>

                  )}


                  {/* ERROR */}
                  {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}


                  {/* MESSAGE */}
                  {message && (
                    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#E3E1FA] bg-[#F7F5FF] px-5 py-4 text-sm text-[#555]">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#5B4BDB] shadow-sm">
                        ✓
                      </div>

                      <span>
                        {message}
                      </span>

                    </div>
                  )}

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
              Your PDF is processed directly in your
              browser and is not uploaded to our server.
            </span>

          </div>


          {/* HOW IT WORKS */}
          <div className="mt-16 border-t border-[#E3E5EA] pt-14">

            <div className="text-center">

              <p className="text-sm font-semibold text-[#5B4BDB]">
                HOW IT WORKS
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18181B]">
                Split PDFs in three simple steps
              </h2>

            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  01
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Select PDF
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Choose a PDF file from your device.
                </p>

              </div>


              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  02
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Choose pages
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Split every page or select specific
                  pages and ranges.
                </p>

              </div>


              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  03
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Download
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Download your split PDFs instantly.
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