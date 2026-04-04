/* ═══════════════════════════════════════════════════
   PyFlow — Online Python Compiler
   script.js  |  Pyodide + CodeMirror, no backend
═══════════════════════════════════════════════════ */

"use strict";

/* ── DEFAULT CODE ── */
const DEFAULT_CODE = `# Welcome to PyFlow 🐍
# A beautiful, open-source online Python compiler
# Powered by Pyodide — runs entirely in your browser!

def greet(name):
    emoji = "🚀"
    print(f"Hello, {name}! {emoji}")
    return f"Welcome to PyFlow, {name}!"

names = ["World", "Python", "Open Source"]
for name in names:
    greet(name)

# Try some math
import math
print(f"\\n📐 π = {math.pi:.10f}")
print(f"📐 e = {math.e:.10f}")
print(f"📐 √2 = {math.sqrt(2):.10f}")

# List comprehension
squares = [x**2 for x in range(1, 11)]
print(f"\\n🔢 Squares 1–10: {squares}")
`;

/* ── STATE ── */
let pyodide = null;
let editor  = null;
let isRunning = false;
let outputLineCount = 0;
let startTime = null;

/* ── ELEMENT REFS ── */
const $ = id => document.getElementById(id);

const elStatus       = $("pyodide-status");
const elOutput       = $("output");
const elBtnRun       = $("btn-run");
const elBtnClear     = $("btn-clear-output");
const elBtnClearEd   = $("btn-clear-editor");
const elBtnCopy      = $("btn-copy");
const elBtnFormat    = $("btn-format");
const elBtnShare     = $("btn-share");
const elBtnInstall   = $("btn-install");
const elPkgInput     = $("pkg-input");
const elPkgStatus    = $("pkg-status");
const elColorTheme   = $("color-theme");
const elEditorTheme  = $("editor-theme");
const elFontSize     = $("font-size");
const elExecTime     = $("exec-time");
const elOutputStats  = $("output-stats");
const elToast        = $("toast");

/* ════════════════════════════════════════════════
   CODEMIRROR SETUP
════════════════════════════════════════════════ */
function initEditor() {
  editor = CodeMirror($("code-editor"), {
    value: getSavedCode() || DEFAULT_CODE,
    mode: "python",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    tabSize: 4,
    indentWithTabs: false,
    smartIndent: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    styleActiveLine: true,
    autoRefresh: true,
    keyMap: "sublime",
    extraKeys: {
      "Ctrl-Enter": runCode,
      "Cmd-Enter": runCode,
      "Tab": cm => {
        if (cm.somethingSelected()) { cm.indentSelection("add"); }
        else { cm.replaceSelection("    ", "end"); }
      }
    },
    lineWrapping: false,
    gutters: ["CodeMirror-linenumbers"],
  });

  // Auto-save on change
  editor.on("change", () => {
    clearTimeout(editor._saveTimer);
    editor._saveTimer = setTimeout(saveCode, 1000);
  });
}

/* ════════════════════════════════════════════════
   PYODIDE INIT
════════════════════════════════════════════════ */
async function initPyodide() {
  setStatus("loading", "Initialising Pyodide…");
  appendOutput("⏳ Loading Python runtime (Pyodide)…", "info");

  try {
    pyodide = await loadPyodide({
      stdout: text => appendOutput(text, "stdout"),
      stderr: text => appendOutput(text, "stderr"),
    });

    // Redirect sys.stdout / sys.stderr properly
    pyodide.runPython(`
import sys, io

class _PyFlowOut:
    def __init__(self, cb):
        self._cb = cb
    def write(self, s):
        if s:
            self._cb(s)
    def flush(self): pass

import js
sys.stdout = _PyFlowOut(lambda s: js.appendOutputBridge(s, 'stdout'))
sys.stderr = _PyFlowOut(lambda s: js.appendOutputBridge(s, 'stderr'))
`);

    // Expose JS callbacks into Python-land
    window.appendOutputBridge = (text, kind) => appendOutput(text, kind);

    // Load micropip
    await pyodide.loadPackage("micropip");

    setStatus("ready", "Python 3.11 ready");
    appendOutput("✅ Pyodide loaded — Python 3.11 ready!\n", "success");
    appendOutput('💡 Tip: Use micropip to install packages below. Press Ctrl+Enter to run.\n', "info");
    appendOutput("─".repeat(50) + "\n", "info");

    elBtnRun.disabled = false;

  } catch (err) {
    setStatus("error", "Load failed");
    appendOutput("❌ Failed to load Pyodide: " + err.message, "stderr");
    console.error(err);
  }
}

/* ════════════════════════════════════════════════
   RUN CODE
════════════════════════════════════════════════ */
async function runCode() {
  if (!pyodide || isRunning) return;

  const code = editor.getValue().trim();
  if (!code) { showToast("✏️ Editor is empty!"); return; }

  isRunning = true;
  elBtnRun.disabled = true;
  elBtnRun.classList.add("running");
  elBtnRun.querySelector("span:not(.run-icon)").textContent = "Running…";
  setStatus("running", "Running…");

  appendOutput("\n" + "─".repeat(50) + "\n", "info");
  appendOutput(`▶ Executing… ${new Date().toLocaleTimeString()}\n`, "system");

  startTime = performance.now();

  try {
    await pyodide.runPythonAsync(code);
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
    appendOutput(`\n✔ Done in ${elapsed}s\n`, "success");
    elExecTime.textContent = `Execution: ${elapsed}s`;

  } catch (err) {
    const elapsed = ((performance.now() - startTime) / 1000).toFixed(3);
    const msg = err.message || String(err);
    appendOutput("\n", "stdout");
    appendOutput(msg, "error-block");
    appendOutput(`\n✘ Error after ${elapsed}s\n`, "stderr");
    elExecTime.textContent = `Failed: ${elapsed}s`;
  }

  isRunning = false;
  elBtnRun.disabled = false;
  elBtnRun.classList.remove("running");
  elBtnRun.querySelector("span:not(.run-icon)").textContent = "Run";
  setStatus("ready", "Python 3.11 ready");
  updateStats();
  scrollOutput();
}

/* ════════════════════════════════════════════════
   OUTPUT HELPERS
════════════════════════════════════════════════ */
function appendOutput(text, kind = "stdout") {
  const span = document.createElement("span");
  span.className = `output-line ${kind}`;
  span.textContent = text;
  elOutput.appendChild(span);
  outputLineCount++;
  updateStats();
  scrollOutput();
}

function clearOutput() {
  elOutput.innerHTML = "";
  outputLineCount = 0;
  elExecTime.textContent = "";
  updateStats();
}

function scrollOutput() {
  elOutput.scrollTop = elOutput.scrollHeight;
}

function updateStats() {
  elOutputStats.textContent = outputLineCount > 0 ? `${outputLineCount} lines` : "";
}

/* ════════════════════════════════════════════════
   STATUS
════════════════════════════════════════════════ */
function setStatus(state, text) {
  elStatus.className = `status ${state}`;
  elStatus.innerHTML = `<span class="status-dot"></span>${text}`;
}

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg) {
  elToast.textContent = msg;
  elToast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elToast.classList.remove("show"), 2500);
}

/* ════════════════════════════════════════════════
   THEME: COLOR
════════════════════════════════════════════════ */
const THEME_EDITOR_MAP = {
  "dark-ocean":  "dracula",
  "neon-night":  "material-darker",
  "forest-dusk": "nord",
  "candy-pop":   "solarized dark",
  "rose-gold":   "monokai",
  "mono-ink":    "solarized dark",
};

function applyColorTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  // Suggest a matching editor theme
  const suggested = THEME_EDITOR_MAP[theme];
  if (suggested) {
    elEditorTheme.value = suggested;
    applyEditorTheme(suggested);
  }
  localStorage.setItem("pyflow-color-theme", theme);
}

function applyEditorTheme(theme) {
  if (editor) editor.setOption("theme", theme);
  localStorage.setItem("pyflow-editor-theme", theme);
}

function applyFontSize(size) {
  document.querySelectorAll(".CodeMirror").forEach(el => {
    el.style.fontSize = size + "px";
  });
  localStorage.setItem("pyflow-font-size", size);
}

/* ════════════════════════════════════════════════
   LOCAL STORAGE
════════════════════════════════════════════════ */
function saveCode() {
  if (editor) localStorage.setItem("pyflow-code", editor.getValue());
}

function getSavedCode() {
  return localStorage.getItem("pyflow-code");
}

function loadPreferences() {
  const colorTheme  = localStorage.getItem("pyflow-color-theme")  || "dark-ocean";
  const editorTheme = localStorage.getItem("pyflow-editor-theme") || "dracula";
  const fontSize    = localStorage.getItem("pyflow-font-size")    || "14";

  elColorTheme.value  = colorTheme;
  elEditorTheme.value = editorTheme;
  elFontSize.value    = fontSize;

  document.documentElement.setAttribute("data-theme", colorTheme);
}

/* ════════════════════════════════════════════════
   COPY CODE
════════════════════════════════════════════════ */
async function copyCode() {
  const code = editor.getValue();
  try {
    await navigator.clipboard.writeText(code);
    showToast("✅ Code copied to clipboard!");
  } catch {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("✅ Code copied!");
  }
}

/* ════════════════════════════════════════════════
   SHARE CODE (URL encode)
════════════════════════════════════════════════ */
async function shareCode() {
  const code = editor.getValue();
  const encoded = btoa(unescape(encodeURIComponent(code)));
  const url = `${location.origin}${location.pathname}?code=${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    showToast("🔗 Share URL copied!");
  } catch {
    prompt("Copy this share URL:", url);
  }
}

function loadSharedCode() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  if (code) {
    try {
      const decoded = decodeURIComponent(escape(atob(code)));
      editor.setValue(decoded);
    } catch { /* ignore bad base64 */ }
  }
}

/* ════════════════════════════════════════════════
   FORMAT CODE (basic Python indent via Pyodide)
════════════════════════════════════════════════ */
async function formatCode() {
  if (!pyodide) { showToast("⏳ Pyodide not ready yet."); return; }
  const code = editor.getValue();

  try {
    // Try autopep8 via micropip if available
    const formatted = await pyodide.runPythonAsync(`
import ast, textwrap

code = ${JSON.stringify(code)}

# Basic validation
try:
    ast.parse(code)
    result = "OK"
except SyntaxError as e:
    result = f"SyntaxError: {e}"
result
`);

    if (formatted === "OK") {
      showToast("✅ Code is valid Python!");
    } else {
      showToast("⚠️ " + formatted);
    }
  } catch (e) {
    showToast("⚠️ Format check failed.");
  }
}

/* ════════════════════════════════════════════════
   MICROPIP INSTALL
════════════════════════════════════════════════ */
async function installPackages() {
  if (!pyodide) { showToast("⏳ Pyodide not ready."); return; }

  const raw = elPkgInput.value.trim();
  if (!raw) { showToast("✏️ Enter package name(s)."); return; }

  const packages = raw.split(",").map(p => p.trim()).filter(Boolean);
  elPkgStatus.textContent = `📦 Installing ${packages.join(", ")}…`;
  elBtnInstall.disabled = true;

  const results = [];

  for (const pkg of packages) {
    try {
      appendOutput(`\n📦 Installing ${pkg}…\n`, "system");
      await pyodide.runPythonAsync(`
import micropip
await micropip.install("${pkg}")
`);
      appendOutput(`✅ ${pkg} installed!\n`, "success");
      results.push(`✅ ${pkg}`);
    } catch (err) {
      appendOutput(`❌ Failed to install ${pkg}: ${err.message}\n`, "stderr");
      results.push(`❌ ${pkg}`);
    }
  }

  elPkgStatus.textContent = results.join("  ");
  elBtnInstall.disabled = false;
  elPkgInput.value = "";
  scrollOutput();
}

/* ════════════════════════════════════════════════
   RESIZABLE PANE DIVIDER
════════════════════════════════════════════════ */
function initResizablePanes() {
  const divider    = $("pane-divider");
  const workspace  = divider.parentElement;
  const editorPane = workspace.querySelector(".editor-pane");
  const outputPane = workspace.querySelector(".output-pane");

  let dragging = false;
  let startX, startEdW, startOutW;

  divider.addEventListener("mousedown", e => {
    dragging = true;
    startX    = e.clientX;
    startEdW  = editorPane.getBoundingClientRect().width;
    startOutW = outputPane.getBoundingClientRect().width;
    divider.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    const dx      = e.clientX - startX;
    const total   = startEdW + startOutW;
    const newEdW  = Math.max(200, Math.min(total - 200, startEdW + dx));
    const newOutW = total - newEdW;
    editorPane.style.flex  = `0 0 ${newEdW}px`;
    outputPane.style.flex  = `0 0 ${newOutW}px`;
    if (editor) editor.refresh();
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });
}

/* ════════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════════ */
function bindEvents() {
  elBtnRun.addEventListener("click", runCode);
  elBtnClear.addEventListener("click", clearOutput);
  elBtnClearEd.addEventListener("click", () => {
    if (confirm("Clear editor?")) { editor.setValue(""); saveCode(); }
  });
  elBtnCopy.addEventListener("click", copyCode);
  elBtnFormat.addEventListener("click", formatCode);
  elBtnShare.addEventListener("click", shareCode);
  elBtnInstall.addEventListener("click", installPackages);

  elPkgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") installPackages();
  });

  elColorTheme.addEventListener("change", e => applyColorTheme(e.target.value));
  elEditorTheme.addEventListener("change", e => applyEditorTheme(e.target.value));
  elFontSize.addEventListener("change", e => applyFontSize(e.target.value));

  // Keyboard shortcut: Ctrl+Enter global
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  });
}

/* ════════════════════════════════════════════════
   BOOT
════════════════════════════════════════════════ */
async function boot() {
  loadPreferences();
  initEditor();
  bindEvents();
  initResizablePanes();

  // Apply saved editor theme & font size after CM init
  const savedEdTheme = localStorage.getItem("pyflow-editor-theme") || "dracula";
  const savedFont    = localStorage.getItem("pyflow-font-size")    || "14";
  applyEditorTheme(savedEdTheme);
  applyFontSize(savedFont);

  // Load shared code from URL
  loadSharedCode();

  // Disable run until Pyodide ready
  elBtnRun.disabled = true;

  // Init Pyodide in background
  await initPyodide();
}

document.addEventListener("DOMContentLoaded", boot);
