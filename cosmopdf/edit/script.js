// --- State Management ---
let currentFile = null; // Single File object
let originalPdfBytes = null; // Original file bytes
let pageState = []; // Array of { id, pageIndex, rotation, objectUrl, selected }
let draggedPageId = null;

// --- DOM Elements ---
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileInfo = document.getElementById('file-info');
const fileNameEl = document.getElementById('file-name');
const fileSizeEl = document.getElementById('file-size');
const totalPagesEl = document.getElementById('total-pages');
const clearFileBtn = document.getElementById('clear-file-btn');
const pagesGrid = document.getElementById('pages-grid');
const loading = document.getElementById('loading');
const editorStatus = document.getElementById('editor-status');
const splitControls = document.getElementById('split-controls');
const globalActions = document.getElementById('global-actions');
const pageRangeInput = document.getElementById('page-range-input');
const selectedCountEl = document.getElementById('selected-count');
const downloadSelectedBtn = document.getElementById('download-selected-btn');
const savePdfBtn = document.getElementById('save-pdf-btn');
const themeToggleBtn = document.getElementById('theme-toggle');

// --- Initialization ---

// PDF.js Worker
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;
}

// Theme Logic
const savedTheme = localStorage.getItem('theme');
const themeIcon = document.getElementById('theme-icon');

if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.classList.replace('fa-sun', 'fa-moon');
    themeIcon.classList.replace('text-yellow-500', 'text-blue-600');
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        localStorage.setItem('theme', 'light');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        themeIcon.classList.replace('text-yellow-500', 'text-blue-600');
    } else {
        localStorage.setItem('theme', 'dark');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        themeIcon.classList.replace('text-blue-600', 'text-yellow-500');
    }
});

// --- Event Listeners ---

// Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
});

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
    fileInput.value = ''; // Reset
});

clearFileBtn.addEventListener('click', clearFile);

document.getElementById('rotate-all-btn').addEventListener('click', () => {
    pageState.forEach(p => p.rotation = (p.rotation + 90) % 360);
    renderPages();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (currentFile) processFile(currentFile);
});

savePdfBtn.addEventListener('click', () => savePdf(pageState.map(p => p.pageIndex)));

downloadSelectedBtn.addEventListener('click', () => {
    const selectedPages = pageState.filter(p => p.selected);
    if (selectedPages.length === 0) return;
    savePdf(selectedPages.map(p => p.pageIndex), 'selected-pages.pdf');
});

document.getElementById('select-all-btn').addEventListener('click', () => {
    pageState.forEach(p => p.selected = true);
    updateSelectionUI();
    renderPages();
});

document.getElementById('clear-selection-btn').addEventListener('click', () => {
    pageState.forEach(p => p.selected = false);
    pageRangeInput.value = '';
    updateSelectionUI();
    renderPages();
});

pageRangeInput.addEventListener('input', (e) => {
    parsePageRange(e.target.value);
});

// --- Core Functions ---

function handleFile(file) {
    if (!file.type === 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please upload a PDF file only.');
        return;
    }
    
    currentFile = file;
    originalPdfBytes = null; // Will be set in processFile
    
    // Update UI
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatSize(file.size);
    fileInfo.classList.remove('hidden');
    splitControls.classList.remove('hidden');
    globalActions.classList.remove('hidden');
    savePdfBtn.disabled = false;
    
    processFile(file);
}

function clearFile() {
    currentFile = null;
    originalPdfBytes = null;
    pageState = [];
    
    fileInfo.classList.add('hidden');
    splitControls.classList.add('hidden');
    globalActions.classList.add('hidden');
    savePdfBtn.disabled = true;
    pageRangeInput.value = '';
    
    renderPages();
    editorStatus.textContent = 'No file loaded';
}

async function processFile(file) {
    loading.classList.remove('hidden');
    loading.classList.add('flex');
    
    try {
        // Store original bytes
        originalPdfBytes = await file.arrayBuffer();
        
        // Use PDF.js to get thumbnails
        const pdf = await pdfjsLib.getDocument({ data: originalPdfBytes }).promise;
        totalPagesEl.textContent = pdf.numPages;
        editorStatus.textContent = `${pdf.numPages} pages loaded`;
        
        pageState = [];
        
        for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const viewport = page.getViewport({ scale: 0.4 }); // Thumbnail scale
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const objectUrl = canvas.toDataURL('image/jpeg', 0.8);

            pageState.push({
                id: `page-${i}`,
                pageIndex: i, // 0-based index for pdf-lib
                rotation: 0,
                objectUrl: objectUrl,
                selected: false
            });
        }
        
        renderPages();
        updateSelectionUI();
        
    } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing PDF. It might be corrupted or encrypted.");
        clearFile();
    } finally {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

function renderPages() {
    pagesGrid.innerHTML = '';

    if (pageState.length === 0) {
        pagesGrid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                <i class="fas fa-th-large text-4xl mb-4 opacity-20"></i>
                <p>Upload a PDF to start editing</p>
            </div>`;
        return;
    }

    pageState.forEach((page, index) => {
        const el = document.createElement('div');
        el.className = `page-card rounded-lg p-2 flex flex-col gap-2 relative group cursor-move ${page.selected ? 'selected' : ''}`;
        el.draggable = true;
        el.dataset.id = page.id;
        el.dataset.index = index;

        // Drag Events
        el.addEventListener('dragstart', handleDragStart);
        el.addEventListener('dragenter', handleDragEnter);
        el.addEventListener('dragover', handleDragOver);
        el.addEventListener('dragleave', handleDragLeave);
        el.addEventListener('drop', handleDrop);
        el.addEventListener('dragend', handleDragEnd);
        
        // Click to select
        el.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                page.selected = !page.selected;
                updateSelectionUI();
                renderPages();
            }
        });

        // Image Container
        const imgContainer = document.createElement('div');
        imgContainer.className = 'bg-gray-100 dark:bg-gray-800 rounded overflow-hidden relative aspect-[3/4] flex items-center justify-center';
        
        const img = document.createElement('img');
        img.src = page.objectUrl;
        img.className = 'max-w-full max-h-full object-contain shadow-sm transition-transform duration-300';
        img.style.transform = `rotate(${page.rotation}deg)`;
        
        imgContainer.appendChild(img);

        // Selection Indicator
        if (page.selected) {
            const checkIndicator = document.createElement('div');
            checkIndicator.className = 'absolute top-2 left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs';
            checkIndicator.innerHTML = '<i class="fas fa-check"></i>';
            imgContainer.appendChild(checkIndicator);
        }

        // Controls Overlay
        const controls = document.createElement('div');
        controls.className = 'absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm';
        controls.innerHTML = `
            <button class="w-8 h-8 rounded-full bg-white text-black hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors" title="Rotate Left" onclick="rotatePage('${page.id}', -90)">
                <i class="fas fa-undo-alt text-xs"></i>
            </button>
            <button class="w-8 h-8 rounded-full bg-white text-black hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors" title="Rotate Right" onclick="rotatePage('${page.id}', 90)">
                <i class="fas fa-redo-alt text-xs"></i>
            </button>
        `;
        imgContainer.appendChild(controls);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'flex justify-between items-center text-xs text-gray-500 font-mono';
        footer.innerHTML = `
            <span>Page ${page.pageIndex + 1}</span>
            <span>${page.rotation}°</span>
        `;

        el.appendChild(imgContainer);
        el.appendChild(footer);
        pagesGrid.appendChild(el);
    });
}

// --- Editor Actions ---

window.rotatePage = (id, deg) => {
    const page = pageState.find(p => p.id === id);
    if (page) {
        page.rotation = (page.rotation + deg) % 360;
        if (page.rotation < 0) page.rotation += 360;
        renderPages();
    }
};

// --- Drag and Drop Logic (Grid) ---

function handleDragStart(e) {
    draggedPageId = this.dataset.id;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this.dataset.id !== draggedPageId) {
        this.classList.add('border-blue-500', 'border-dashed');
    }
}

function handleDragLeave(e) {
    this.classList.remove('border-blue-500', 'border-dashed');
}

function handleDrop(e) {
    e.stopPropagation();
    const targetId = this.dataset.id;

    if (draggedPageId !== targetId) {
        const fromIndex = pageState.findIndex(p => p.id === draggedPageId);
        const toIndex = pageState.findIndex(p => p.id === targetId);

        // Reorder
        const item = pageState.splice(fromIndex, 1)[0];
        pageState.splice(toIndex, 0, item);
        
        renderPages();
    }
    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.page-card').forEach(card => {
        card.classList.remove('border-blue-500', 'border-dashed');
    });
}

// --- Page Range Parsing ---

function parsePageRange(input) {
    // Reset all selections first
    pageState.forEach(p => p.selected = false);
    
    if (!input.trim()) {
        updateSelectionUI();
        renderPages();
        return;
    }

    const pages = new Set();
    const parts = input.split(',');

    for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
            const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
            if (!isNaN(start) && !isNaN(end)) {
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= pageState.length) pages.add(i - 1); // Convert to 0-based
                }
            }
        } else {
            const num = parseInt(trimmed);
            if (!isNaN(num) && num >= 1 && num <= pageState.length) {
                pages.add(num - 1); // Convert to 0-based
            }
        }
    }

    pages.forEach(index => {
        if (pageState[index]) pageState[index].selected = true;
    });

    updateSelectionUI();
    renderPages();
}

function updateSelectionUI() {
    const selectedCount = pageState.filter(p => p.selected).length;
    selectedCountEl.textContent = selectedCount;
    downloadSelectedBtn.disabled = selectedCount === 0;
    
    // Update input to reflect current selection if it was clicked
    const selectedIndices = pageState
        .map((p, idx) => p.selected ? idx + 1 : null)
        .filter(n => n !== null);
    
    // Only update input if user isn't currently typing (simple heuristic)
    if (document.activeElement !== pageRangeInput) {
        pageRangeInput.value = selectedIndices.join(', ');
    }
}

// --- Save Logic ---

async function savePdf(pageIndices, filename = null) {
    if (!originalPdfBytes || pageIndices.length === 0) return;

    loading.classList.remove('hidden');
    loading.classList.add('flex');

    try {
        const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
        const newPdf = await PDFLib.PDFDocument.create();

        for (const pageIndex of pageIndices) {
            const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageIndex]);
            
            // Apply rotation from pageState
            const state = pageState.find(p => p.pageIndex === pageIndex);
            if (state && state.rotation !== 0) {
                const originalRotation = copiedPage.getRotation().angle;
                copiedPage.setRotation(PDFLib.degrees(originalRotation + state.rotation));
            }
            
            newPdf.addPage(copiedPage);
        }

        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `edited-${currentFile.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error(error);
        alert("Error saving PDF: " + error.message);
    } finally {
        loading.classList.add('hidden');
        loading.classList.remove('flex');
    }
}

// --- Utilities ---

function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}