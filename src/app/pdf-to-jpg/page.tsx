"use client";

import { useState } from "react";
import JSZip from "jszip";
import Link from "next/link";

export default function PdfToJpgPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
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
      setPageCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("Loading PDF...");

      const bytes = await selectedFile.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "/pdf.worker.min.mjs";

      const pdf = await pdfjsLib
        .getDocument({
          data: bytes,
        })
        .promise;

      setFile(selectedFile);
      setPageCount(pdf.numPages);
      setMessage(
        `${pdf.numPages} ${
          pdf.numPages === 1 ? "page" : "pages"
        } loaded.`
      );
    } catch (err) {
      console.error(err);

      setFile(null);
      setPageCount(0);

      setError(
        "Could not load the PDF. It may be corrupted or password-protected."
      );

      setMessage("");
    } finally {
      setIsLoading(false);
    }
  }

  async function convertToJpg() {
    if (!file) {
      setError("Please select a PDF file.");
      return;
    }

    try {
      setIsProcessing(true);
      setError("");
      setMessage("Preparing JPG files...");

      const bytes = await file.arrayBuffer();

      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "/pdf.worker.min.mjs";

      const pdf = await pdfjsLib
        .getDocument({
          data: bytes,
        })
        .promise;

      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        setMessage(
          `Converting page ${i} of ${pdf.numPages}...`
        );

        const page = await pdf.getPage(i);

        const viewport = page.getViewport({
          scale: 2,
        });

        const canvas =
          document.createElement("canvas");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d", {
          alpha: false,
        });

        if (!context) {
          throw new Error(
            "Could not create canvas."
          );
        }

        context.fillStyle = "#ffffff";
        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const blob = await new Promise<Blob | null>(
          (resolve) =>
            canvas.toBlob(
              resolve,
              "image/jpeg",
              0.92
            )
        );

        if (!blob) {
          throw new Error(
            "Could not create JPG image."
          );
        }

        zip.file(`page-${i}.jpg`, blob);

        canvas.width = 1;
        canvas.height = 1;
      }

      setMessage("Creating ZIP file...");

      const zipBlob = await zip.generateAsync({
        type: "blob",
      });

      downloadBlob(
        zipBlob,
        "pdf-to-jpg.zip"
      );

      const sizeMB =
        zipBlob.size / (1024 * 1024);

      setMessage(
        `Done! ${pdf.numPages} ${
          pdf.numPages === 1
            ? "page"
            : "pages"
        } converted and downloaded (${sizeMB.toFixed(
          2
        )} MB).`
      );
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while converting the PDF."
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
            JPG
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#18181B] sm:text-5xl">
            PDF to JPG
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#70727A] sm:text-base">
            Convert PDF pages into high-quality JPG
            images directly in your browser.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#666870]">

            <span className="flex items-center gap-2">
              <span className="text-[#5B4BDB]">
                ✓
              </span>
              Free to use
            </span>

            <span className="flex items-center gap-2">
              <span className="text-[#5B4BDB]">
                ✓
              </span>
              No signup
            </span>

            <span className="flex items-center gap-2">
              <span className="text-[#5B4BDB]">
                ✓
              </span>
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

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-semibold text-[#5B4BDB] shadow-sm ring-1 ring-[#E1E3E8] transition group-hover:-translate-y-1">
                    ↑
                  </div>

                  <h2 className="mt-6 text-xl font-semibold text-[#18181B]">
                    Add your PDF
                  </h2>

                  <p className="mt-2 max-w-md text-sm leading-6 text-[#777980]">
                    Select the PDF you want to convert
                    into JPG images.
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
                        Convert every page into a
                        separate JPG image.
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
                        {(
                          file.size /
                          1024 /
                          1024
                        ).toFixed(2)}{" "}
                        MB · {pageCount}{" "}
                        {pageCount === 1
                          ? "page"
                          : "pages"}
                      </p>

                    </div>

                  </div>


                  {/* CONVERSION INFO */}
                  <div className="mt-10">

                    <h2 className="text-xl font-semibold tracking-tight text-[#18181B]">
                      Convert PDF to JPG
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#777980]">
                      Each PDF page will be converted
                      into a separate JPG image.
                    </p>

                  </div>


                  {/* INFO CARD */}
                  <div className="mt-7 rounded-2xl border border-[#E3E1FA] bg-[#F7F5FF] p-5">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-[#5B4BDB] shadow-sm ring-1 ring-[#E1DFFC]">
                        ✦
                      </div>

                      <div>

                        <p className="text-sm font-medium text-[#333]">
                          Automatic conversion
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#777980]">
                          SimplePDF converts every page
                          into a JPG image and packages
                          multiple images into one ZIP file.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* CONVERT BUTTON */}
                  <button
                    type="button"
                    onClick={convertToJpg}
                    disabled={isProcessing}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.16)] transition hover:-translate-y-0.5 hover:bg-[#4D3FC4] disabled:cursor-not-allowed disabled:bg-[#E5E5E7] disabled:text-[#999] disabled:shadow-none"
                  >

                    {isProcessing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Converting PDF...
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
                Convert PDF to JPG in three simple steps
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
                  Convert pages
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Each PDF page is converted into a
                  separate JPG image.
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
                  Download your JPG images together
                  in a ZIP file.
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