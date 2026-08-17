"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import Link from "next/link";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!event.target.files?.[0]) return;

    const selectedFile = event.target.files[0];

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }

    try {
      const fileBytes = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: fileBytes,
      }).promise;

      setFile(selectedFile);
      setPageCount(pdf.numPages);
      setError("");
    } catch (err) {
      console.error("PDF READ ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "This PDF could not be read."
      );
    }
  }

  async function convertToJpg() {
    if (!file) return;

    try {
      setIsConverting(true);
      setError("");

      const fileBytes = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: fileBytes,
      }).promise;

      const zip = new JSZip();

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const page = await pdf.getPage(pageNumber);

        const scale = 2;

        const viewport = page.getViewport({
          scale,
        });

        const canvas = document.createElement("canvas");

        const context = canvas.getContext("2d");

        if (!context) {
          throw new Error("Could not create canvas.");
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        const renderTask = page.render({
          canvasContext: context as CanvasRenderingContext2D,
          viewport,
        });

        await renderTask.promise;

        const jpgBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob),
            "image/jpeg",
            0.92
          );
        });

        if (!jpgBlob) {
          throw new Error(
            `Could not convert page ${pageNumber}.`
          );
        }

        const jpgBytes = await jpgBlob.arrayBuffer();

        zip.file(
          `page-${pageNumber}.jpg`,
          jpgBytes
        );

        canvas.width = 1;
        canvas.height = 1;
      }

      const zipBlob = await zip.generateAsync({
        type: "blob",
      });

      const url = URL.createObjectURL(zipBlob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "pdf-pages.zip";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while converting the PDF."
      );
    } finally {
      setIsConverting(false);
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
            All tools →
          </Link>

        </div>
      </header>

      {/* MAIN */}
      <section className="px-6 pb-20 pt-10 sm:pt-14">

        <div className="mx-auto max-w-5xl">

          {/* PAGE INTRO */}
          <div className="text-center">

            {/* Tool icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#DCDDD7] bg-white text-sm font-bold text-[#171717] shadow-sm">
              JPG
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              PDF to JPG
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#666] sm:text-base">
              Convert every page of your PDF into
              high-quality JPG images.
            </p>

          </div>

          {/* WORKSPACE */}
          <div className="mt-9 overflow-hidden rounded-3xl border border-[#DCDDD7] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)]">

            {/* Workspace header */}
            <div className="border-b border-[#E5E5E1] bg-[#F3F4F0] px-6 py-5 sm:px-8">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A8A84]">
                    Convert
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    PDF to JPG
                  </h2>
                </div>

                <div className="hidden rounded-full border border-[#DCDDD7] bg-white px-3 py-1.5 text-xs font-medium text-[#777] sm:block">
                  Browser based
                </div>

              </div>

            </div>

            <div className="p-5 sm:p-8">

              {/* UPLOAD */}
              {!file && (
                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8D9D3] bg-[#F8F8F6] px-6 py-14 text-center transition hover:border-[#AFAFA9] hover:bg-[#F3F4F0]">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-medium shadow-sm ring-1 ring-[#DFE0DA] transition group-hover:-translate-y-0.5">
                    +
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    Add your PDF
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#777]">
                    Choose a PDF file and convert its
                    pages into separate JPG images.
                  </p>

                  <span className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition group-hover:bg-[#303030]">
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

              {/* ERROR BEFORE FILE */}
              {error && !file && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* FILE SELECTED */}
              {file && (
                <div>

                  {/* Selected file heading */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <div className="flex items-center gap-3">

                        <h2 className="text-xl font-semibold tracking-tight">
                          Ready to convert
                        </h2>

                        <span className="rounded-full bg-[#ECEDE8] px-3 py-1 text-xs font-medium text-[#666]">
                          {pageCount}{" "}
                          {pageCount === 1
                            ? "page"
                            : "pages"}
                        </span>

                      </div>

                      <p className="mt-1.5 text-sm text-[#777]">
                        Your PDF is ready to be converted.
                      </p>
                    </div>

                    {/* Change file */}
                    <label className="cursor-pointer self-start rounded-lg border border-[#DCDDD7] bg-white px-4 py-2 text-sm font-medium text-[#555] transition hover:bg-[#F7F7F5] hover:text-[#171717]">
                      Change PDF

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFile}
                        className="hidden"
                      />
                    </label>

                  </div>

                  {/* FILE CARD */}
                  <div className="mt-6 rounded-2xl border border-[#DCDDD7] bg-[#F8F8F6] p-5">

                    <div className="flex items-center gap-4">

                      {/* PDF */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#171717] text-[10px] font-bold tracking-wide text-white">
                        PDF
                      </div>

                      {/* File information */}
                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-[#333]">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-[#999]">
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>

                      </div>

                      {/* Pages */}
                      <div className="hidden text-right sm:block">

                        <p className="text-sm font-medium text-[#333]">
                          {pageCount}
                        </p>

                        <p className="mt-0.5 text-xs text-[#999]">
                          {pageCount === 1
                            ? "page"
                            : "pages"}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* CONVERSION RESULT */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">

                    {/* Input */}
                    <div className="rounded-2xl border border-[#DCDDD7] bg-white p-5">

                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#999]">
                        Input
                      </p>

                      <div className="mt-4 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#171717] text-[9px] font-bold text-white">
                          PDF
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            PDF document
                          </p>

                          <p className="mt-1 text-xs text-[#999]">
                            {pageCount}{" "}
                            {pageCount === 1
                              ? "page"
                              : "pages"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Output */}
                    <div className="rounded-2xl border border-[#DCDDD7] bg-[#F3F4F0] p-5">

                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#999]">
                        Output
                      </p>

                      <div className="mt-4 flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[9px] font-bold text-[#171717] ring-1 ring-[#DCDDD7]">
                          JPG
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            JPG images
                          </p>

                          <p className="mt-1 text-xs text-[#999]">
                            One image per page
                          </p>
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* INFO */}
                  <div className="mt-5 rounded-2xl border border-[#E1E2DC] bg-[#F7F7F5] px-5 py-4">

                    <div className="flex items-start gap-3">

                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-[#555] ring-1 ring-[#E0E0DB]">
                        ✓
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#333]">
                          Processed in your browser
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#777]">
                          Your PDF is converted locally.
                          JPG images are packaged into
                          one ZIP file for download.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* CONVERT BUTTON */}
                  <button
                    type="button"
                    onClick={convertToJpg}
                    disabled={isConverting}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#303030] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#E1E2DC] disabled:text-[#999] disabled:shadow-none"
                  >
                    {isConverting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#777] border-t-white" />
                        Converting pages...
                      </>
                    ) : (
                      <>
                        Convert to JPG
                        <span>→</span>
                      </>
                    )}
                  </button>

                  {/* ERROR */}
                  {error && (
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}

                </div>
              )}

            </div>

          </div>

          {/* PRIVACY */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#999]">

            <span className="text-[#555]">✓</span>

            <span>
              Your PDF is processed directly in your
              browser and is not uploaded to our server.
            </span>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E2DE] bg-white px-6 py-8">

        <div className="mx-auto max-w-6xl">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <Link
              href="/"
              className="flex items-center gap-2.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-xs font-bold text-white">
                S
              </div>

              <div>
                <p className="text-sm font-semibold text-[#333]">
                  SimplePDF
                </p>

                <p className="mt-0.5 text-xs text-[#999]">
                  Simple tools for your files.
                </p>
              </div>
            </Link>

            <div className="flex gap-6 text-sm text-[#777]">

              <Link
                href="/#tools"
                className="transition hover:text-[#171717]"
              >
                Tools
              </Link>

              <Link
                href="/#privacy"
                className="transition hover:text-[#171717]"
              >
                Privacy
              </Link>

            </div>

          </div>

          <div className="mt-6 border-t border-[#EEEEEA] pt-5">

            <div className="flex flex-col gap-2 text-xs text-[#999] sm:flex-row sm:items-center sm:justify-between">

              <p>
                © {new Date().getFullYear()} SimplePDF
              </p>

              <p>
                Built for simple document work.
              </p>

            </div>

          </div>

        </div>

      </footer>

    </main>
  );
}