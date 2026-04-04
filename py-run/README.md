<div align="center">

# 🐍 Py-Run

**A powerful, zero-backend, fully in-browser Python compiler powered by Pyodide.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Now-4ade80?style=for-the-badge&logo=vercel)](https://bhuvanesh-m-dev.github.io/cosmotools/py-run)
[![Powered by Pyodide](https://img.shields.io/badge/Powered_by-Pyodide-38bdf8?style=for-the-badge&logo=python&logoColor=white)](https://pyodide.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<img src="https://raw.githubusercontent.com/bhuvanesh-m-dev/cosmotools/refs/heads/main/py-run/img/preview-1.png" alt="Py-Run Interface Preview" width="800" style="border-radius: 8px; box-shadow: 0 8px 30px rgba(0,0,0,0.3); margin-top: 15px; margin-bottom: 15px;" />

</div>

## 🚀 Overview

**Py-Run** is a client-side Python development environment crafted by [CosmoTools](https://github.com/bhuvanesh-m-dev/cosmotools). By leveraging **WebAssembly (WASM)** and **Pyodide**, Py-Run executes Python 3.11 directly in the user's browser. It completely eliminates the need for expensive server-side compute, Docker sandboxes, or complex backend infrastructure.

It is designed with developers in mind, offering an integrated CodeMirror workspace, customizable themes, state persistence, and native package management.

## ✨ Key Features

- **⚡ Zero Backend Architecture**: Code execution happens entirely in the browser via Pyodide. Fast, secure, and infinitely scalable.
- **🖥️ Interactive Terminal**: Robust stdout/stderr routing with full support for interactive user `input()` via native browser prompts.
- **📦 Built-in Package Manager**: Install pure Python packages dynamically (e.g., `cosmotalker`) using the integrated `micropip` installer UI.
- **🔗 Advanced Sharing Mechanisms**:
  - **Share as Code**: Encodes the editor payload into a base64 URL. Link recipients can immediately view, edit, and run the code.
  - **Share as Run**: Generates a standalone, unbranded HTML execution environment. Perfect for sharing clean output logs with clients or peers.
- **🎨 Rich Editor Experience**: Powered by CodeMirror 5 with syntax highlighting, bracket matching, auto-formatting, syntax validation, and multiple professional themes (Dracula, Monokai, Nord, etc.).
- **💾 Local State Persistence**: Automatically caches uncompiled code and UI preferences (themes, font sizes, pane layouts) in `localStorage`.
- **📁 Local File I/O**: Instantly upload local `.py` files into the editor or download your workspace as `main.py`.

## 🏗️ Architecture & Technical Stack

| Technology | Usage |
| --- | --- |
| **HTML5 / CSS3** | Clean, responsive UI layout with CSS Variables for dynamic theming. |
| **Vanilla JS (ES6)** | Lightweight DOM manipulation and application lifecycle management. |
| **Pyodide (v0.25.0)** | Compiles the CPython interpreter to WebAssembly for native browser execution. |
| **CodeMirror 5** | High-performance text editor optimized for code editing. |

### How the JS-Python Bridge Works
Py-Run overrides standard Python builtins to route streams seamlessly to the browser DOM:
```python
# Concept implementation under the hood
import sys, builtins

class BrowserOutput:
    def write(self, s): js.appendOutputBridge(s, 'stdout')

sys.stdout = BrowserOutput()
```

## 🛠️ Local Setup & Development

Since Py-Run is a strictly static client-side application, setup is incredibly straightforward. No build steps, bundlers, or package managers are required.

### Prerequisites
- Any modern web browser.
- A local web server (Optional but recommended, to prevent strict CORS policies from blocking Pyodide WASM payloads).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/bhuvanesh-m-dev/cosmotools.git
   cd cosmotools/py-run
   ```
2. Serve the directory locally. For example, using Python's built-in HTTP server:
   ```bash
   python3 -m http.server 8000
   ```
3. Navigate to `http://localhost:8000` in your web browser.

## 📂 Project Structure

```text
py-run/
├── index.html       # Application layout and DOM structure
├── script.js        # Core logic: Pyodide initialization, editor config, I/O bridging
├── share.js         # Base64 encoding logic and standalone runner page generation
├── shared-run.js    # Unbranded Pyodide execution script for "Share as Run" URLs
├── style.css        # UI components, flexbox layouts, and toolbars
└── themes.css       # Dynamic CSS variables for UI and CodeMirror themes
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <b>Developed with ❤️ by <a href="https://github.com/bhuvanesh-m-dev">CosmoTools</a></b><br>
  <sub>Turning browsers into compilers.</sub>
</div>


<p align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="Header Banner">
</p>

<h3 align="center">
    🌌 You are my &nbsp;
    <a href="https://github.com/bhuvanesh-m-dev">
    <img src="https://count.getloli.com/@bhuvanesh-m-dev?name=bhuvanesh-m-dev&theme=ai-1&padding=13&offset=0&align=top&scale=1&pixelated=1&darkmode=auto" alt="bhuvanesh-m-dev" />
    </a>
    &nbsp; visitor. Welcome to my orbit.
</h3>

<p align="center">
  <img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%" alt="Header Banner">
</p>
