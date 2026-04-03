// script.js
// Initialize floating particles
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}

// Load code from URL parameters
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
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
        showNotification('Please enter some code first', 'warning');
        return;
    }

    const fullHTML = `<!DOCTYPE html>
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

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

// Save as ZIP file
async function saveAsZip() {
    const html = document.getElementById('htmlCode').value || '';
    const css = document.getElementById('cssCode').value || '';
    const js = document.getElementById('jsCode').value || '';

    if (!html && !css && !js) {
        showNotification('Nothing to save. Add some code first.', 'warning');
        return;
    }

    const zip = new JSZip();
    
    zip.file('index.html', html || '<!-- Empty HTML -->');
    zip.file('style.css', css || '/* Empty CSS */');
    zip.file('script.js', js || '// Empty JavaScript');
    zip.file('README.md', `# My Web Project

Created with **Viewer by CosmoTools**

https://bhuvanesh-m-dev.github.io/cosmotools/`);
    zip.file('cosmotools-info.txt', `Generated using Viewer by CosmoTools
Date: ${new Date().toISOString()}
Repository: https://github.com/bhuvanesh-m-dev/cosmotools`);

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'my-web-project.zip';
    link.click();
    
    showNotification('Project exported successfully!', 'success');
}

// Share code via URL
function shareCode() {
    const html = encodeURIComponent(document.getElementById('htmlCode').value || '');
    const css = encodeURIComponent(document.getElementById('cssCode').value || '');
    const js = encodeURIComponent(document.getElementById('jsCode').value || '');

    const shareURL = `${window.location.origin}${window.location.pathname}?html=${html}&css=${css}&js=${js}`;

    navigator.clipboard.writeText(shareURL).then(() => {
        showNotification('Share link copied to clipboard!', 'success');
    }).catch(() => {
        prompt('Copy this share link:', shareURL);
    });
}

// Clear all editors
function clearAll() {
    if (confirm('Are you sure you want to clear all code? This cannot be undone.')) {
        document.getElementById('htmlCode').value = '';
        document.getElementById('cssCode').value = '';
        document.getElementById('jsCode').value = '';
        showNotification('All fields cleared', 'info');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Tab key support in textareas
function setupTabSupport() {
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
    createParticles();
    loadFromURL();
    setupTabSupport();
});