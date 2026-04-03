// Load code from URL parameters on page load (for Share feature)
window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('html')) document.getElementById('htmlCode').value = decodeURIComponent(params.get('html') || '');
    if (params.has('css'))  document.getElementById('cssCode').value  = decodeURIComponent(params.get('css') || '');
    if (params.has('js'))   document.getElementById('jsCode').value   = decodeURIComponent(params.get('js') || '');
};

function launchPreview() {
    const html = document.getElementById('htmlCode').value.trim();
    const css  = document.getElementById('cssCode').value.trim();
    const js   = document.getElementById('jsCode').value.trim();

    if (!html && !css && !js) {
        alert("Please enter some code before launching the preview.");
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

async function saveAsZip() {
    const html = document.getElementById('htmlCode').value || '';
    const css  = document.getElementById('cssCode').value  || '';
    const js   = document.getElementById('jsCode').value   || '';

    if (!html && !css && !js) {
        alert("Nothing to save. Please add some code.");
        return;
    }

    const zip = new JSZip();
    
    zip.file("index.html", html || "<!-- Empty HTML -->");
    zip.file("style.css",  css  || "/* Empty CSS */");
    zip.file("script.js",  js   || "// Empty JavaScript");

    // Project branding files
    zip.file("README.md", `# My Web Project\n\nCreated with **Viewer by CosmoTools**\n\nhttps://bhuvanesh-m-dev.github.io/cosmotools/`);
    zip.file("cosmotools-info.txt", `Generated using Viewer by CosmoTools\nDate: ${new Date().toISOString()}\nRepository: https://github.com/bhuvanesh-m-dev/cosmotools`);

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "my-web-project.zip";
    link.click();
}

function shareCode() {
    const html = encodeURIComponent(document.getElementById('htmlCode').value || '');
    const css  = encodeURIComponent(document.getElementById('cssCode').value || '');
    const js   = encodeURIComponent(document.getElementById('jsCode').value || '');

    const shareURL = `${window.location.origin}${window.location.pathname}?html=${html}&css=${css}&js=${js}`;

    navigator.clipboard.writeText(shareURL).then(() => {
        alert("Share link copied to clipboard!\n\nAnyone with this link can open the same code in Viewer by CosmoTools.");
    }).catch(() => {
        prompt("Copy this share link:", shareURL);
    });
}

function clearAll() {
    if (confirm("Clear all code fields?")) {
        document.getElementById('htmlCode').value = '';
        document.getElementById('cssCode').value = '';
        document.getElementById('jsCode').value = '';
    }
}