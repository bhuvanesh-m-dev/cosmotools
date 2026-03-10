// --- State Management ---
let currentFile = null;
let conversionType = 'pdf-to-docx'; // 'pdf-to-docx' or 'docx-to-pdf'
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
const embedFonts = document.getElementById('embed-fonts');
const highQuality = document.getElementById('high-quality');

// --- Initialization ---

// Theme Logic
const savedTheme = localStorage.getItem('docflex-theme');

if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.classList.replace('fa-sun', 'fa-moon');
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    if (document.body.classList.contains('light-theme')) {
        localStorage.setItem('docflex-theme', 'light');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    } else {
        localStorage.setItem('docflex-theme', 'dark');
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
    fileInput.value = '';
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

function handleFile(file) {
    // Validate file type based on conversion type
    const isValid = validateFileType(file);
    
    if (!isValid) {
        alert(`Please upload a valid ${conversionType === 'pdf-to-docx' ? 'PDF' : 'DOCX/DOC'} file.`);
        return;
    }
    
    currentFile = file;
    
    // Update UI
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatSize(file.size);
    
    // Set appropriate icon
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    fileIcon.innerHTML = isPdf ? '<i class="fas fa-file-pdf"></i>' : '<i class="fas fa-file-word"></i>';
    
    fileInfo.classList.remove('hidden');
    conversionOptions.classList.remove('hidden');
    convertBtn.disabled = false;
}

function validateFileType(file) {
    const fileName = file.name.toLowerCase();
    
    if (conversionType === 'pdf-to-docx') {
        return file.type === 'application/pdf' || fileName.endsWith('.pdf');
    } else {
        return file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword' || 
               fileName.endsWith('.docx') || 
               fileName.endsWith('.doc');
    }
}

function clearFile() {
    currentFile = null;
    fileInfo.classList.add('hidden');
    conversionOptions.classList.add('hidden');
    convertBtn.disabled = true;
}

async function startConversion() {
    if (!currentFile || isConverting) return;
    
    isConverting = true;
    convertBtn.disabled = true;
    
    // Show loading modal
    loadingModal.classList.remove('hidden');
    loadingStatus.textContent = 'Converting...';
    loadingDetail.textContent = 'This may take a moment';
    
    // Simulate conversion progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            clearInterval(progressInterval);
        }
        loadingDetail.textContent = `Processing: ${Math.min(100, Math.floor(progress))}%`;
    }, 200);
    
    try {
        // Simulate conversion (replace with actual conversion library)
        await simulateConversion();
        
        clearInterval(progressInterval);
        loadingStatus.textContent = 'Complete!';
        loadingDetail.textContent = 'Preparing download...';
        
        // Simulate download
        setTimeout(() => {
            // Create fake download (replace with actual converted file)
            const convertedFileName = conversionType === 'pdf-to-docx' 
                ? currentFile.name.replace('.pdf', '.docx')
                : currentFile.name.replace(/\.docx?/, '.pdf');
            
            simulateDownload(convertedFileName);
            
            // Hide loading modal
            loadingModal.classList.add('hidden');
            isConverting = false;
            convertBtn.disabled = false;
            
            // Show success message
            showNotification('Conversion complete!', 'success');
        }, 1000);
        
    } catch (error) {
        clearInterval(progressInterval);
        console.error('Conversion error:', error);
        loadingModal.classList.add('hidden');
        isConverting = false;
        convertBtn.disabled = false;
        showNotification('Conversion failed. Please try again.', 'error');
    }
}

// Simulate conversion (replace with actual conversion library)
function simulateConversion() {
    return new Promise((resolve) => {
        setTimeout(resolve, 3000);
    });
}

// Simulate download (replace with actual file download)
function simulateDownload(filename) {
    // Create a simple text file as placeholder
    const content = `This is a simulated ${filename} file.\n\nOriginal file: ${currentFile.name}\nConversion type: ${conversionType}\nOptions:\n- Preserve Layout: ${preserveLayout?.checked || false}\n- Extract Images: ${extractImages?.checked || false}\n- Embed Fonts: ${embedFonts?.checked || false}\n- High Quality: ${highQuality?.checked || false}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename + '.txt'; // Add .txt for simulation
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 border-2 border-white p-4 font-mono text-sm animate-slideIn ${type === 'success' ? 'bg-white text-black' : 'bg-black text-white'}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
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