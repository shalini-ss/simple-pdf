"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import Link from "next/link";

export default function CompressPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetSize, setTargetSize] = useState("");
  const [unit, setUnit] = useState<"MB" | "KB">("MB");
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please select a PDF file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setTargetSize("");
    setError("");
    setMessage("");
  }

  function getTargetBytes() {
    const value = Number(targetSize);

    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    return unit === "MB"
      ? value * 1024 * 1024
      : value * 1024;
  }

  async function createCompressedPdf(
    pdf: any,
    scale: number,
    quality: number
  ): Promise<Blob> {
    let outputPdf: jsPDF | null = null;

    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {
      const page = await pdf.getPage(pageNumber);

      const originalViewport = page.getViewport({
        scale: 1,
      });

      const viewport = page.getViewport({
        scale,
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

      const renderTask = page.render({
        canvas,
        canvasContext: context,
        viewport,
      });

      await renderTask.promise;

      const imageData = canvas.toDataURL(
        "image/jpeg",
        quality
      );

      const pageWidth = originalViewport.width;
      const pageHeight = originalViewport.height;

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
      throw new Error("Could not create PDF.");
    }

    return outputPdf.output("blob");
  }

  async function compressPdf() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    const targetBytes = getTargetBytes();

    if (!targetBytes) {
      setError("Please enter a valid target size.");
      return;
    }

    setIsCompressing(true);
    setError("");
    setMessage("");

    try {
      if (file.size <= targetBytes) {
        setMessage(
          "Your PDF is already smaller than the target size."
        );
        return;
      }

      setMessage("Analyzing PDF...");

      const fileBytes = await file.arrayBuffer();

      /*
       * IMPORTANT:
       * pdfjs-dist must be imported only in the browser.
       * This prevents the DOMMatrix error during
       * Next.js server prerendering.
       */
      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "/pdf.worker.min.mjs";

      const pdf = await pdfjsLib
        .getDocument({
          data: fileBytes,
        })
        .promise;

      const scales = [
        3.0,
        2.8,
        2.6,
        2.4,
        2.2,
        2.0,
        1.8,
        1.6,
        1.5,
        1.4,
        1.3,
        1.2,
        1.1,
        1.0,
        0.9,
        0.8,
        0.7,
        0.6,
        0.5,
        0.4,
        0.3,
      ];

      const qualities = [
        1.0,
        0.98,
        0.95,
        0.92,
        0.88,
        0.84,
        0.80,
        0.75,
        0.70,
        0.65,
        0.60,
        0.55,
        0.50,
      ];

      let bestBlob: Blob | null = null;
      let bestSize = 0;

      for (let i = 0; i < scales.length; i++) {
        const scale = scales[i];

        for (let j = 0; j < qualities.length; j++) {
          const quality = qualities[j];

          setMessage(
            `Compressing... ${i + 1}/${scales.length}`
          );

          const blob = await createCompressedPdf(
            pdf,
            scale,
            quality
          );

          if (
            blob.size <= targetBytes &&
            blob.size > bestSize
          ) {
            bestBlob = blob;
            bestSize = blob.size;
          }

          const difference = targetBytes - blob.size;

          if (
            difference >= 0 &&
            difference <=
              Math.max(
                1024,
                targetBytes * 0.005
              )
          ) {
            bestBlob = blob;
            bestSize = blob.size;
            break;
          }
        }

        if (bestBlob && bestSize > 0) {
          const remaining =
            targetBytes - bestSize;

          if (
            remaining >= 0 &&
            remaining <=
              Math.max(
                1024,
                targetBytes * 0.005
              )
          ) {
            break;
          }
        }
      }

      if (!bestBlob) {
        setError(
          "The requested target size could not be reached with the current compression method."
        );
        setMessage("");
        return;
      }

      const finalSizeKB =
        bestBlob.size / 1024;

      const finalSizeMB =
        bestBlob.size / (1024 * 1024);

      const url =
        URL.createObjectURL(bestBlob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = "compressed.pdf";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      if (unit === "MB") {
        setMessage(
          `Done! Your compressed PDF is ${finalSizeMB.toFixed(
            2
          )} MB.`
        );
      } else {
        setMessage(
          `Done! Your compressed PDF is ${finalSizeKB.toFixed(
            1
          )} KB.`
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while compressing the PDF."
      );

      setMessage("");
    } finally {
      setIsCompressing(false);
    }
  }

  function removeFile() {
    setFile(null);
    setTargetSize("");
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
            Tools
          </Link>

        </div>
      </header>

      {/* MAIN */}
      <section className="px-6 pb-20 pt-12 sm:pb-24 sm:pt-16">
        <div className="mx-auto max-w-4xl">

          {/* HERO */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-[#DFDFDB]">
              ↓
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Compress PDF
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#666] sm:text-lg">
              Reduce your PDF to the file size you need
              while keeping it readable.
            </p>

          </div>

          {/* UPLOAD */}
          {!file && (
            <div className="mt-12 overflow-hidden rounded-3xl border border-[#DCDDD7] bg-[#F8F8F6] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">

              <div className="p-5 sm:p-7">

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#D8D9D3] bg-white px-6 py-14 text-center transition hover:border-[#BEBFB9] hover:bg-[#FAFAF8]">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ECEDE8] text-3xl shadow-sm transition group-hover:bg-[#171717] group-hover:text-white">
                    ↑
                  </div>

                  <h2 className="mt-6 text-lg font-semibold">
                    Choose your PDF
                  </h2>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-[#777]">
                    Select the document you want to compress.
                  </p>

                  <span className="mt-7 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition group-hover:bg-[#303030]">
                    Choose PDF
                  </span>

                  <p className="mt-4 text-xs text-[#999]">
                    PDF files only
                  </p>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFile}
                    className="hidden"
                  />

                </label>

              </div>
            </div>
          )}

          {/* ERROR */}
          {error && !file && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FILE */}
          {file && (
            <div className="mt-12 overflow-hidden rounded-3xl border border-[#D8D9D3] bg-[#F8F8F6] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">

              {/* FILE HEADER */}
              <div className="border-b border-[#E2E2DE] px-6 py-6 sm:px-8">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ECEDE8] text-sm font-semibold text-[#555]">
                      PDF
                    </div>

                    <div className="min-w-0">

                      <p className="truncate text-sm font-semibold text-[#333]">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-[#999]">
                        Current size:{" "}
                        <span className="font-medium text-[#666]">
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </span>
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={removeFile}
                    className="self-start rounded-lg px-3 py-2 text-sm font-medium text-[#777] transition hover:bg-white hover:text-[#171717] sm:self-auto"
                  >
                    Change PDF
                  </button>

                </div>

              </div>

              {/* CONTENT */}
              <div className="px-6 py-7 sm:px-8 sm:py-8">

                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Target file size
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#777]">
                    Enter the maximum size you want the
                    compressed PDF to reach.
                  </p>
                </div>

                {/* SIZE INPUT */}
                <div className="mt-5 flex rounded-xl border border-[#D5D6D0] bg-white p-1 transition focus-within:border-[#171717]">

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={targetSize}
                    onChange={(event) => {
                      setTargetSize(
                        event.target.value
                      );
                      setError("");
                      setMessage("");
                    }}
                    placeholder="Enter size"
                    className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[#AAA]"
                  />

                  <select
                    value={unit}
                    onChange={(event) => {
                      setUnit(
                        event.target.value as
                          | "MB"
                          | "KB"
                      );
                      setError("");
                      setMessage("");
                    }}
                    className="rounded-lg bg-[#ECEDE8] px-4 py-2 text-sm font-medium text-[#555] outline-none"
                  >
                    <option value="MB">
                      MB
                    </option>

                    <option value="KB">
                      KB
                    </option>
                  </select>

                </div>

                <p className="mt-2 text-xs text-[#999]">
                  Example: 0.5 MB or 500 KB
                </p>

                {/* INFO */}
                <div className="mt-7 rounded-2xl border border-[#DCDDD7] bg-white p-5">

                  <div className="flex gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#ECEDE8] text-sm">
                      ✦
                    </div>

                    <div>

                      <p className="text-sm font-medium text-[#333]">
                        Automatic optimization
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#777]">
                        SimplePDF automatically adjusts
                        resolution and image quality to get
                        as close as possible to your target size.
                      </p>

                    </div>

                  </div>

                </div>

                {/* BUTTON */}
                <button
                  type="button"
                  onClick={compressPdf}
                  disabled={
                    !targetSize ||
                    isCompressing
                  }
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#303030] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#DCDDD7] disabled:text-[#999] disabled:shadow-none"
                >
                  {isCompressing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#777] border-t-white" />
                      Compressing PDF...
                    </>
                  ) : (
                    <>
                      Compress PDF
                      <span>→</span>
                    </>
                  )}
                </button>

                {/* MESSAGE */}
                {message && (
                  <div className="mt-5 rounded-xl border border-[#DFE0DA] bg-white px-5 py-4 text-center text-sm text-[#666]">
                    {message}
                  </div>
                )}

                {/* ERROR */}
                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
                    {error}
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TRUST */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs text-[#888]">
            <span>✓ Free</span>
            <span>✓ No signup</span>
            <span>✓ No watermark</span>
            <span>✓ Browser processing</span>
          </div>

          {/* PRIVACY */}
          <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#999]">
            <span>✓</span>

            <span>
              Your PDF is processed in your browser and is
              not uploaded to our server.
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