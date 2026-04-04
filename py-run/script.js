/* ═══════════════════════════════════════════════════
   Py-Run — Online Python Compiler by CosmoTools
   script.js  |  Main application logic
   https://github.com/bhuvanesh-m-dev/cosmotools
═══════════════════════════════════════════════════ */

"use strict";

/* ── DEFAULT STARTER CODE ── */
const DEFAULT_CODE = `# Welcome to Py-Run 🐍
# Online Python Compiler by CosmoTools
# Powered by Pyodide — runs entirely in your browser!

def greet(name):
    emoji = "🚀"
    print(f"Hello, {name}! {emoji}")

names = ["World", "Python", "Open Source"]
for name in names:
    greet(name)

import math
print(f"\\n📐 π  = {math.pi:.10f}")
print(f"📐 e  = {math.e:.10f}")
print(f"📐 √2 = {math.sqrt(2):.10f}")

squares = [x**2 for x in range(1, 11)]
print(f"\\n🔢 Squares 1–10: {squares}")
`;

/* ── EDITOR ↔ THEME MAP ── */
const THEME_EDITOR_MAP = {
  "dark-ocean":  "dracula",
  "neon-night":  "material-darker",
  "forest-dusk": "nord",
  "candy-pop":   "solarized dark",
  "rose-gold":   "monokai",
  "mono-ink":    "solarized dark",
};

/* ── STATE ── */
let pyodide           = null;
let editor            = null;
let isRunning         = false;
let outputLineCount   = 0;
let startTime         = null;
let countdownInterval = null;
let loadStartTime     = null;

/* ── ELEMENT REFS ── */
const $ = id => document.getElementById(id);

const elStatus      = $("pyodide-status");
const elStatusText  = $("status-text");
const elStatusTimer = $("status-timer");
const elOutput      = $("output");
const elBtnRun      = $("btn-run");
const elBtnClear    = $("btn-clear-output");
const elBtnClearEd  = $("btn-clear-editor");
const elBtnUpload   = $("btn-upload");
const elFileUpload  = $("file-upload");
const elBtnCopy     = $("btn-copy");
const elBtnFormat   = $("btn-format");
const elBtnInstall  = $("btn-install");
const elPkgInput    = $("pkg-input");
const elPkgStatus   = $("pkg-status");
const elColorTheme  = $("color-theme");
const elEditorTheme = $("editor-theme");
const elFontSize    = $("font-size");
const elExecTime    = $("exec-time");
const elOutputStats = $("output-stats");
const elToast       = $("toast");

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
      "Cmd-Enter":  runCode,
      "Tab": cm => {
        if (cm.somethingSelected()) cm.indentSelection("add");
        else cm.replaceSelection("    ", "end");
      },
    },
    lineWrapping: false,
    gutters: ["CodeMirror-linenumbers"],
  });

  editor.on("change", () => {
    clearTimeout(editor._saveTimer);
    editor._saveTimer = setTimeout(saveCode, 1000);
  });
}

/* ════════════════════════════════════════════════
   LIVE LOADING COUNTDOWN
════════════════════════════════════════════════ */
function startLoadingTimer() {
  loadStartTime     = performance.now();
  countdownInterval = setInterval(() => {
    const elapsed = ((performance.now() - loadStartTime) / 1000).toFixed(1);
    elStatusTimer.textContent = `(${elapsed}s)`;
  }, 100);
}

function stopLoadingTimer() {
  clearInterval(countdownInterval);
  countdownInterval = null;
  const total = ((performance.now() - loadStartTime) / 1000).toFixed(2);
  elStatusTimer.textContent = `— loaded in ${total}s`;
}

/* ════════════════════════════════════════════════
   PYODIDE INIT (FIXED)
════════════════════════════════════════════════ */
async function initPyodide() {
  setStatus("loading", "Loading Python runtime…");
  startLoadingTimer();
  appendOutput("⏳ Loading Python runtime (Pyodide)…", "info");

  try {
    // Define the bridge function BEFORE loading Pyodide
    window.appendOutputBridge = (text, kind) => appendOutput(text, kind);

    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      stdout: text => appendOutput(text, "stdout"),
      stderr: text => appendOutput(text, "stderr"),
    });

    /* Redirect Python sys.stdout / sys.stderr → JS callbacks */
    pyodide.runPython(`
import sys

class _PyRunOut:
    def __init__(self, kind):
        self._kind = kind
    def write(self, s):
        if s:
            import js
            js.appendOutputBridge(s, self._kind)
    def flush(self): pass

sys.stdout = _PyRunOut('stdout')
sys.stderr = _PyRunOut('stderr')
`);

    await pyodide.loadPackage("micropip");

    stopLoadingTimer();
    setStatus("ready", "Python 3.11 ready");
    appendOutput("✅ Pyodide loaded — Python 3.11 ready!\n", "success");
    appendOutput("💡 Tip: Install packages below. Press Ctrl+Enter to run.\n", "info");
    appendOutput("─".repeat(50) + "\n", "info");
    elBtnRun.disabled = false;

  } catch (err) {
    stopLoadingTimer();
    setStatus("error", "Load failed");
    elStatusTimer.textContent = "";
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
    appendOutput("\n", "stdout");
    appendOutput(err.message || String(err), "error-block");
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
  outputLineCount    = 0;
  elExecTime.textContent = "";
  updateStats();
}

function scrollOutput() { elOutput.scrollTop = elOutput.scrollHeight; }
function updateStats()  { elOutputStats.textContent = outputLineCount > 0 ? `${outputLineCount} lines` : ""; }

/* ════════════════════════════════════════════════
   STATUS
════════════════════════════════════════════════ */
function setStatus(state, text) {
  elStatus.className        = `status ${state}`;
  elStatusText.textContent  = text;
}

/* ════════════════════════════════════════════════
   TOAST
════════════════════════════════════════════════ */
let _toastTimer;
function showToast(msg) {
  elToast.textContent = msg;
  elToast.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => elToast.classList.remove("show"), 2800);
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
   UPLOAD FILE
════════════════════════════════════════════════ */
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    editor.setValue(evt.target.result);
    saveCode();
    showToast(`✅ Loaded ${file.name}`);
  };
  reader.onerror = function() {
    showToast("❌ Failed to read file");
  };
  reader.readAsText(file);
  e.target.value = "";
}

/* ════════════════════════════════════════════════
   FORMAT / VALIDATE SYNTAX
════════════════════════════════════════════════ */
async function formatCode() {
  if (!pyodide) { showToast("⏳ Pyodide not ready yet."); return; }
  const code = editor.getValue();
  try {
    const result = await pyodide.runPythonAsync(`
import ast
code = ${JSON.stringify(code)}
try:
    ast.parse(code)
    "OK"
except SyntaxError as e:
    f"SyntaxError: {e}"
`);
    showToast(result === "OK" ? "✅ Valid Python syntax!" : "⚠️ " + result);
  } catch {
    showToast("⚠️ Validation failed.");
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
  elPkgStatus.textContent = "📦 Installing…";
  elBtnInstall.disabled   = true;
  const results = [];

  for (const pkg of packages) {
    try {
      appendOutput(`\n📦 Installing ${pkg}…\n`, "system");
      await pyodide.runPythonAsync(`import micropip\nawait micropip.install("${pkg}")`);
      appendOutput(`✅ ${pkg} installed!\n`, "success");
      results.push(`✅ ${pkg}`);
    } catch (err) {
      appendOutput(`❌ ${pkg}: ${err.message}\n`, "stderr");
      results.push(`❌ ${pkg}`);
    }
  }

  elPkgStatus.textContent = results.join("  ");
  elBtnInstall.disabled   = false;
  elPkgInput.value        = "";
  scrollOutput();
}

/* ════════════════════════════════════════════════
   THEME — COLOR & EDITOR
════════════════════════════════════════════════ */
function applyColorTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const suggested = THEME_EDITOR_MAP[theme];
  if (suggested) {
    elEditorTheme.value = suggested;
    applyEditorTheme(suggested);
  }
  try { localStorage.setItem("pyrun-color-theme", theme); } catch (e) {}
}

function applyEditorTheme(theme) {
  if (editor) editor.setOption("theme", theme);
  try { localStorage.setItem("pyrun-editor-theme", theme); } catch (e) {}
}

function applyFontSize(size) {
  document.querySelectorAll(".CodeMirror").forEach(el => {
    el.style.fontSize = size + "px";
  });
  try { localStorage.setItem("pyrun-font-size", size); } catch (e) {}
}

/* ════════════════════════════════════════════════
   LOCAL STORAGE — code + preferences
════════════════════════════════════════════════ */
function saveCode() {
  if (editor) {
    try { localStorage.setItem("pyrun-code", editor.getValue()); } catch (e) {}
  }
}
function getSavedCode() {
  try { return localStorage.getItem("pyrun-code"); } catch (e) { return null; }
}

function loadPreferences() {
  let ct = "dark-ocean", et = "dracula", fs = "14";
  try {
    ct = localStorage.getItem("pyrun-color-theme")  || ct;
    et = localStorage.getItem("pyrun-editor-theme") || et;
    fs = localStorage.getItem("pyrun-font-size")    || fs;
  } catch (e) {}
  elColorTheme.value  = ct;
  elEditorTheme.value = et;
  elFontSize.value    = fs;
  document.documentElement.setAttribute("data-theme", ct);
}

/* ════════════════════════════════════════════════
   LOAD SHARED CODE FROM URL ?code=
   (Share as Code links land here)
════════════════════════════════════════════════ */
function loadSharedCode() {
  const params  = new URLSearchParams(location.search);
  const encoded = params.get("code");
  if (encoded) {
    try { editor.setValue(decodeCode(encoded)); }
    catch(e) { console.warn("Failed to decode shared code", e); }
  }
}

/* ════════════════════════════════════════════════
   RESIZABLE PANES
════════════════════════════════════════════════ */
function initResizablePanes() {
  const divider    = $("pane-divider");
  if (!divider) return;
  const workspace  = divider.parentElement;
  const editorPane = workspace.querySelector(".editor-pane");
  const outputPane = workspace.querySelector(".output-pane");

  let dragging = false, startX, startEdW, startOutW;

  divider.addEventListener("mousedown", e => {
    dragging  = true;
    startX    = e.clientX;
    startEdW  = editorPane.getBoundingClientRect().width;
    startOutW = outputPane.getBoundingClientRect().width;
    divider.classList.add("dragging");
    document.body.style.cursor     = "col-resize";
    document.body.style.userSelect = "none";
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    const dx     = e.clientX - startX;
    const total  = startEdW + startOutW;
    const newEdW = Math.max(200, Math.min(total - 200, startEdW + dx));
    editorPane.style.flex = `0 0 ${newEdW}px`;
    outputPane.style.flex = `0 0 ${total - newEdW}px`;
    if (editor) editor.refresh();
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove("dragging");
    document.body.style.cursor     = "";
    document.body.style.userSelect = "";
  });
}

/* ════════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════════ */
function bindEvents() {
  elBtnRun.addEventListener("click",     runCode);
  elBtnClear.addEventListener("click",   clearOutput);
  elBtnUpload.addEventListener("click",  () => elFileUpload.click());
  elFileUpload.addEventListener("change", handleFileUpload);
  elBtnClearEd.addEventListener("click", () => {
    if (confirm("Clear editor?")) { editor.setValue(""); saveCode(); }
  });
  elBtnCopy.addEventListener("click",    copyCode);
  elBtnFormat.addEventListener("click",  formatCode);
  elBtnInstall.addEventListener("click", installPackages);

  elPkgInput.addEventListener("keydown", e => {
    if (e.key === "Enter") installPackages();
  });

  elColorTheme.addEventListener("change",  e => applyColorTheme(e.target.value));
  elEditorTheme.addEventListener("change", e => applyEditorTheme(e.target.value));
  elFontSize.addEventListener("change",    e => applyFontSize(e.target.value));

  /* Ctrl+Enter / Cmd+Enter → Run */
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

  /* Apply saved editor theme + font size after CodeMirror is ready */
  let savedEditorTheme = "dracula";
  let savedFontSize = "14";
  try {
    savedEditorTheme = localStorage.getItem("pyrun-editor-theme") || "dracula";
    savedFontSize    = localStorage.getItem("pyrun-font-size")    || "14";
  } catch(e) {}
  applyEditorTheme(savedEditorTheme);
  applyFontSize(savedFontSize);

  /* Load shared code from URL if present */
  loadSharedCode();

  /* Wire share buttons (share.js handles its own events) */
  initShareUI(() => editor.getValue(), showToast);

  /* Disable run until Pyodide finishes loading */
  elBtnRun.disabled = true;

  await initPyodide();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
