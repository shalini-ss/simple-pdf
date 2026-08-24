# SimplePDF

> A free, privacy-first online PDF toolkit that lets you process documents directly in your browser — without uploading files to a server.

**Live Demo:** https://simple-pdf-one.vercel.app/

---

## 📌 About the Project

SimplePDF is a browser-based PDF utility website designed to make common PDF tasks simple, fast, and privacy-friendly.

Users can upload a file, process it directly in their browser, and download the result without creating an account or sending their files to a backend server.

### Why SimplePDF?

Many online PDF tools require users to upload their documents to a remote server. This can be inconvenient when working with private or sensitive files.

SimplePDF follows a different approach:

**Upload → Process in Browser → Download**

No login.
No signup.
No database.
No server-side file storage.

---

## ✨ Features

* 📄 Merge PDF files
* ✂️ Split PDF files
* 🖼️ JPG to PDF conversion
* 📸 PDF to JPG conversion
* 🔄 Rotate PDF pages
* 📦 Compress PDF files
* ⚡ Browser-based processing
* 🔒 Privacy-focused architecture
* 🚫 No login or signup
* 🚫 No database
* 🚫 No server-side file storage
* 📱 Responsive UI
* 🔍 SEO-friendly page structure

---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### PDF Processing

* `pdf-lib`
* `pdfjs-dist`
* `jsPDF`
* `JSZip`

### Development & Deployment

* Git
* GitHub
* Vercel

---

## 🏗️ How It Works

SimplePDF processes files locally in the user's browser.

```text
        User
          │
          ▼
    Select PDF/Image
          │
          ▼
   Browser processes file
          │
          ▼
     Generate result
          │
          ▼
      Download file
```

The application does not require a backend API for the PDF-processing workflow.

---

## 🔐 Privacy

Privacy is one of the core principles of SimplePDF.

Your files are processed directly inside your browser.

```text
Your Device
     │
     ▼
   Browser
     │
     ├── Process PDF
     ├── Convert PDF
     ├── Compress PDF
     └── Generate PDF
     │
     ▼
   Download
```

There is no user account system, database, or server-side file-storage system in the current version.

> **Note:** Temporary browser memory/object URLs may exist while a file is being processed. They are cleared when the application releases them or the page/session ends.

---

## 🧰 Available Tools

| Tool         | Description                         |
| ------------ | ----------------------------------- |
| Merge PDF    | Combine multiple PDF files into one |
| Split PDF    | Extract selected pages from a PDF   |
| JPG to PDF   | Convert JPG images into a PDF       |
| PDF to JPG   | Convert PDF pages into JPG images   |
| Rotate PDF   | Rotate individual PDF pages         |
| Compress PDF | Reduce PDF file size                |

---

## 📸 Screenshots

### Home Page

![SimplePDF Home Page](./screenshots/home.png)

### Merge PDF

![Merge PDF](./screenshots/merge-pdf.png)

### Split PDF

![Split PDF](./screenshots/split-pdf.png)

### JPG to PDF

![JPG to PDF](./screenshots/jpg-to-pdf.png)

### PDF to JPG

![PDF to JPG](./screenshots/pdf-to-jpg.png)

### Compress PDF

![Compress PDF](./screenshots/compress-pdf.png)

### Rotate PDF

![Rotate PDF](./screenshots/rotate-pdf.png)

> Add your actual screenshots inside a `screenshots` folder in the repository.

---

## 🎥 Demo

Add a short GIF demonstrating the workflow:

```text
Upload → Process → Download
```

Example:

![SimplePDF Demo](./screenshots/demo.gif)

---

## 📂 Project Structure

```text
simple-pdf/
│
├── public/
│   └── pdf.worker.min.mjs
│
├── src/
│   └── app/
│       ├── compress-pdf/
│       ├── jpg-to-pdf/
│       ├── merge-pdf/
│       ├── pdf-to-jpg/
│       ├── rotate-pdf/
│       ├── split-pdf/
│       │
│       ├── layout.tsx
│       ├── page.tsx
│       ├── robots.ts
│       └── sitemap.ts
│
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <https://github.com/shalini-ss>
```

### 2. Navigate to the project

```bash
cd simple-pdf
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

### 5. Open in your browser

```text
http://localhost:3000
```

---

## 📦 Build for Production

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

---

## 🌐 Deployment

The project is deployed using Vercel.

**Live Website:** https://simple-pdf-one.vercel.app/

---

## 🔎 SEO

SimplePDF also includes basic technical SEO implementation:

* Unique metadata for individual tools
* `robots.txt`
* `sitemap.xml`
* Search-engine-friendly routes
* Page-specific titles and descriptions
* Google Search Console verification

Example routes:

```text
/
├── /merge-pdf
├── /split-pdf
├── /jpg-to-pdf
├── /pdf-to-jpg
├── /compress-pdf
└── /rotate-pdf
```

---

## 🎯 Project Goals

The main goals of SimplePDF are:

1. Make common PDF operations easy to use.
2. Provide a clean and professional user experience.
3. Keep document processing privacy-focused.
4. Avoid unnecessary account creation.
5. Process files directly in the browser wherever possible.
6. Build an SEO-friendly production-ready web application.

---

## 🧠 What I Learned

While building SimplePDF, I worked with:

* Next.js App Router
* React and TypeScript
* Client-side file processing
* PDF manipulation
* PDF rendering
* Image-to-PDF conversion
* PDF-to-image conversion
* File compression techniques
* ZIP file generation
* Responsive UI development
* SEO implementation
* Sitemap and robots configuration
* Google Search Console
* Vercel deployment
* Git and GitHub

---

## 🚧 Future Improvements

Possible future improvements include:

* Better compression algorithms
* More advanced PDF tools
* Improved mobile experience
* Drag-and-drop file uploads
* Progress indicators for large files
* More detailed error handling
* Accessibility improvements
* Additional document conversion tools

---

## 📄 License

This project is intended as a personal portfolio and learning project.

---

## 👩‍💻 Author

**Shalini S**

Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS.

### SimplePDF

**Live:** https://simple-pdf-one.vercel.app/
