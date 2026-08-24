"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import Link from "next/link";

type ImageFile = {
  id: string;
  file: File;
  preview: string;
};

export default function JpgToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");

  function handleFiles(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);

    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png"].includes(file.type)
    );

    if (validFiles.length === 0) {
      setError("Please select JPG or PNG images.");
      return;
    }

    const newImages = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...newImages]);
    setError("");
    event.target.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);

      if (image) {
        URL.revokeObjectURL(image.preview);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  function clearAll() {
    images.forEach((image) => {
      URL.revokeObjectURL(image.preview);
    });

    setImages([]);
    setError("");
  }

  async function createPdf() {
    if (images.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    try {
      setIsConverting(true);
      setError("");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        const img = new Image();
        img.src = image.preview;

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject();
        });

        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10;

        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;

        const ratio = Math.min(
          maxWidth / img.width,
          maxHeight / img.height
        );

        const width = img.width * ratio;
        const height = img.height * ratio;

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        pdf.addImage(
          image.preview,
          image.file.type === "image/png" ? "PNG" : "JPEG",
          x,
          y,
          width,
          height
        );
      }

      pdf.save("images.pdf");
    } catch {
      setError("Something went wrong while creating the PDF.");
    } finally {
      setIsConverting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] text-[#18181B]">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">

          <Link href="/" className="flex items-center gap-3">
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

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#D97706] shadow-sm ring-1 ring-[#E5E7EB]">
            JPG
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#18181B] sm:text-5xl">
            JPG to PDF
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#70727A] sm:text-base">
            Convert JPG and PNG images into a clean PDF document directly
            in your browser.
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
                  Add your images
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#777980]">
                  Select one or multiple JPG or PNG images to create your PDF.
                </p>

                <span className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.18)] transition group-hover:-translate-y-0.5 group-hover:bg-[#4D3FC4]">
                  Choose Images
                  <span>↑</span>
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handleFiles}
                  className="hidden"
                />

                <p className="mt-4 text-xs text-[#999]">
                  JPG and PNG supported
                </p>

              </label>


              {/* ERROR */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-600">
                  {error}
                </div>
              )}


              {/* SELECTED IMAGES */}
              {images.length > 0 && (
                <div className="mt-10">

                  {/* HEADER */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-semibold tracking-tight text-[#18181B]">
                          Selected images
                        </h2>

                        <span className="rounded-full bg-[#F1EFFF] px-3 py-1 text-xs font-semibold text-[#5B4BDB]">
                          {images.length}{" "}
                          {images.length === 1 ? "image" : "images"}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-6 text-[#777980]">
                        Images will appear in the PDF in this order.
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


                  {/* IMAGE GRID */}
                  <div className="mt-7 grid gap-5 sm:grid-cols-2 md:grid-cols-3">

                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="group overflow-hidden rounded-2xl border border-[#E1E3E8] bg-white transition hover:-translate-y-0.5 hover:border-[#D3CFFF] hover:shadow-[0_10px_25px_rgba(91,75,219,0.08)]"
                      >

                        {/* IMAGE */}
                        <div className="relative flex h-52 items-center justify-center bg-[#F4F5F8]">

                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="h-full w-full object-contain p-4"
                          />

                          {/* NUMBER */}
                          <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#5B4BDB] text-xs font-semibold text-white shadow-sm">
                            {index + 1}
                          </div>

                          {/* REMOVE */}
                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base text-[#666] shadow-sm ring-1 ring-[#DCDDD7] transition hover:bg-[#18181B] hover:text-white hover:ring-[#18181B]"
                            aria-label={`Remove ${image.file.name}`}
                          >
                            ×
                          </button>

                        </div>


                        {/* FILE DETAILS */}
                        <div className="border-t border-[#EEEEF1] p-4">

                          <p className="truncate text-sm font-medium text-[#333]">
                            {image.file.name}
                          </p>

                          <p className="mt-1 text-xs text-[#999]">
                            {(image.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                        </div>

                      </div>
                    ))}

                  </div>


                  {/* INFORMATION */}
                  <div className="mt-8 rounded-2xl border border-[#E3E1FA] bg-[#F7F5FF] p-5">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm text-[#5B4BDB] shadow-sm ring-1 ring-[#E1DFFC]">
                        ✦
                      </div>

                      <div>

                        <p className="text-sm font-semibold text-[#333]">
                          Ready to create your PDF
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#777980]">
                          Each selected image will be placed on its own PDF
                          page and fitted neatly within the page.
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* CREATE BUTTON */}
                  <button
                    type="button"
                    onClick={createPdf}
                    disabled={isConverting}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5B4BDB] px-6 py-4 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(91,75,219,0.16)] transition hover:-translate-y-0.5 hover:bg-[#4D3FC4] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#E5E5E7] disabled:text-[#999] disabled:shadow-none"
                  >

                    {isConverting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Creating PDF...
                      </>
                    ) : (
                      <>
                        Create PDF
                        <span>→</span>
                      </>
                    )}

                  </button>

                </div>
              )}

            </div>

          </div>


          {/* PRIVACY MESSAGE */}
          <div className="mt-7 flex items-center justify-center gap-2 px-4 text-center text-xs leading-5 text-[#999]">

            <span className="text-emerald-500">
              ✓
            </span>

            <span>
              Your images are processed directly in your browser and are not
              uploaded to our server.
            </span>

          </div>


          {/* HOW IT WORKS */}
          <div className="mt-16 border-t border-[#E3E5EA] pt-14">

            <div className="text-center">

              <p className="text-sm font-semibold text-[#5B4BDB]">
                HOW IT WORKS
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#18181B]">
                Convert images in three simple steps
              </h2>

            </div>


            <div className="mt-8 grid gap-4 sm:grid-cols-3">

              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  01
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Select images
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Choose one or more JPG or PNG images.
                </p>

              </div>


              <div className="rounded-2xl border border-[#E1E3E8] bg-white p-6 text-center">

                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F1EFFF] text-xs font-bold text-[#5B4BDB]">
                  02
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Create your PDF
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#777980]">
                  Your browser converts the images into PDF pages.
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
                  Download your finished PDF when conversion is complete.
                </p>

              </div>

            </div>

          </div>


          {/* RELATED TOOLS */}
          <div className="mt-14 rounded-2xl border border-[#E1E3E8] bg-white p-6 sm:p-7">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold">
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