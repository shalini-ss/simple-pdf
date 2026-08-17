"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";

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
    <main className="min-h-screen bg-[#F7F7F5] text-[#171717]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#E5E5E2] bg-[#F7F7F5]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">

          <a href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-xs font-bold text-white">
              S
            </div>

            <span className="text-[18px] font-semibold tracking-tight">
              SimplePDF
            </span>
          </a>

          <a
            href="/#tools"
            className="text-sm font-medium text-[#666] transition hover:text-[#171717]"
          >
            Tools
          </a>

        </div>
      </header>

      {/* MAIN */}
      <section className="px-6 pb-20 pt-12 sm:pt-16">
        <div className="mx-auto max-w-4xl">

          {/* HERO */}
          <div className="text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-semibold shadow-sm ring-1 ring-[#E2E2DE]">
              JPG
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              JPG to PDF
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[#666] sm:text-lg">
              Turn your images into a clean,
              organized PDF document.
            </p>

          </div>

          {/* WORKSPACE */}
          <div className="mt-12 overflow-hidden rounded-3xl border border-[#E0E0DC] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)]">

            {/* UPLOAD */}
            <div className="p-6 sm:p-8">

              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#DCDDD7] bg-[#F8F8F6] px-6 py-12 text-center transition hover:border-[#BEBFB9] hover:bg-[#F3F4F0]">

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-[#E2E2DE] transition group-hover:-translate-y-0.5">
                  +
                </div>

                <h2 className="mt-6 text-lg font-semibold">
                  Add your images
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#777]">
                  Select one or multiple JPG or PNG images.
                </p>

                <span className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-medium text-white shadow-sm transition group-hover:bg-[#303030]">
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

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <div className="flex items-center gap-3">

                        <h2 className="text-xl font-semibold tracking-tight">
                          Selected images
                        </h2>

                        <span className="rounded-full bg-[#ECEDE8] px-3 py-1 text-xs font-medium text-[#666]">
                          {images.length}{" "}
                          {images.length === 1
                            ? "image"
                            : "images"}
                        </span>

                      </div>

                      <p className="mt-2 text-sm leading-6 text-[#777]">
                        Images will appear in the PDF in this order.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={clearAll}
                      className="self-start rounded-lg px-3 py-2 text-sm font-medium text-[#666] transition hover:bg-[#F3F4F0] hover:text-[#171717] sm:self-auto"
                    >
                      Clear all
                    </button>

                  </div>

                  {/* GRID */}
                  <div className="mt-7 grid gap-5 sm:grid-cols-2 md:grid-cols-3">

                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className="group overflow-hidden rounded-2xl border border-[#DCDDD7] bg-white transition hover:-translate-y-0.5 hover:border-[#BEBFB9] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)]"
                      >

                        <div className="relative flex h-52 items-center justify-center bg-[#F3F4F0]">

                          <img
                            src={image.preview}
                            alt={image.file.name}
                            className="h-full w-full object-contain p-4"
                          />

                          <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-xs font-semibold text-white shadow-sm">
                            {index + 1}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeImage(image.id)}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base text-[#666] shadow-sm ring-1 ring-[#DCDDD7] transition hover:bg-[#171717] hover:text-white hover:ring-[#171717]"
                            aria-label={`Remove ${image.file.name}`}
                          >
                            ×
                          </button>

                        </div>

                        <div className="border-t border-[#EEEEEA] p-4">

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

                  {/* INFO */}
                  <div className="mt-8 rounded-2xl border border-[#E0E0DC] bg-[#F7F7F5] p-5">

                    <div className="flex gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm ring-1 ring-[#E2E2DE]">
                        ✦
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#333]">
                          Ready to create your PDF
                        </p>

                        <p className="mt-1 text-sm leading-6 text-[#777]">
                          Each selected image will be placed on
                          its own PDF page and fitted neatly within
                          the page.
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* CREATE */}
                  <button
                    type="button"
                    onClick={createPdf}
                    disabled={isConverting}
                    className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-6 py-4 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#303030] hover:shadow-md disabled:cursor-not-allowed disabled:bg-[#E5E5E2] disabled:text-[#999] disabled:shadow-none"
                  >
                    {isConverting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-white" />
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

          {/* PRIVACY */}
          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-[#999]">
            <span>✓</span>
            <span>
              Your images are processed directly in your browser
              and are not uploaded to our server.
            </span>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#E2E2DE] bg-[#F7F7F5] px-6 py-8">

        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-[#888] sm:flex-row sm:items-center sm:justify-between">

          <a
            href="/"
            className="font-semibold text-[#333]"
          >
            SimplePDF
          </a>

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