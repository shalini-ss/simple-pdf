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

      const sizeMB = zipBlob.size / (1024 * 1024);

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

          const start = Number(rangeParts[0].trim());
          const end = Number(rangeParts[1].trim());

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

          for (let page = start; page <= end; page++) {
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
          selectedPages.length === 1 ? "page" : "pages"
        }...`
      );

      const bytes = await file.arrayBuffer();
      const originalPdf = await PDFDocument.load(bytes);
      const newPdf = await PDFDocument.create();

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

      const blob = new Blob([pdfBytes as BlobPart], {
        type: "application/pdf",
      });

      downloadBlob(blob, "extracted-pages.pdf");

      const sizeMB = blob.size / (1024 * 1024);

      setMessage(
        `Done! ${selectedPages.length} ${
          selectedPages.length === 1 ? "page" : "pages"
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

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

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

      {/* MAIN */}
      <section className="px-6 pb-20 pt-10 sm:pt-14">

        <div className="mx-auto max-w-6xl">

          {/* HERO */}
          <div className="text-center">

            <div className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#171717] text-lg font-semibold text-white">
              ✂
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Split PDF
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#666]">
              Split your PDF into individual pages or
              extract only the pages you need.
            </p>

          </div>

          {/* WORKSPACE */}
          <div className="mt-10 rounded-3xl border border-[#D8D9D3] bg-[#F8F8F6] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-7">

            {/* UPLOAD */}
            {!file && (
              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8D9D3] bg-[#F3F4F0] px-6 py-10 text-center transition hover:border-[#BEBFB9] hover:bg-[#ECEDE8]">

                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-[#E1E1DD] transition group-hover:-translate-y-0.5">
                  +
                </div>

                <h2 className="mt-5 text-lg font-semibold">
                  Add a PDF
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#777]">
                  Select the PDF you want to split.
                </p>

                <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3 text-sm font-medium text-white shadow-sm transition group-hover:bg-[#303030]">
                  Choose PDF
                  <span>↑</span>
                </span>

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFile}
                  className="hidden"
                />

                <p className="mt-3 text-xs text-[#999]">
                  PDF files only
                </p>

              </label>
            )}

            {/* LOADING */}
            {isLoading && (
              <div className="mt-5 rounded-xl border border-[#DFE0DA] bg-white px-4 py-3 text-center text-sm text-[#666]">
                Loading PDF...
              </div>
            )}

            {/* ERROR */}
            {error && !file && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* SELECTED PDF */}
            {file && !isLoading && (
              <div className="mt-8">

                {/* HEADER */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="flex items-center gap-3">

                      <h2 className="text-lg font-semibold">
                        Selected PDF
                      </h2>

                      <span className="rounded-full bg-[#ECEDE8] px-3 py-1.5 text-xs font-medium text-[#666]">
                        {pageCount}{" "}
                        {pageCount === 1
                          ? "page"
                          : "pages"}
                      </span>

                    </div>

                    <p className="mt-1 text-sm text-[#777]">
                      Choose how you want to split this PDF.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="self-start rounded-lg px-3 py-2 text-sm font-medium text-[#666] transition hover:bg-[#ECEDE8] hover:text-[#171717]"
                  >
                    Change PDF
                  </button>

                </div>

                {/* FILE */}
                <div className="mt-5 flex items-center gap-4 rounded-2xl border border-[#DCDDD7] bg-white p-4 transition hover:border-[#C8C9C3] hover:shadow-sm">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ECEDE8] text-xs font-bold text-[#444]">
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
                  <div className="mt-8">

                    <div>
                      <h2 className="text-lg font-semibold">
                        How would you like to split it?
                      </h2>

                      <p className="mt-1 text-sm text-[#777]">
                        Choose an option below to continue.
                      </p>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">

                      {/* SPLIT ALL */}
                      <button
                        type="button"
                        onClick={splitAllPages}
                        disabled={isProcessing}
                        className="group rounded-2xl border border-[#DCDDD7] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#BEBFB9] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECEDE8] text-lg">
                            ⎘
                          </div>

                          <span className="text-lg text-[#B2B2AC] transition group-hover:translate-x-1 group-hover:text-[#171717]">
                            →
                          </span>

                        </div>

                        <h3 className="mt-6 text-lg font-semibold">
                          Split all pages
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#777]">
                          Create a separate PDF for every
                          page and receive them together
                          in a ZIP file.
                        </p>

                        <div className="mt-6 text-sm font-medium text-[#171717]">
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
                        className="group rounded-2xl border border-[#DCDDD7] bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-[#BEBFB9] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        <div className="flex items-center justify-between">

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ECEDE8] text-lg">
                            ✂
                          </div>

                          <span className="text-lg text-[#B2B2AC] transition group-hover:translate-x-1 group-hover:text-[#171717]">
                            →
                          </span>

                        </div>

                        <h3 className="mt-6 text-lg font-semibold">
                          Extract specific pages
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-[#777]">
                          Pick individual pages or ranges,
                          like 1-5, 8, or 12-15.
                        </p>

                        <div className="mt-6 text-sm font-medium text-[#171717]">
                          Choose pages →
                        </div>

                      </button>

                    </div>

                  </div>
                )}

                {/* CUSTOM EXTRACTION */}
                {isCustom && (
                  <div className="mt-8">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h2 className="text-lg font-semibold">
                          Select pages
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-[#777]">
                          Enter page numbers or ranges to
                          extract.
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-[#ECEDE8] px-3 py-1.5 text-xs font-medium text-[#666]">
                        {pageCount} pages
                      </span>

                    </div>

                    <label className="mt-6 block text-sm font-medium text-[#555]">
                      Pages to extract
                    </label>

                    <input
                      type="text"
                      value={pageRange}
                      onChange={(event) => {
                        setPageRange(event.target.value);
                        setError("");
                        setMessage("");
                      }}
                      placeholder="1-5, 8, 12-15"
                      className="mt-2 w-full rounded-xl border border-[#DCDDD7] bg-white px-4 py-3.5 text-sm text-[#171717] outline-none transition placeholder:text-[#999] focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/10"
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
                        className="rounded-xl border border-[#DCDDD7] bg-white px-6 py-3.5 text-sm font-medium text-[#555] transition hover:bg-[#F7F7F5] hover:text-[#171717]"
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
                        className="flex-1 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#303030] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#DCDDD7] disabled:text-[#999] disabled:shadow-none"
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
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* SUCCESS */}
                {message && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl border border-[#DCDDD7] bg-[#ECEDE8] px-5 py-4 text-sm text-[#555]">
                    <span className="text-base text-[#171717]">
                      ✓
                    </span>
                    <span>{message}</span>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* PRIVACY */}
          <div className="mt-7 flex items-center justify-center gap-2 text-center text-xs text-[#999]">
            <span>✓</span>
            <span>
              Your PDF is processed directly in your browser
              and is not uploaded to our server.
            </span>
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