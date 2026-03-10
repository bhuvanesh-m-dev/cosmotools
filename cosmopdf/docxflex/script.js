// --- State Management ---
let currentFile = null;
let currentFileBuffer = null;
let conversionType = 'pdf-to-docx';
let isConverting = false;

// --- DOM Elements ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileNameEl = document.getElementById('file-name');
const fileSizeEl = document.getElementById('file-size');
const fileIcon = document.getElementById('file-icon');
const clearFileBtn = document.getElementById('clear-file-btn');
const convertBtn = document.getElementById('convert-btn');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const loadingModal = document.getElementById('loading-modal');
const loadingStatus = document.getElementById('loading-status');
const loadingDetail = document.getElementById('loading-detail');
const uploadTitle = document.getElementById('upload-title');
const uploadSubtitle = document.getElementById('upload-subtitle');
const fileFormatHint = document.getElementById('file-format-hint');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressStatus = document.getElementById('progress-status');
const progressPercentage = document.getElementById('progress-percentage');

// Conversion type buttons
const pdfToDocxBtn = document.getElementById('pdf-to-docx-btn');
const docxToPdfBtn = document.getElementById('docx-to-pdf-btn');

// Options panels
const pdfToDocxOptions = document.getElementById('pdf-to-docx-options');
const docxToPdfOptions = document.getElementById('docx-to-pdf-options');
const conversionOptions = document.getElementById('conversion-options');

// Checkboxes
const preserveLayout = document.getElementById('preserve-layout');
const extractImages = document.getElementById('extract-images');
const extractText = document.getElementById('extract-text');
const embedFonts = document.getElementById('embed-fonts');
const highQuality = document.getElementById('high-quality');
const preserveFormatting = document.getElementById('preserve-formatting');

// --- Initialization ---

// PDF.js Worker - Fix worker URL
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
    console.log('PDF.js initialized');
}

// Check if libraries are loaded
console.log('Mammoth loaded:', typeof mammoth !== 'undefined');
console.log('JSZip loaded:', typeof JSZip !== 'undefined');
console.log('PDFLib loaded:', typeof PDFLib !== 'undefined');
console.log('saveAs loaded:', typeof saveAs !== 'undefined');

// Theme Logic
const savedTheme = localStorage.getItem('docxflex-theme');

if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.classList.replace('fa-sun', 'fa-moon');
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        localStorage.setItem('docxflex-theme', 'light');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        localStorage.setItem('docxflex-theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
});

// Set initial conversion type
setConversionType('pdf-to-docx');

// --- Event Listeners ---

// Conversion type buttons
pdfToDocxBtn.addEventListener('click', () => setConversionType('pdf-to-docx'));
docxToPdfBtn.addEventListener('click', () => setConversionType('docx-to-pdf'));

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    console.log('Files dropped:', files);
    
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

dropZone.addEventListener('click', () => {
    console.log('Drop zone clicked');
    fileInput.click();
});

// File input change event
fileInput.addEventListener('change', (e) => {
    console.log('File input changed', e.target.files);
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
    // Don't reset the input value here, it causes issues
});

clearFileBtn.addEventListener('click', clearFile);

convertBtn.addEventListener('click', startConversion);

// --- Core Functions ---

function setConversionType(type) {
    conversionType = type;
    
    // Update button styles
    pdfToDocxBtn.classList.remove('active', 'bg-white', 'text-black');
    docxToPdfBtn.classList.remove('active', 'bg-white', 'text-black');
    
    if (type === 'pdf-to-docx') {
        pdfToDocxBtn.classList.add('active', 'bg-white', 'text-black');
        uploadTitle.textContent = 'Drop PDF file here';
        uploadSubtitle.textContent = 'or click to select file';
        fileFormatHint.textContent = 'Supported: PDF';
        fileInput.accept = '.pdf';
        pdfToDocxOptions.classList.remove('hidden');
        docxToPdfOptions.classList.add('hidden');
    } else {
        docxToPdfBtn.classList.add('active', 'bg-white', 'text-black');
        uploadTitle.textContent = 'Drop DOCX file here';
        uploadSubtitle.textContent = 'or click to select file';
        fileFormatHint.textContent = 'Supported: DOCX, DOC';
        fileInput.accept = '.docx,.doc';
        pdfToDocxOptions.classList.add('hidden');
        docxToPdfOptions.classList.remove('hidden');
    }
    
    // Clear current file when switching conversion type
    if (currentFile) {
        clearFile();
    }
}

async function handleFile(file) {
    console.log('Handling file:', file);
    
    // Validate file type based on conversion type
    const isValid = validateFileType(file);
    console.log('File valid:', isValid);
    
    if (!isValid) {
        alert(`Please upload a valid ${conversionType === 'pdf-to-docx' ? 'PDF' : 'DOCX/DOC'} file.`);
        return;
    }
    
    currentFile = file;
    
    try {
        // Read file as ArrayBuffer
        currentFileBuffer = await readFileAsArrayBuffer(file);
        console.log('File buffer size:', currentFileBuffer.byteLength);
        
        // Update UI
        fileNameEl.textContent = file.name;
        fileSizeEl.textContent = formatSize(file.size);
        
        // Set appropriate icon
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        fileIcon.innerHTML = isPdf ? '<i class="fas fa-file-pdf"></i>' : '<i class="fas fa-file-word"></i>';
        
        fileInfo.classList.remove('hidden');
        conversionOptions.classList.remove('hidden');
        convertBtn.disabled = false;
        
    } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
    }
}

// Helper function to read file as ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Error reading file'));
        reader.readAsArrayBuffer(file);
    });
}

function validateFileType(file) {
    const fileName = file.name.toLowerCase();
    const fileType = file.type;
    
    console.log('Validating - Name:', fileName, 'Type:', fileType, 'Conversion:', conversionType);
    
    if (conversionType === 'pdf-to-docx') {
        return fileType === 'application/pdf' || fileName.endsWith('.pdf');
    } else {
        return fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               fileType === 'application/msword' || 
               fileName.endsWith('.docx') || 
               fileName.endsWith('.doc');
    }
}

function clearFile() {
    currentFile = null;
    currentFileBuffer = null;
    fileInfo.classList.add('hidden');
    conversionOptions.classList.add('hidden');
    convertBtn.disabled = true;
    progressContainer.classList.add('hidden');
    
    // Reset file input
    fileInput.value = '';
}

function updateProgress(percent, status) {
    progressContainer.classList.remove('hidden');
    progressBar.style.width = `${percent}%`;
    progressPercentage.textContent = `${percent}%`;
    if (status) {
        progressStatus.textContent = status;
    }
}

async function startConversion() {
    if (!currentFile || !currentFileBuffer || isConverting) {
        console.log('Cannot convert:', { currentFile, currentFileBuffer, isConverting });
        return;
    }
    
    isConverting = true;
    convertBtn.disabled = true;
    
    // Show progress
    progressContainer.classList.remove('hidden');
    updateProgress(0, 'Starting conversion...');
    
    try {
        if (conversionType === 'pdf-to-docx') {
            await convertPdfToDocx();
        } else {
            await convertDocxToPdf();
        }
    } catch (error) {
        console.error('Conversion error:', error);
        alert('Conversion failed: ' + error.message);
    } finally {
        isConverting = false;
        convertBtn.disabled = false;
        setTimeout(() => {
            progressContainer.classList.add('hidden');
        }, 3000);
    }
}

// PDF to DOCX Conversion
async function convertPdfToDocx() {
    updateProgress(10, 'Loading PDF...');
    
    try {
        // Load PDF with PDF.js
        const pdf = await pdfjsLib.getDocument({ data: currentFileBuffer }).promise;
        const numPages = pdf.numPages;
        
        updateProgress(20, `Processing ${numPages} pages...`);
        
        // Extract text from each page
        let fullText = '';
        
        for (let i = 1; i <= numPages; i++) {
            updateProgress(20 + Math.floor((i / numPages) * 60), `Extracting page ${i} of ${numPages}...`);
            
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `Page ${i}\n${pageText}\n\n`;
        }
        
        updateProgress(85, 'Creating DOCX file...');
        
        // Create DOCX using JSZip
        const zip = new JSZip();
        
        // Create basic DOCX structure
        const docProps = zip.folder('docProps');
        docProps.file('app.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
                <Pages>${numPages}</Pages>
                <Company>DocxFlex by CosmoTools</Company>
            </Properties>`);
        
        // Create document content
        const word = zip.folder('word');
        
        // Create document.xml with content
        let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                <w:body>`;
        
        // Add text content
        const paragraphs = fullText.split('\n\n');
        paragraphs.forEach((para) => {
            if (para.trim()) {
                documentXml += `
                    <w:p>
                        <w:r>
                            <w:t>${escapeXml(para)}</w:t>
                        </w:r>
                    </w:p>`;
            }
        });
        
        documentXml += `
                </w:body>
            </w:document>`;
        
        word.file('document.xml', documentXml);
        
        // Add minimal required files
        zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
            <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                <Default Extension="xml" ContentType="application/xml"/>
                <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
            </Types>`);
        
        const _rels = zip.folder('_rels');
        _rels.file('.rels', `<?xml version="1.0" encoding="UTF-8"?>
            <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
            </Relationships>`);
        
        // Generate DOCX
        const docxBlob = await zip.generateAsync({ type: 'blob' });
        
        updateProgress(100, 'Downloading...');
        
        // Download the file
        const outputFileName = currentFile.name.replace(/\.pdf$/i, '.docx') || 'converted.docx';
        saveAs(docxBlob, outputFileName);
        
    } catch (error) {
        console.error('PDF to DOCX conversion error:', error);
        throw new Error('Failed to convert PDF to DOCX: ' + error.message);
    }
}

// DOCX to PDF Conversion
async function convertDocxToPdf() {
    updateProgress(10, 'Loading DOCX...');
    
    try {
        // Use mammoth to extract text from DOCX
        const result = await mammoth.extractRawText({ arrayBuffer: currentFileBuffer });
        const text = result.value;
        
        updateProgress(40, 'Extracted text from DOCX');
        
        // Create PDF using PDF-lib
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        // Split text into pages (roughly 2000 characters per page)
        const charsPerPage = 2000;
        const lines = text.split('\n');
        let pages = [];
        let currentPage = '';
        
        for (const line of lines) {
            if ((currentPage + line).length > charsPerPage) {
                pages.push(currentPage);
                currentPage = line + '\n';
            } else {
                currentPage += line + '\n';
            }
        }
        if (currentPage) {
            pages.push(currentPage);
        }
        
        // If no pages were created, create at least one
        if (pages.length === 0) {
            pages = [text || ' '];
        }
        
        updateProgress(60, `Creating ${pages.length} PDF pages...`);
        
        // Set font
        const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
        
        for (let i = 0; i < pages.length; i++) {
            updateProgress(60 + Math.floor((i / pages.length) * 30), `Adding page ${i + 1} of ${pages.length}...`);
            
            const page = pdfDoc.addPage([595, 842]); // A4 size
            const { width, height } = page.getSize();
            
            // Add text to page
            page.drawText(pages[i], {
                x: 50,
                y: height - 50,
                size: 11,
                font: font,
                lineHeight: 14,
                maxWidth: width - 100,
            });
            
            // Add page number
            page.drawText(`${i + 1}`, {
                x: width / 2,
                y: 30,
                size: 10,
                font: font,
            });
        }
        
        updateProgress(95, 'Finalizing PDF...');
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        updateProgress(100, 'Downloading...');
        
        // Download the file
        const outputFileName = currentFile.name.replace(/\.docx?$/i, '.pdf') || 'converted.pdf';
        saveAs(pdfBlob, outputFileName);
        
    } catch (error) {
        console.error('DOCX to PDF conversion error:', error);
        throw new Error('Failed to convert DOCX to PDF: ' + error.message);
    }
}

// Helper function to escape XML special characters
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

// --- Utilities ---

function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .animate-slideIn {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);

console.log('Script loaded successfully');
