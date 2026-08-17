"use client";

import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import Link from "next/link";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

type Rotation = 0 | 90 | 180 | 270;

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);

  const [pageRotations, setPageRotations] =
    useState<Record<number, Rotation>>({});

  const [pageImages, setPageImages] =
    useState<Record<number, string>>({});

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
      setMessage("Loading PDF pages...");

      const fileBytes = await selectedFile.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: fileBytes,
      }).promise;

      const rotations: Record<number, Rotation> = {};
      const images: Record<number, string> = {};

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        rotations[pageNumber] = 0;

        const page = await pdf.getPage(pageNumber);

        const viewport = page.getViewport({
          scale: 0.7,
        });

        const canvas = document.createElement("canvas");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d", {
          alpha: false,
        });

        if (!context) {
          throw new Error("Could not create canvas.");
        }

        context.fillStyle = "#ffffff";

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        images[pageNumber] = canvas.toDataURL(
          "image/jpeg",
          0.85
        );

        canvas.width = 1;
        canvas.height = 1;
      }

      setFile(selectedFile);
      setPageCount(pdf.numPages);
      setPageRotations(rotations);
      setPageImages(images);

      setMessage(
        `${pdf.numPages} ${
          pdf.numPages === 1 ? "page" : "pages"
        } loaded.`
      );
    } catch (err) {
      console.error(err);

      setError("Could not load the PDF.");
      setFile(null);
      setPageCount(0);
      setPageRotations({});
      setPageImages({});
      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  function rotatePage(
    pageNumber: number,
    amount: 90 | 180 | 270
  ) {
    setPageRotations((current) => {
      const currentRotation =
        current[pageNumber] ?? 0;

      const newRotation =
        ((currentRotation + amount) % 360) as Rotation;

      return {
        ...current,
        [pageNumber]: newRotation,
      };
    });
  }

  function resetPage(pageNumber: number) {
    setPageRotations((current) => ({
      ...current,
      [pageNumber]: 0,
    }));
  }

  async function rotatePdf() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setMessage("");

    try {
      setMessage("Preparing rotated PDF...");

      const fileBytes = await file.arrayBuffer();

      const pdf = await pdfjsLib.getDocument({
        data: fileBytes,
      }).promise;

      let outputPdf: jsPDF | null = null;

      for (
        let pageNumber = 1;
        pageNumber <= pdf.numPages;
        pageNumber++
      ) {
        const rotation =
          pageRotations[pageNumber] ?? 0;

        setMessage(
          `Processing page ${pageNumber} of ${pdf.numPages}...`
        );

        const page = await pdf.getPage(pageNumber);

        const scale = 1.5;

        const originalViewport = page.getViewport({
          scale: 1,
        });

        const viewport = page.getViewport({
          scale,
          rotation,
        });

        const canvas = document.createElement("canvas");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d", {
          alpha: false,
        });

        if (!context) {
          throw new Error("Could not create canvas.");
        }

        context.fillStyle = "#ffffff";

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        let pageWidth = originalViewport.width;
        let pageHeight = originalViewport.height;

        if (rotation === 90 || rotation === 270) {
          [pageWidth, pageHeight] = [
            pageHeight,
            pageWidth,
          ];
        }

        const imageData = canvas.toDataURL(
          "image/jpeg",
          0.95
        );

        if (!outputPdf) {
          outputPdf = new jsPDF({
            orientation:
              pageWidth > pageHeight
                ? "landscape"
                : "portrait",
            unit: "pt",
            format: [pageWidth, pageHeight],
            compress: true,
          });
        } else {
          outputPdf.addPage(
            [pageWidth, pageHeight],
            pageWidth > pageHeight
              ? "landscape"
              : "portrait"
          );
        }

        outputPdf.addImage(
          imageData,
          "JPEG",
          0,
          0,
          pageWidth,
          pageHeight,
          undefined,
          "FAST"
        );

        canvas.width = 1;
        canvas.height = 1;
      }

      if (!outputPdf) {
        throw new Error(
          "Could not create rotated PDF."
        );
      }

      setMessage("Creating your PDF...");

      const blob = outputPdf.output("blob");

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "rotated.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      const sizeMB =
        blob.size / (1024 * 1024);

      setMessage(
        `Done! Rotated PDF downloaded (${sizeMB.toFixed(
          2
        )} MB).`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while creating the rotated PDF."
      );

      setMessage("");
    } finally {
      setIsProcessing(false);
    }
  }

  const rotatedPages = Object.values(
    pageRotations
  ).filter((rotation) => rotation !== 0).length;

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
              ↻
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Rotate PDF
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-[#666]">
              Rotate individual pages exactly the
              way you want.
            </p>

          </div>

          {/* WORKSPACE */}
          <div className="mt-10 rounded-3xl border border-[#D8D9D3] bg-[#F8F8F6] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.05)] sm:p-7">

            {/* UPLOAD */}
            <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8D9D3] bg-[#F3F4F0] px-6 py-10 text-center transition hover:border-[#BEBFB9] hover:bg-[#ECEDE8]">

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-2xl shadow-sm ring-1 ring-[#E1E1DD] transition group-hover:-translate-y-0.5">
                +
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                Add a PDF
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#777]">
                Select the PDF you want to rotate.
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

            {/* LOADING */}
            {isLoading && (
              <div className="mt-5 rounded-xl border border-[#DFE0DA] bg-white px-4 py-3 text-center text-sm text-[#666]">
                Loading PDF pages...
              </div>
            )}

            {/* ERROR */}
            {error && (
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
                      Choose the rotation for each page.
                    </p>
                  </div>

                  {rotatedPages > 0 && (
                    <span className="self-start rounded-full bg-[#171717] px-3 py-1.5 text-xs font-medium text-white">
                      {rotatedPages} rotated
                    </span>
                  )}

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
                      MB
                    </p>

                  </div>

                </div>

                {/* PAGES */}
                <div className="mt-8">

                  <div>
                    <h2 className="text-lg font-semibold">
                      PDF Pages
                    </h2>

                    <p className="mt-1 text-sm text-[#777]">
                      Rotate pages individually. Changes
                      are applied when you download.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {Array.from(
                      { length: pageCount },
                      (_, index) => {
                        const pageNumber =
                          index + 1;

                        const rotation =
                          pageRotations[
                            pageNumber
                          ] ?? 0;

                        return (
                          <div
                            key={pageNumber}
                            className="group overflow-hidden rounded-2xl border border-[#DCDDD7] bg-white transition hover:-translate-y-0.5 hover:border-[#BEBFB9] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
                          >

                            {/* PREVIEW */}
                            <div className="relative flex h-[310px] items-center justify-center overflow-hidden bg-[#ECEDE8] p-5">

                              <div className="absolute left-3 top-3 z-10 rounded-lg bg-[#171717] px-2.5 py-1 text-xs font-semibold text-white">
                                Page {pageNumber}
                              </div>

                              {rotation !== 0 && (
                                <div className="absolute right-3 top-3 z-10 rounded-lg border border-[#DCDDD7] bg-white px-2.5 py-1 text-xs font-semibold text-[#555] shadow-sm">
                                  {rotation}°
                                </div>
                              )}

                              {pageImages[
                                pageNumber
                              ] && (
                                <img
                                  src={
                                    pageImages[
                                      pageNumber
                                    ]
                                  }
                                  alt={`Page ${pageNumber}`}
                                  className="max-h-[255px] max-w-[85%] rounded-lg bg-white object-contain shadow-sm transition-transform duration-300"
                                  style={{
                                    transform: `rotate(${rotation}deg)`,
                                  }}
                                />
                              )}

                            </div>

                            {/* CONTROLS */}
                            <div className="border-t border-[#E5E5E2] p-4">

                              <div className="grid grid-cols-3 gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    rotatePage(
                                      pageNumber,
                                      90
                                    )
                                  }
                                  className="rounded-lg border border-[#DCDDD7] bg-white px-2 py-2.5 text-xs font-medium text-[#555] transition hover:border-[#BEBFB9] hover:bg-[#F7F7F5] hover:text-[#171717]"
                                >
                                  ↻ 90°
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    rotatePage(
                                      pageNumber,
                                      180
                                    )
                                  }
                                  className="rounded-lg border border-[#DCDDD7] bg-white px-2 py-2.5 text-xs font-medium text-[#555] transition hover:border-[#BEBFB9] hover:bg-[#F7F7F5] hover:text-[#171717]"
                                >
                                  180°
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    rotatePage(
                                      pageNumber,
                                      270
                                    )
                                  }
                                  className="rounded-lg border border-[#DCDDD7] bg-white px-2 py-2.5 text-xs font-medium text-[#555] transition hover:border-[#BEBFB9] hover:bg-[#F7F7F5] hover:text-[#171717]"
                                >
                                  ↺ 90°
                                </button>

                              </div>

                              {rotation !== 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    resetPage(
                                      pageNumber
                                    )
                                  }
                                  className="mt-3 w-full text-xs font-medium text-[#999] transition hover:text-[#171717]"
                                >
                                  Reset rotation
                                </button>
                              )}

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </div>

                {/* INFO */}
                <div className="mt-7 rounded-2xl border border-[#DCDDD7] bg-[#ECEDE8] p-5">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                      ✓
                    </div>

                    <div>

                      <p className="text-sm font-medium text-[#333]">
                        Rotate pages individually
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#777]">
                        Each page can have its own
                        rotation. Your original PDF is
                        not modified.
                      </p>

                    </div>

                  </div>

                </div>

                {/* DOWNLOAD */}
                <button
                  type="button"
                  onClick={rotatePdf}
                  disabled={isProcessing}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#303030] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#DCDDD7] disabled:text-[#999] disabled:shadow-none"
                >
                  {isProcessing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#777] border-t-white" />
                      Creating PDF...
                    </>
                  ) : (
                    <>
                      Rotate & Download PDF
                      <span>→</span>
                    </>
                  )}
                </button>

                {/* MESSAGE */}
                {message && (
                  <p className="mt-4 text-center text-sm text-[#666]">
                    {message}
                  </p>
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