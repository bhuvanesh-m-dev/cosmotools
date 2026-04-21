# CosmoTools

**CosmoTools** is a privacy-first, serverless web utility suite hosted directly on GitHub Pages. It is designed with a strict stateless architecture where all processing happens locally in your browser.

🔗 **Live Access:** [bhuvanesh-m-dev.github.io/cosmotools](https://bhuvanesh-m-dev.github.io/cosmotools)

## 🛡️ Core Philosophy: Privacy First
Our primary promise is **Cryptographic Certainty rather than Trust**:
- **Zero Server Dependencies:** No backend servers are used to process your files.
- **Complete Privacy:** Your files **never** leave your device. There are no uploads to the cloud. Your data stays in your browser itself.
- **Stateless Architecture:** No user accounts, no session management, and no databases. All operations are ephemeral and memory-only.
- **No Limits:** Unlimited usage with no quotas. Works offline after initial load.

---

## 📄 CosmoPDF Suite
The CosmoPDF suite provides essential PDF manipulation capabilities without requiring server infrastructure. It operates entirely on the client-side using technologies like WebAssembly, PDF-LIB, PDF-JS, and Mammoth.js.

### 1. DocxFlex - Converter (`/cosmopdf/docxflex/`)
Bidirectional conversion between PDF and Microsoft Word (DOCX) formats.
- **Features:** Automatic format detection, convert PDF to editable DOCX, convert DOCX to PDF, preserve formatting and layout, extract images, and font embedding options.
- **How it works:** Uses Mammoth.js for text and layout mapping to DOCX and PDF-LIB for DOCX to PDF reconstruction.

### 2. Merge PDF (`/cosmopdf/merge-pdf/`)
Combine multiple PDF documents into a single unified file.
- **Features:** Upload multiple PDFs simultaneously, drag-and-drop file ordering, visual thumbnails, and single-click download.
- **How it works:** Uses `PDFDocument.copyPages()` to merge files locally in your browser memory.

### 3. PDF Architect - Edit (`/cosmopdf/edit/`)
A single-file PDF editor for page manipulation, rotation, and extraction.
- **Features:** Visual grid of all pages, drag-to-rearrange page order, individual page rotation (90°), page deletion, and extraction via range notation (e.g., `1-5, 8, 11-13`).
- **How it works:** Manipulates the PDF structure directly in the browser and outputs a new modified PDF.

### 4. Portable-Image (`/cosmopdf/portable-image/`)
Convert PDF to images and images to PDF - 100% local processing.
- **Features:** PDF to Image (PNG, JPEG, WebP, BMP), Image to PDF conversion, adjustable image quality, and download as ZIP archive.
- **How it works:** Leverages PDF.js and jsPDF to convert and render files entirely on your device.

---

## 🛠️ Technical Implementation
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Engines:** PDF-LIB (creation/modification), PDF-JS (Mozilla's PDF engine for rendering), Mammoth.js (DOCX handling)
- **Runtime:** WebAssembly for near-native performance.
- **Security:** Since there is no server and no network requests made during file processing, standard attack vectors (Server Breach, MitM) are effectively eliminated. CosmoTools is inherently compliant with privacy standards as no data is collected or transmitted.

## 🚀 Usage Guidelines
1. Visit [CosmoTools](https://bhuvanesh-m-dev.github.io/cosmotools).
2. Select the tool you need from the suite.
3. Drop your files into the browser. Processing capability is determined by your system's RAM.
4. Finish your work and download your processed files instantly.

## 🤝 Contributing
Contributions are welcome! Whether it's adding new PDF tools (like compress, OCR, watermark), improving UI/UX, or enhancing performance, feel free to open a pull request or issue.
- Keep it simple: ES6+ JavaScript, Semantic HTML5, and no external build tools.

## 📜 License
MIT License. Maintained by Bhuvanesh M.
