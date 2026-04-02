import { GoogleGenAI } from "@google/genai";
import JSZip from "jszip";
import LZString from "lz-string";
import Prism from "prismjs";

// --- State ---
let code = {
    html: `<div class="container">
  <h1>Hello, CosmoTools!</h1>
  <p>Start editing to see magic happen.</p>
  <button id="btn">Click Me</button>
</div>`,
    css: `.container {
  font-family: system-ui, -apple-system, sans-serif;
  text-align: center;
  padding: 2rem;
  background: #f0f4f8;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

h1 { color: #2d3748; }
p { color: #4a5568; }

button {
  background: #4299e1;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover {
  background: #3182ce;
}`,
    js: `document.getElementById('btn').addEventListener('click', () => {
  alert('Welcome to Viewer by CosmoTools!');
});`
};

let theme = "dark";
let selectedImage = null;
let isGenerating = false;

// --- Elements ---
const htmlEditor = document.getElementById("htmlEditor");
const cssEditor = document.getElementById("cssEditor");
const jsEditor = document.getElementById("jsEditor");
const htmlHighlight = document.getElementById("htmlHighlight");
const cssHighlight = document.getElementById("cssHighlight");
const jsHighlight = document.getElementById("jsHighlight");

const launchBtn = document.getElementById("launchBtn");
const zipBtn = document.getElementById("zipBtn");
const shareBtn = document.getElementById("shareBtn");
const shareText = document.getElementById("shareText");
const clearBtn = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");

const aiToggle = document.getElementById("aiToggle");
const aiDrawer = document.getElementById("aiDrawer");
const closeAi = document.getElementById("closeAi");
const overlay = document.getElementById("overlay");
const chatHistory = document.getElementById("chatHistory");
const emptyChat = document.getElementById("emptyChat");
const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const removeImg = document.getElementById("removeImg");

// --- Initialization ---
function init() {
    // Lucide icons
    lucide.createIcons();

    // Load from URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        try {
            const decompressed = LZString.decompressFromEncodedURIComponent(hash);
            if (decompressed) {
                const parsed = JSON.parse(decompressed);
                if (parsed.html !== undefined) code = parsed;
            }
        } catch (e) {
            console.error("Failed to parse shared code", e);
        }
    } else {
        const saved = localStorage.getItem("cosmo_viewer_code");
        if (saved) {
            try {
                code = JSON.parse(saved);
            } catch (e) {
                console.error("Failed to load saved code", e);
            }
        }
    }

    // Set initial values
    htmlEditor.value = code.html;
    cssEditor.value = code.css;
    jsEditor.value = code.js;

    updateHighlighting();
}

// --- Highlighting ---
function updateHighlighting() {
    htmlHighlight.textContent = htmlEditor.value;
    cssHighlight.textContent = cssEditor.value;
    jsHighlight.textContent = jsEditor.value;
    
    Prism.highlightElement(htmlHighlight);
    Prism.highlightElement(cssHighlight);
    Prism.highlightElement(jsHighlight);
    
    localStorage.setItem("cosmo_viewer_code", JSON.stringify(code));
}

// --- Event Listeners ---
htmlEditor.addEventListener("input", (e) => {
    code.html = e.target.value;
    updateHighlighting();
});

cssEditor.addEventListener("input", (e) => {
    code.css = e.target.value;
    updateHighlighting();
});

jsEditor.addEventListener("input", (e) => {
    code.js = e.target.value;
    updateHighlighting();
});

// Sync scrolling
[htmlEditor, cssEditor, jsEditor].forEach((editor, i) => {
    const highlight = [htmlHighlight, cssHighlight, jsHighlight][i].parentElement;
    editor.addEventListener("scroll", () => {
        highlight.scrollTop = editor.scrollTop;
        highlight.scrollLeft = editor.scrollLeft;
    });
});

launchBtn.addEventListener("click", () => {
    const combined = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${code.css}</style>
        </head>
        <body>
          ${code.html}
          <script>${code.js}<\/script>
        </body>
      </html>
    `;
    const blob = new Blob([combined], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
});

zipBtn.addEventListener("click", async () => {
    const zip = new JSZip();
    zip.file("index.html", `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Web Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${code.html}
    <script src="script.js"></script>
</body>
</html>`);
    zip.file("style.css", code.css);
    zip.file("script.js", code.js);
    zip.file("README.md", `# My Web Project\n\nCreated with [Viewer by CosmoTools](https://github.com/bhuvanesh-m-dev/cosmotools)`);
    zip.file("cosmotools-info.txt", `Project: CosmoTools\nTool: Viewer\nRepository: https://github.com/bhuvanesh-m-dev/cosmotools`);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-web-project.zip";
    a.click();
    URL.revokeObjectURL(url);
});

shareBtn.addEventListener("click", () => {
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(code));
    const url = `${window.location.origin}${window.location.pathname}#${compressed}`;
    navigator.clipboard.writeText(url);
    shareText.textContent = "Copied!";
    setTimeout(() => {
        shareText.textContent = "Share";
    }, 2000);
});

clearBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all code?")) {
        code = { html: "", css: "", js: "" };
        htmlEditor.value = "";
        cssEditor.value = "";
        jsEditor.value = "";
        window.location.hash = "";
        updateHighlighting();
    }
});

themeToggle.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    document.body.classList.toggle("bg-[#0d1117]", theme === "dark");
    document.body.classList.toggle("bg-gray-50", theme === "light");
    document.body.classList.toggle("text-gray-200", theme === "dark");
    document.body.classList.toggle("text-gray-900", theme === "light");
    
    document.getElementById("sunIcon").classList.toggle("hidden", theme === "light");
    document.getElementById("moonIcon").classList.toggle("hidden", theme === "dark");
});

// --- AI Assistant ---
aiToggle.addEventListener("click", () => {
    aiDrawer.classList.remove("translate-x-full");
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.add("opacity-100"), 10);
});

const closeAiFunc = () => {
    aiDrawer.classList.add("translate-x-full");
    overlay.classList.remove("opacity-100");
    setTimeout(() => overlay.classList.add("hidden"), 300);
};

closeAi.addEventListener("click", closeAiFunc);
overlay.addEventListener("click", closeAiFunc);

uploadBtn.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            selectedImage = reader.result;
            previewImg.src = selectedImage;
            imagePreview.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }
});

removeImg.addEventListener("click", () => {
    selectedImage = null;
    imagePreview.classList.add("hidden");
});

async function handleSendMessage() {
    const text = aiInput.value.trim();
    if (!text && !selectedImage) return;

    emptyChat.classList.add("hidden");

    // Add user message
    addMessage("user", text, selectedImage);
    aiInput.value = "";
    const currentImage = selectedImage;
    selectedImage = null;
    imagePreview.classList.add("hidden");

    isGenerating = true;
    sendBtn.disabled = true;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const parts = [{ text: `You are CosmoAI, a helpful coding assistant for the "Viewer by CosmoTools" application. 
        The current code in the editor is:
        HTML: ${code.html}
        CSS: ${code.css}
        JS: ${code.js}
        
        Help the user with their request. If they ask to modify the code, provide the new code snippets.
        
        User request: ${text}` }];

        if (currentImage) {
            parts.push({
                inlineData: {
                    data: currentImage.split(",")[1],
                    mimeType: "image/png"
                }
            });
        }

        const response = await ai.models.generateContent({
            model: currentImage ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
            contents: [{ role: "user", parts }],
            config: {
                systemInstruction: "You are CosmoAI, an expert web developer. Be concise and helpful. Use markdown for code blocks.",
            }
        });

        addMessage("model", response.text || "I'm sorry, I couldn't generate a response.");
    } catch (error) {
        console.error("AI Error:", error);
        addMessage("model", "Error: Failed to connect to Gemini AI.");
    } finally {
        isGenerating = false;
        sendBtn.disabled = false;
    }
}

function addMessage(role, text, image = null) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex flex-col gap-2 max-w-[85%] ${role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`;
    
    if (image) {
        const img = document.createElement("img");
        img.src = image;
        img.className = "w-full rounded-lg border border-gray-700 shadow-sm";
        msgDiv.appendChild(img);
    }

    if (text) {
        const textDiv = document.createElement("div");
        textDiv.className = `px-4 py-2 rounded-2xl text-sm leading-relaxed ${
            role === "user" 
                ? "bg-indigo-600 text-white rounded-tr-none" 
                : theme === "dark" ? "bg-gray-800 text-gray-200 rounded-tl-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
        }`;
        textDiv.textContent = text;
        msgDiv.appendChild(textDiv);
    }

    chatHistory.appendChild(msgDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

sendBtn.addEventListener("click", handleSendMessage);
aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Start
init();
