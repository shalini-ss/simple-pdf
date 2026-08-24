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

    event.target.value = "";
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
        0.8,
        0.75,
        0.7,
        0.65,
        0.6,
        0.55,
        0.5,
      ];

      let bestBlob: Blob | null = null;
      let bestSize = 0;

      for (let i = 0; i < scales.length; i++) {
        const scale = scales[i];

        for (let j = 0; j < qualities.length; j++) {
          const quality = qualities[j];

          setMessage(
            `Compressing PDF... ${i + 1}/${scales.length}`
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

          const difference =
            targetBytes - blob.size;

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

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-[#5B4BDB] shadow-sm ring-1 ring-[#E3E0FA]">
            ↓
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#18181B] sm:text-5xl">
            Compress PDF
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#70727A] sm:text-base">
            Reduce your PDF to the file size you need while
            keeping it readable.
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

          {/* WORKSPACE */}
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
                    Select the PDF file you want to compress.
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

              {/* ERROR BEFORE FILE */}
              {error && !file && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* FILE SELECTED */}
              {file && (
                <div>

                  {/* FILE HEADER */}
                  <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-6 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1EFFF] text-sm font-bold text-[#5B4BDB]">
                        PDF
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-[#333]">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-[#999]">
                          Current size:{" "}
                          <span className="font-medium text-[#666870]">
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

                    <label className="cursor-pointer self-start rounded-lg border border-[#E1E3E8] bg-white px-4 py-2 text-sm font-medium text-[#666870] transition hover:bg-[#F1EFFF] hover:text-[#5B4BDB] sm:self-auto">

                      Change PDF

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFile}
                        className="hidden"
                      />

                    </label>

                  </div>

                  {/* CONTENT */}
                  <div className="pt-8">

                    <div>

                      <h2 className="text-xl font-semibold tracking-tight text-[#18181B]">
                        Target file size
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-[#777980]">
                        Enter the maximum size you want the
                        compressed PDF to reach.
                      </p>

                    </div>

                    {/* SIZE INPUT */}
                    <div className="mt-6 flex rounded-xl border border-[#D9DBE3] bg-white p-1 transition focus-within:border-[#5B4BDB] focus-within:ring-2 focus-within:ring-[#5B4BDB]/10">

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
                        placeholder="Enter target size"
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
                        className="rounded-lg bg-[#F1EFFF] px-4 py-2 text-sm font-semibold text-[#5B4BDB] outline-none"
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

                    {/* INFO CARD */}
                    <div className="mt-7 rounded-2xl border border-[#E3E1FA] bg-[#F7F5FF] p-5">

                      <div className="flex gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-[#5B4BDB] shadow-sm ring-1 ring-[#E1DFFC]">
                          ✦
                        </div>

                        <div>

                          <p className="text-sm font-semibold text-[#333]">
                            Automatic optimization
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[#777980]">
                            SimplePDF automatically adjusts
                            resolution and image quality to get
                            as close as possible to your target size.
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* COMPRESS BUTTON */}
                    <button
                      type="button"
                      onClick={compressPdf}
                      disabled={
                        !targetSize ||
                        isCompressing
                      }
                      className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.16)] transition hover:-translate-y-0.5 hover:bg-[#4D3FC4] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#E5E5E7] disabled:text-[#999] disabled:shadow-none"
                    >

                      {isCompressing ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
                      <div className="mt-5 rounded-xl border border-[#E1E3E8] bg-[#F7F7FA] px-5 py-4 text-center text-sm text-[#666870]">

                        <span className="mr-2 font-semibold text-[#5B4BDB]">
                          ✓
                        </span>

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

            </div>

          </div>

          {/* TRUST */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs text-[#777980]">

            <span>
              <span className="text-[#5B4BDB]">✓</span>{" "}
              Free
            </span>

            <span>
              <span className="text-[#5B4BDB]">✓</span>{" "}
              No signup
            </span>

            <span>
              <span className="text-[#5B4BDB]">✓</span>{" "}
              No watermark
            </span>

            <span>
              <span className="text-[#5B4BDB]">✓</span>{" "}
              Browser processing
            </span>

          </div>

          {/* PRIVACY */}
          <div className="mt-6 flex items-center justify-center gap-2 px-4 text-center text-xs leading-5 text-[#999]">

            <span className="text-emerald-500">
              ✓
            </span>

            <span>
              Your PDF is processed directly in your browser
              and is not uploaded to our server.
            </span>

          </div>

          {/* HOW IT WORKS */}
          <div className="mt-16 border-t border-[#E3E5EA] pt-14">

            <div className="text-center">

              <p className="text-sm font-semibold text-[#5B4BDB]">
                HOW IT WORKS
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18181B]">
                Compress PDFs in three simple steps
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
                  Choose the PDF file you want to reduce.
                </p>

              </div>

              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  02
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Set target size
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Enter the maximum file size you need.
                </p>

              </div>

              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  03
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Compress & download
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Compress the PDF and download the optimized file.
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