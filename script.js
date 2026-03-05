document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration & State ---
    const state = {
        data: "https://bhuvanesh-m-dev.github.io/cosmoencode",
        width: 400,
        height: 400,
        type: "canvas", // canvas is better for png download, svg for svg
        image: null,
        dotsOptions: {
            color: "#000000",
            type: "square" // square, dots, rounded, extra-rounded, classy, classy-rounded
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        cornersSquareOptions: {
            type: "square" // square, dot, extra-rounded
        },
        cornersDotOptions: {
            type: "square" // square, dot
        }
    };

    // Mapping for UI names to Library names
    const patternMap = {
        'Classic': 'square',
        'Bubble': 'dots',
        'Smooth': 'rounded',
        'Sharp': 'extra-rounded',
        'Elegant': 'classy',
        'Dots': 'classy-rounded'
    };

    const eyeMap = {
        'Classic': 'square',
        'Circle': 'dot',
        'Bubble': 'extra-rounded', // Using extra-rounded for outer, dot for inner usually looks best, but here we map 1:1 for simplicity or combine
        'Smooth': 'extra-rounded',
        'Elegant': 'square', // fallback
        'Dotted': 'dot'
    };
    
    // Refined Eye Mapping logic:
    // We will control cornersSquareOptions (Outer) and cornersDotOptions (Inner)
    // For simplicity in this UI, we map the selection to both, but 'Classic' might be Square/Square, 'Circle' might be Dot/Dot.
    
    const eyeStyles = {
        'Classic': { square: 'square', dot: 'square' },
        'Circle': { square: 'dot', dot: 'dot' },
        'Smooth': { square: 'extra-rounded', dot: 'dot' },
        'Sharp': { square: 'extra-rounded', dot: 'square' },
        'Elegant': { square: 'classy', dot: 'square' },
        'Dotted': { square: 'dot', dot: 'square' }
    };

    let qrCode = null;

    // --- DOM Elements ---
    const container = document.getElementById('qr-container');
    const input = document.getElementById('qr-input');
    const patternSelector = document.getElementById('pattern-selector');
    const eyeSelector = document.getElementById('eye-selector');
    const colorQr = document.getElementById('color-qr');
    const colorBg = document.getElementById('color-bg');
    const sizeSlider = document.getElementById('size-slider');
    const sizeDisplay = document.getElementById('size-display');
    const logoUpload = document.getElementById('logo-upload');
    const removeLogoBtn = document.getElementById('remove-logo');
    const embedTextarea = document.getElementById('embed-code');
    const charCount = document.getElementById('char-count');

    // --- Initialization ---

    function init() {
        renderSelectors();
        createQR();
        setupEventListeners();
        updateEmbedCode();
    }

    // --- Core QR Logic ---

    function createQR() {
        container.innerHTML = ''; // Clear previous
        
        // Clean up image if null
        const config = {
            width: state.width,
            height: state.height,
            type: "canvas", // We use canvas for rendering, but can export to SVG
            data: state.data,
            image: state.image,
            dotsOptions: state.dotsOptions,
            backgroundOptions: state.backgroundOptions,
            cornersSquareOptions: state.cornersSquareOptions,
            cornersDotOptions: state.cornersDotOptions,
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 10
            }
        };

        qrCode = new QRCodeStyling(config);
        qrCode.append(container);
        
        // Update char count
        charCount.textContent = `${state.data.length} chars`;
    }

    function updateQR() {
        if (!qrCode) return;
        
        qrCode.update({
            data: state.data,
            width: state.width,
            height: state.height,
            image: state.image,
            dotsOptions: state.dotsOptions,
            backgroundOptions: state.backgroundOptions,
            cornersSquareOptions: state.cornersSquareOptions,
            cornersDotOptions: state.cornersDotOptions
        });
        
        charCount.textContent = `${state.data.length} chars`;
        updateEmbedCode();
    }

    // --- UI Generation ---

    function renderSelectors() {
        // Patterns
        Object.keys(patternMap).forEach(key => {
            const val = patternMap[key];
            const btn = document.createElement('button');
            btn.className = `pattern-icon flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-200 hover:border-black bg-white ${state.dotsOptions.type === val ? 'active' : ''}`;
            btn.innerHTML = `
                <div class="w-8 h-8 mb-1 text-neutral-700">${getPatternSVG(val)}</div>
                <span class="text-[10px] font-medium text-neutral-600">${key}</span>
            `;
            btn.onclick = () => {
                state.dotsOptions.type = val;
                updateActiveClass(patternSelector, btn);
                updateQR();
            };
            patternSelector.appendChild(btn);
        });

        // Eyes
        Object.keys(eyeStyles).forEach(key => {
            const styles = eyeStyles[key];
            const btn = document.createElement('button');
            btn.className = `pattern-icon flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-200 hover:border-black bg-white ${state.cornersSquareOptions.type === styles.square ? 'active' : ''}`;
            btn.innerHTML = `
                <div class="w-8 h-8 mb-1 text-neutral-700">${getEyeSVG(styles.square)}</div>
                <span class="text-[10px] font-medium text-neutral-600">${key}</span>
            `;
            btn.onclick = () => {
                state.cornersSquareOptions.type = styles.square;
                state.cornersDotOptions.type = styles.dot;
                updateActiveClass(eyeSelector, btn);
                updateQR();
            };
            eyeSelector.appendChild(btn);
        });
    }

    function updateActiveClass(container, activeBtn) {
        Array.from(container.children).forEach(c => c.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // --- Event Listeners ---

    function setupEventListeners() {
        // Input
        input.addEventListener('input', (e) => {
            state.data = e.target.value || ' ';
            updateQR();
        });

        // Colors
        colorQr.addEventListener('input', (e) => {
            state.dotsOptions.color = e.target.value;
            document.getElementById('color-qr-hex').textContent = e.target.value;
            updateQR();
        });

        colorBg.addEventListener('input', (e) => {
            state.backgroundOptions.color = e.target.value;
            document.getElementById('color-bg-hex').textContent = e.target.value;
            updateQR();
        });

        // Size
        sizeSlider.addEventListener('input', (e) => {
            state.width = parseInt(e.target.value);
            state.height = parseInt(e.target.value);
            sizeDisplay.textContent = `${e.target.value}px`;
            updateQR();
        });

        // Logo
        logoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    state.image = event.target.result;
                    removeLogoBtn.classList.remove('hidden');
                    updateQR();
                };
                reader.readAsDataURL(file);
            }
        });

        removeLogoBtn.addEventListener('click', () => {
            state.image = null;
            logoUpload.value = '';
            removeLogoBtn.classList.add('hidden');
            updateQR();
        });

        // Downloads
        document.getElementById('btn-download-png').addEventListener('click', () => {
            qrCode.download({ name: 'cosmoencode-qr', extension: 'png' });
        });

        document.getElementById('btn-download-svg').addEventListener('click', () => {
            qrCode.download({ name: 'cosmoencode-qr', extension: 'svg' });
        });

        // Copy Embed
        document.getElementById('btn-copy-embed').addEventListener('click', () => {
            embedTextarea.select();
            document.execCommand('copy');
            const btn = document.getElementById('btn-copy-embed');
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = originalText, 2000);
        });
    }

    // --- Helpers ---

    function updateEmbedCode() {
        // Generate a data URL for the embed (simplified approach)
        // In a real scenario, we might upload the image. 
        // Here we provide a placeholder that points to the current state (conceptually)
        // Since we can't easily generate a static URL without a backend, 
        // we will generate an <img> tag with a placeholder src or instructions.
        
        // Actually, we can generate a Data URL from the canvas if we wanted, but it might be huge.
        // Better to provide the "Direct Link" instruction as we did in UI.
        
        const code = `<!-- CosmoEncode QR Code -->
<div style="text-align: center;">
    <img src="YOUR_GENERATED_IMAGE_URL_HERE" alt="QR Code" width="${state.width}" height="${state.height}" />
    <p style="font-size: 12px; color: #666;">Scan to visit</p>
</div>`;
        embedTextarea.value = code;
    }

    // SVG Icons for UI
    function getPatternSVG(type) {
        // Simple SVG representations
        const svgs = {
            'square': `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
            'dots': `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9"/></svg>`,
            'rounded': `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="6"/></svg>`,
            'extra-rounded': `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="10"/></svg>`,
            'classy': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h18v18h-18z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="5"/></svg>`,
            'classy-rounded': `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" opacity="0.3"/><circle cx="12" cy="12" r="5"/></svg>`
        };
        return svgs[type] || svgs['square'];
    }

    function getEyeSVG(type) {
        const svgs = {
            'square': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3h8v8h-8z M13 3h8v8h-8z M3 13h8v8h-8z"/></svg>`,
            'dot': `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="7" cy="7" r="4"/><circle cx="17" cy="7" r="4"/><circle cx="7" cy="17" r="4"/></svg>`,
            'extra-rounded': `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="9" height="9" rx="3"/><rect x="13" y="2" width="9" height="9" rx="3"/><rect x="2" y="13" width="9" height="9" rx="3"/></svg>`,
            'classy': `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 2h10v10h-10z M12 2h10v10h-10z M2 12h10v10h-10z" opacity="0.7"/></svg>`
        };
        return svgs[type] || svgs['square'];
    }

    // Run
    init();
});
