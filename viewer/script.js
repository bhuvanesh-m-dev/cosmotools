// script.js
// QR Code Generator Class (from CosmoEncode)
class QRGenerator {
    constructor() {
        this.qrCode = null;
        this.container = null;
    }

    init(container, config) {
        this.container = container;
        const finalConfig = {
            type: "canvas",
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 10
            },
            ...config
        };

        container.innerHTML = '';
        this.qrCode = new QRCodeStyling(finalConfig);
        this.qrCode.append(container);
    }

    update(config) {
        if (this.qrCode) this.qrCode.update(config);
    }

    download(name, extension) {
        if (this.qrCode) this.qrCode.download({ name, extension });
    }

    getDataUrl() {
        if (!this.container) return null;
        const canvas = this.container.querySelector('canvas');
        return canvas ? canvas.toDataURL() : null;
    }
}

// Global QR instance
let qrGenerator = null;

// 3D Tilt Effect
function initTilt() {
    const tiltElements = document.querySelectorAll('[data-tilt]');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// Editor glow effect
function initEditorGlow() {
    const editors = document.querySelectorAll('.editor-body');
    
    editors.forEach(editor => {
        editor.addEventListener('mousemove', (e) => {
            const rect = editor.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            editor.style.setProperty('--mouse-x', `${x}%`);
            editor.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

// Initialize QR Code
function initQR() {
    qrGenerator = new QRGenerator();
    updateQR();
    
    // Add listeners to editors for dynamic QR updates
    ['htmlCode', 'cssCode', 'jsCode'].forEach(id => {
        document.getElementById(id).addEventListener('input', debounce(updateQR, 500));
    });
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Update QR Code based on current code
function updateQR() {
    if (!qrGenerator) return;
    
    const html = document.getElementById('htmlCode').value || '';
    const css = document.getElementById('cssCode').value || '';
    const js = document.getElementById('jsCode').value || '';
    
    // Create a shareable URL containing the code
    const shareData = {
        html: encodeURIComponent(html),
        css: encodeURIComponent(css),
        js: encodeURIComponent(js)
    };
    
    // Build preview URL for QR code
    const baseUrl = window.location.origin + window.location.pathname;
    const previewUrl = `${baseUrl}?preview=true&html=${shareData.html}&css=${shareData.css}&js=${shareData.js}`;
    
    // Truncate if too long for QR (QR has ~3KB limit for version 40)
    let qrData = previewUrl;
    if (previewUrl.length > 2000) {
        // Fallback to a message if URL is too long
        qrData = baseUrl + '?code=too-long';
    }
    
    const style = document.getElementById('qr-style').value;
    const color = document.getElementById('qr-color').value;
    const bgColor = document.getElementById('qr-bg').value;
    
    const config = {
        width: 200,
        height: 200,
        data: qrData,
        dotsOptions: {
            color: color,
            type: style
        },
        backgroundOptions: {
            color: bgColor,
        },
        cornersSquareOptions: {
            type: style === 'dots' ? 'dot' : 'square'
        },
        cornersDotOptions: {
            type: 'square'
        }
    };
    
    if (!qrGenerator.qrCode) {
        qrGenerator.init(document.getElementById('qr-container'), config);
    } else {
        qrGenerator.update(config);
    }
}

// Download QR Code
function downloadQR(format) {
    if (!qrGenerator) return;
    
    const timestamp = new Date().toISOString().slice(0,10);
    qrGenerator.download(`cosmotools-qr-${timestamp}`, format);
    showNotification(`QR Code saved as ${format.toUpperCase()}`);
}

// Load from URL parameters (for Share as Code)
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    
    // Check if this is a preview-only mode
    if (params.has('preview') && params.get('preview') === 'true') {
        // Hide editors and show preview only
        document.querySelector('.editors-container').style.display = 'none';
        document.querySelector('.controls').style.display = 'none';
        document.querySelector('.qr-section').style.display = 'none';
        
        // Create preview container
        const previewContainer = document.createElement('div');
        previewContainer.className = 'preview-mode-container glass-card';
        previewContainer.innerHTML = `
            <div class="preview-header">
                <h2>Shared Preview</h2>
                <button onclick="window.location.href = window.location.pathname" class="btn btn-3d btn-secondary">
                    <div class="btn-face">
                        <span>Open Editor</span>
                    </div>
                </button>
            </div>
            <iframe id="previewFrame" style="width: 100%; height: 600px; border: none; border-radius: 12px; background: white;"></iframe>
        `;
        document.querySelector('.container').insertBefore(previewContainer, document.querySelector('.qr-section'));
        
        // Build and inject preview
        const html = decodeURIComponent(params.get('html') || '');
        const css = decodeURIComponent(params.get('css') || '');
        const js = decodeURIComponent(params.get('js') || '');
        
        const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;
        
        const blob = new Blob([fullHTML], { type: 'text/html' });
        document.getElementById('previewFrame').src = URL.createObjectURL(blob);
        
        return;
    }
    
    // Normal code loading
    if (params.has('html')) {
        document.getElementById('htmlCode').value = decodeURIComponent(params.get('html') || '');
    }
    if (params.has('css')) {
        document.getElementById('cssCode').value = decodeURIComponent(params.get('css') || '');
    }
    if (params.has('js')) {
        document.getElementById('jsCode').value = decodeURIComponent(params.get('js') || '');
    }
}

// Launch preview in new window
function launchPreview() {
    const html = document.getElementById('htmlCode').value.trim();
    const css = document.getElementById('cssCode').value.trim();
    const js = document.getElementById('jsCode').value.trim();

    if (!html && !css && !js) {
        showNotification('Enter code to preview', 'error');
        return;
    }

    const fullHTML = buildPreviewHTML(html, css, js);
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

// Build preview HTML
function buildPreviewHTML(html, css, js) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - CosmoTools</title>
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;
}

// Save as ZIP
async function saveAsZip() {
    const html = document.getElementById('htmlCode').value || '';
    const css = document.getElementById('cssCode').value || '';
    const js = document.getElementById('jsCode').value || '';

    if (!html && !css && !js) {
        showNotification('Nothing to save', 'error');
        return;
    }

    const zip = new JSZip();
    
    zip.file('index.html', html || '<!-- Empty -->');
    zip.file('style.css', css || '/* Empty */');
    zip.file('script.js', js || '// Empty');
    zip.file('README.md', `# Project\n\nCreated with CosmoTools Viewer`);
    zip.file('cosmotools.txt', `Generated: ${new Date().toISOString()}`);

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'project.zip';
    link.click();
    
    showNotification('Exported successfully');
}

// Share as Code - Shares editable code via URL
function shareAsCode() {
    const html = encodeURIComponent(document.getElementById('htmlCode').value || '');
    const css = encodeURIComponent(document.getElementById('cssCode').value || '');
    const js = encodeURIComponent(document.getElementById('jsCode').value || '');

    const shareURL = `${window.location.origin}${window.location.pathname}?html=${html}&css=${css}&js=${js}`;

    navigator.clipboard.writeText(shareURL).then(() => {
        showNotification('Code link copied! Recipients can edit this code.');
    }).catch(() => {
        prompt('Copy this code link:', shareURL);
    });
}

// Share as Preview - Shares view-only preview via URL
function shareAsPreview() {
    const html = encodeURIComponent(document.getElementById('htmlCode').value || '');
    const css = encodeURIComponent(document.getElementById('cssCode').value || '');
    const js = encodeURIComponent(document.getElementById('jsCode').value || '');

    const shareURL = `${window.location.origin}${window.location.pathname}?preview=true&html=${html}&css=${css}&js=${js}`;

    navigator.clipboard.writeText(shareURL).then(() => {
        showNotification('Preview link copied! Recipients see only the result.');
    }).catch(() => {
        prompt('Copy this preview link:', shareURL);
    });
}

// Clear all
function clearAll() {
    if (confirm('Clear all code?')) {
        document.getElementById('htmlCode').value = '';
        document.getElementById('cssCode').value = '';
        document.getElementById('jsCode').value = '';
        showNotification('Cleared all fields');
        updateQR();
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const container = document.getElementById('notifications');
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = message;
    
    container.appendChild(notif);
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100px)';
        setTimeout(() => notif.remove(), 400);
    }, 3000);
}

// Tab support
function initTabSupport() {
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
            }
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initTilt();
    initEditorGlow();
    initTabSupport();
    loadFromURL();
    initQR();
});
