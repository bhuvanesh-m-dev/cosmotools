const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileListContainer = document.getElementById('file-list-container');
const fileList = document.getElementById('file-list');
const fileCount = document.getElementById('file-count');
const mergeBtn = document.getElementById('merge-btn');
const clearAllBtn = document.getElementById('clear-all');
const loading = document.getElementById('loading');

let files = [];

// Drag and Drop Events
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
    handleFiles(e.dataTransfer.files);
});

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; // Reset input
});

function handleFiles(newFiles) {
    const validFiles = Array.from(newFiles).filter(file => file.type === 'application/pdf');
    
    if (validFiles.length === 0 && newFiles.length > 0) {
        alert('Please upload PDF files only.');
        return;
    }

    files = [...files, ...validFiles];
    updateUI();
}

function updateUI() {
    if (files.length > 0) {
        fileListContainer.classList.remove('hidden');
        dropZone.classList.add('border-gray-300');
        dropZone.classList.remove('border-red-500');
    } else {
        fileListContainer.classList.add('hidden');
    }

    fileCount.textContent = files.length;
    renderFileList();
}

function renderFileList() {
    fileList.innerHTML = '';
    
    files.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-item bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between';
        
        item.innerHTML = `
            <div class="flex items-center gap-4 overflow-hidden">
                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 text-red-600">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="min-w-0">
                    <p class="font-medium text-gray-900 truncate">${file.name}</p>
                    <p class="text-xs text-gray-500">${formatSize(file.size)}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="moveFile(${index}, -1)" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button onclick="moveFile(${index}, 1)" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition ${index === files.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === files.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button onclick="removeFile(${index})" class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition ml-2">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        fileList.appendChild(item);
    });
}

window.moveFile = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < files.length) {
        const temp = files[index];
        files[index] = files[newIndex];
        files[newIndex] = temp;
        updateUI();
    }
};

window.removeFile = (index) => {
    files.splice(index, 1);
    updateUI();
};

clearAllBtn.addEventListener('click', () => {
    files = [];
    updateUI();
});

function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

mergeBtn.addEventListener('click', async () => {
    if (files.length < 2) {
        alert('Please select at least 2 PDF files to merge.');
        return;
    }

    try {
        loading.classList.remove('hidden');
        
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        
        const pdfBytes = await mergedPdf.save();
        download(pdfBytes, "merged-document.pdf", "application/pdf");
        
    } catch (error) {
        console.error('Error merging PDFs:', error);
        alert('An error occurred while merging the PDFs. Please try again.');
    } finally {
        loading.classList.add('hidden');
    }
});