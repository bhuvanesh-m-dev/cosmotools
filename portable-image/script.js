// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

// State management
let currentPDF = null;
let currentImages = [];
let currentImageData = null;
let activeTool = null;

// DOM Elements
const pdfToImageTool = document.getElementById('pdf-to-image-tool');
const imageToPdfTool = document.getElementById('image-to-pdf-tool');
const downloadTool = document.getElementById('download-tool');
const toolContent = document.getElementById('tool-content');
const activeToolDisplay = document.querySelector('#active-tool .font-mono');
const imageFormat = document.getElementById('image-format');
const imageQuality = document.getElementById('image-quality');
const qualityValue = document.getElementById('quality-value');

// Notification function
function showNotification(message, isError = false) {
    const notifications = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification bw-border font-mono`;
    notification.style.padding = '1rem';
    notification.style.background = isError ? 'white' : 'black';
    notification.style.color = isError ? 'black' : 'white';
    notification.style.border = '2px solid white';
    notification.innerHTML = message;
    
    notifications.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Update quality display
imageQuality.addEventListener('input', (e) => {
    const value = Math.round(e.target.value * 100);
    qualityValue.textContent = `${value}%`;
});

// PDF to Image Tool
pdfToImageTool.addEventListener('click', () => {
    activeTool = 'pdf-to-image';
    activeToolDisplay.innerHTML = '└ ACTIVE TOOL: PDF TO IMAGE CONVERTER ┘';
    
    toolContent.innerHTML = `
        <div class="upload-area bw-border" style="padding: 2rem; text-align: center; cursor: pointer;" id="pdf-upload-area">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
            <p class="font-mono">Click or drag PDF here</p>
            <p style="font-size: 0.875rem; margin-top: 1rem; opacity: 0.7;">Maximum size: 50MB</p>
            <input type="file" id="pdf-upload" accept=".pdf" style="display: none;">
        </div>
        <div id="pdf-preview" style="margin-top: 2rem;"></div>
        <div id="pdf-controls" style="margin-top: 1rem; display: none;">
            <button id="convert-pdf-btn" class="bw-hover font-mono" style="padding: 0.75rem 1.5rem; background: transparent; color: white; border: 2px solid white; cursor: pointer; margin-right: 1rem;">
                CONVERT ALL PAGES →
            </button>
            <button id="clear-pdf-btn" class="bw-hover font-mono" style="padding: 0.75rem 1.5rem; background: transparent; color: white; border: 2px solid white; cursor: pointer;">
                CLEAR →
            </button>
        </div>
    `;
    
    const pdfUpload = document.getElementById('pdf-upload');
    const pdfUploadArea = document.getElementById('pdf-upload-area');
    const pdfPreview = document.getElementById('pdf-preview');
    const pdfControls = document.getElementById('pdf-controls');
    
    pdfUploadArea.addEventListener('click', () => pdfUpload.click());
    
    pdfUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            showNotification('Please select a valid PDF file', true);
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
            showNotification('File size exceeds 50MB limit', true);
            return;
        }
        
        showNotification('Loading PDF...');
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            currentPDF = pdf;
            
            // Show first page preview
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            
            pdfPreview.innerHTML = `
                <div class="bw-border" style="padding: 1rem;">
                    <p class="font-mono">PDF Loaded: ${file.name}</p>
                    <p class="font-mono">Pages: ${pdf.numPages}</p>
                    <div style="margin-top: 1rem;">
                        <img src="${canvas.toDataURL()}" alt="Preview" style="max-width: 100%; max-height: 200px; object-fit: contain;">
                    </div>
                </div>
            `;
            pdfControls.style.display = 'block';
            showNotification(`PDF loaded successfully! ${pdf.numPages} pages found.`);
        } catch (error) {
            console.error(error);
            showNotification('Failed to load PDF', true);
        }
    });
    
    // Drag and drop
    pdfUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        pdfUploadArea.classList.add('drag-over');
    });
    
    pdfUploadArea.addEventListener('dragleave', () => {
        pdfUploadArea.classList.remove('drag-over');
    });
    
    pdfUploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        pdfUploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            pdfUpload.files = e.dataTransfer.files;
            pdfUpload.dispatchEvent(new Event('change'));
        } else {
            showNotification('Please drop a PDF file', true);
        }
    });
    
    // Convert PDF button
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'convert-pdf-btn' && currentPDF) {
            showNotification(`Converting ${currentPDF.numPages} pages...`);
            const images = [];
            
            for (let i = 1; i <= currentPDF.numPages; i++) {
                const page = await currentPDF.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const imageData = canvas.toDataURL();
                images.push(imageData);
            }
            
            currentImages = images;
            currentImageData = images[0];
            
            // Display all pages
            pdfPreview.innerHTML += `
                <div class="bw-border" style="margin-top: 1rem; padding: 1rem;">
                    <p class="font-mono">Converted Pages:</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                        ${images.map((img, idx) => `
                            <div>
                                <img src="${img}" alt="Page ${idx + 1}" style="width: 100%; border: 2px solid white;">
                                <p class="font-mono" style="text-align: center; margin-top: 0.5rem;">Page ${idx + 1}</p>
                            </div>
                        `).join('')}
                    </div>
                    <button id="download-all-images" class="bw-hover font-mono" style="margin-top: 1rem; padding: 0.5rem 1rem; background: transparent; color: white; border: 2px solid white; cursor: pointer;">
                        DOWNLOAD ALL AS ZIP (COMING SOON) →
                    </button>
                </div>
            `;
            
            showNotification(`Converted ${currentPDF.numPages} pages to images! Use Download Tool to save individual images.`);
        }
        
        if (e.target.id === 'clear-pdf-btn') {
            currentPDF = null;
            currentImages = [];
            currentImageData = null;
            pdfPreview.innerHTML = '';
            pdfControls.style.display = 'none';
            showNotification('Cleared PDF data');
        }
    });
});

// Image to PDF Tool
imageToPdfTool.addEventListener('click', () => {
    activeTool = 'image-to-pdf';
    activeToolDisplay.innerHTML = '└ ACTIVE TOOL: IMAGE TO PDF CONVERTER ┘';
    
    toolContent.innerHTML = `
        <div class="upload-area bw-border" style="padding: 2rem; text-align: center; cursor: pointer;" id="image-upload-area">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
            <p class="font-mono">Click to select images</p>
            <p style="font-size: 0.875rem; margin-top: 1rem; opacity: 0.7;">Supports PNG, JPEG, WebP, BMP</p>
            <input type="file" id="image-upload" accept="image/*" multiple style="display: none;">
        </div>
        <div id="image-preview-list" style="margin-top: 2rem;"></div>
        <div id="image-to-pdf-controls" style="margin-top: 1rem; display: none;">
            <button id="create-pdf-btn" class="bw-hover font-mono" style="padding: 0.75rem 1.5rem; background: transparent; color: white; border: 2px solid white; cursor: pointer; margin-right: 1rem;">
                CREATE PDF →
            </button>
            <button id="clear-images-btn" class="bw-hover font-mono" style="padding: 0.75rem 1.5rem; background: transparent; color: white; border: 2px solid white; cursor: pointer;">
                CLEAR ALL →
            </button>
        </div>
    `;
    
    const imageUpload = document.getElementById('image-upload');
    const imageUploadArea = document.getElementById('image-upload-area');
    const imagePreviewList = document.getElementById('image-preview-list');
    const imageToPdfControls = document.getElementById('image-to-pdf-controls');
    
    imageUploadArea.addEventListener('click', () => imageUpload.click());
    
    imageUpload.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        showNotification(`Loading ${files.length} images...`);
        const images = [];
        
        for (const file of files) {
            const reader = new FileReader();
            const imageData = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });
            images.push(imageData);
        }
        
        currentImages = images;
        currentImageData = images[0];
        
        // Display image previews
        imagePreviewList.innerHTML = `
            <div class="bw-border" style="padding: 1rem;">
                <p class="font-mono">Selected Images: ${images.length}</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;">
                    ${images.map((img, idx) => `
                        <div>
                            <img src="${img}" alt="Image ${idx + 1}" style="width: 100%; border: 2px solid white;">
                            <p class="font-mono" style="text-align: center; margin-top: 0.5rem;">Image ${idx + 1}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        imageToPdfControls.style.display = 'block';
        showNotification(`${images.length} images loaded! Ready to create PDF.`);
    });
    
    // Create PDF button
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'create-pdf-btn' && currentImages && currentImages.length > 0) {
            showNotification('Creating PDF...');
            const { jsPDF } = window.jspdf;
            
            try {
                const firstImg = new Image();
                firstImg.src = currentImages[0];
                
                firstImg.onload = async () => {
                    const pdf = new jsPDF({
                        orientation: firstImg.width > firstImg.height ? 'landscape' : 'portrait',
                        unit: 'px',
                        format: [firstImg.width, firstImg.height]
                    });
                    
                    pdf.addImage(currentImages[0], 'PNG', 0, 0, firstImg.width, firstImg.height);
                    
                    for (let i = 1; i < currentImages.length; i++) {
                        pdf.addPage();
                        const img = new Image();
                        img.src = currentImages[i];
                        await new Promise((resolve) => {
                            img.onload = () => {
                                pdf.addImage(currentImages[i], 'PNG', 0, 0, img.width, img.height);
                                resolve();
                            };
                        });
                    }
                    
                    pdf.save('converted-images.pdf');
                    showNotification('PDF created and downloaded successfully!');
                };
            } catch (error) {
                console.error(error);
                showNotification('Failed to create PDF', true);
            }
        }
        
        if (e.target.id === 'clear-images-btn') {
            currentImages = [];
            currentImageData = null;
            imagePreviewList.innerHTML = '';
            imageToPdfControls.style.display = 'none';
            showNotification('Cleared all images');
        }
    });
});

// Download Tool
downloadTool.addEventListener('click', () => {
    activeTool = 'download';
    activeToolDisplay.innerHTML = '└ ACTIVE TOOL: IMAGE DOWNLOADER ┘';
    
    toolContent.innerHTML = `
        <div id="download-content">
            ${currentImageData ? `
                <div style="text-align: center;">
                    <img src="${currentImageData}" alt="Current Image" class="preview-image" style="max-width: 100%; max-height: 400px; border: 2px solid white; margin-bottom: 1rem;">
                    <button id="download-current-btn" class="bw-hover font-mono" style="padding: 0.75rem 1.5rem; background: transparent; color: white; border: 2px solid white; cursor: pointer;">
                        DOWNLOAD CURRENT IMAGE →
                    </button>
                </div>
            ` : `
                <div style="text-align: center; padding: 3rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🖼️</div>
                    <p class="font-mono">No image available</p>
                    <p style="margin-top: 1rem; opacity: 0.7;">Convert a PDF to images or upload images first</p>
                </div>
            `}
            
            ${currentImages && currentImages.length > 1 ? `
                <div class="bw-border" style="margin-top: 2rem; padding: 1rem;">
                    <p class="font-mono">All Images (${currentImages.length} total)</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; margin-top: 1rem; max-height: 300px; overflow-y: auto;">
                        ${currentImages.map((img, idx) => `
                            <div style="cursor: pointer;" onclick="window.selectImage(${idx})">
                                <img src="${img}" alt="Image ${idx + 1}" style="width: 100%; border: 2px solid white;">
                                <p class="font-mono" style="text-align: center; font-size: 0.75rem; margin-top: 0.25rem;">${idx + 1}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Add global function for image selection
    window.selectImage = (index) => {
        if (currentImages && currentImages[index]) {
            currentImageData = currentImages[index];
            const downloadContent = document.getElementById('download-content');
            if (downloadContent) {
                downloadContent.innerHTML = `
                    <div style="text-align: center;">
                        <img src="${currentImageData}" alt="Selected Image" class="preview-image" style="max-width: 100%; max-height: 400px; border: 2px solid white; margin-bottom: 1rem;">
                        <button id="download-current-btn" class="bw-hover font-mono" style="padding: 0.75rem 1.5rem; background: transparent; color: white; border: 2px solid white; cursor: pointer;">
                            DOWNLOAD SELECTED IMAGE →
                        </button>
                    </div>
                    ${currentImages.length > 1 ? `
                        <div class="bw-border" style="margin-top: 2rem; padding: 1rem;">
                            <p class="font-mono">All Images (${currentImages.length} total)</p>
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem; margin-top: 1rem; max-height: 300px; overflow-y: auto;">
                                ${currentImages.map((img, idx) => `
                                    <div style="cursor: pointer;" onclick="window.selectImage(${idx})">
                                        <img src="${img}" alt="Image ${idx + 1}" style="width: 100%; border: 2px solid white; ${idx === index ? 'border-width: 4px;' : ''}">
                                        <p class="font-mono" style="text-align: center; font-size: 0.75rem; margin-top: 0.25rem;">${idx + 1}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                `;
            }
            showNotification(`Selected image ${index + 1}`);
        }
    };
    
    // Download button handler
    document.addEventListener('click', (e) => {
        if (e.target.id === 'download-current-btn' && currentImageData) {
            const format = imageFormat.value;
            const quality = parseFloat(imageQuality.value);
            
            const img = new Image();
            img.src = currentImageData;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                let mimeType = `image/${format}`;
                if (format === 'jpeg') mimeType = 'image/jpeg';
                
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `image.${format === 'jpeg' ? 'jpg' : format}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showNotification(`Image downloaded as ${format.toUpperCase()}`);
                }, mimeType, quality);
            };
        }
    });
});

// QR Code Generation
let qrCode = null;

function generateQRCode() {
    const qrContainer = document.getElementById('qr-container');
    if (!qrContainer) return;
    
    qrContainer.innerHTML = '';
    
    qrCode = new QRCode(qrContainer, {
        text: 'https://bhuvanesh-m-dev.github.io/cosmotools/portable-image',
        width: 150,
        height: 150,
        colorDark: '#ffffff',
        colorLight: '#000000',
        correctLevel: QRCode.CorrectLevel.M
    });
}

// Download QR Code
document.getElementById('download-qr-btn')?.addEventListener('click', () => {
    const qrCanvas = document.querySelector('#qr-container canvas');
    if (qrCanvas) {
        const link = document.createElement('a');
        link.download = 'cosmotools-qr.png';
        link.href = qrCanvas.toDataURL();
        link.click();
        showNotification('QR Code downloaded!');
    } else {
        showNotification('QR Code not ready', true);
    }
});

// Initialize
setTimeout(generateQRCode, 100);
showNotification('Welcome to CosmoTools Portable Image Studio! Select a tool to begin.');