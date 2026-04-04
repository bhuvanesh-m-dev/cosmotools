/* ═══════════════════════════════════════════════════
   Py-Run — Online Python Compiler
   script.js  |  Pyodide + CodeMirror, no backend
   by CosmoTools
═══════════════════════════════════════════════════*/

"use strict";

/* ── DEFAULT CODE ── */
const DEFAULT_CODE = `# Welcome to Py-Run 🐍
# A beautiful, open-source online Python compiler
# Powered by Pyodide — runs entirely in your browser!
# by CosmoTools

def greet(name):
    emoji = "🚀"
    print(f"Hello, {name}! {emoji}")
    return f"Welcome to Py-Run, {name}!"

names = ["World", "Python", "Open Source"]
for name in names:
    greet(name)

# Try some math
import math
print(f"\n📐 π = {math.pi:.10f}")
print(f"📐 e = {math.e:.10f}")
print(f"📐 √2 = {math.sqrt(2):.10f}")

# List comprehension
squares = [x**2 for x in range(1, 11)]
print(f"\n🔢 Squares 1–10: {squares}")
`;

/* ── STATE ── */
let pyodide = null;
let editor  = null;
let isRunning = false;
let outputLineCount = 0;
let startTime = null;
let loadingStartTime = null;
let loadingTimerInterval = null;
let isRunMode = false; // When true, hide editor and run directly

/* ── ELEMENT REFS ── */
const $ = id => document.getElementById(id);

const elStatus       = $("pyodide-status");
const elStatusText   = $("status-text");
const elLoadingTimer = $("loading-timer");
const elOutput       = $("output");
const elBtnRun       = $("btn-run");
const elBtnClear     = $("btn-clear-output");
const elBtnClearEd   = $("btn-clear-editor");
const elBtnCopy      = $("btn-copy");
const elBtnFormat    = $("btn-format");
const elBtnShareCode = $("btn-share-code");
const elBtnShareRun  = $("btn-share-run");
const elBtnInstall   = $("btn-install");
const elPkgInput     = $("pkg-input");
const elPkgStatus    = $("pkg-status");
const elColorTheme   = $("color-theme");
const elEditorTheme  = $("editor-theme");
const elFontSize     = $("font-size");
const elExecTime     = $("exec-time");
const elOutputStats  = $("output-stats");
const elToast        = $("toast");
const elEditorPane   = $("editor-pane");
const elOutputPane   = $("output-pane");
const elDivider      = $("pane-divider");
const elToolbar      = $("toolbar");
const elPackageBar   = $("package-bar");
const elHeaderCenter = document.querySelector(".header-center");

/* ════════════════════════════════════════════════
   CODEMIRROR SETUP
════════════════════════════════════════════════ */
function initEditor() {
  const initialCode = getSavedCode() || DEFAULT_CODE;

  editor = CodeMirror($("code-editor"), {
    value: initialCode,
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
    readOnly: isRunMode, // Set read-only in run mode
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

  // Auto-save on change (only in normal mode)
  if (!isRunMode) {
    editor.on("change", () => {
      clearTimeout(editor._saveTimer);
      editor._saveTimer = setTimeout(saveCode, 1000);
    });
  }
}

/* ════════════════════════════════════════════════
   LOADING COUNTDOWN TIMER
════════════════════════════════════════════════ */
function startLoadingTimer() {
  loadingStartTime = performance.now();
  elLoadingTimer.style.display = "inline";

  loadingTimerInterval = setInterval(() => {
    const elapsed = ((performance.now() - loadingStartTime) / 1000).toFixed(1);
    elLoadingTimer.textContent = `(${elapsed}s)`;
  }, 100);
}

function stopLoadingTimer() {
  if (loadingTimerInterval) {
    clearInterval(loadingTimerInterval);
    loadingTimerInterval = null;
  }
  elLoadingTimer.style.display = "none";
}

/* ════════════════════════════════════════════════
   PYODIDE INIT
════════════════════════════════════════════════ */
async function initPyodide() {
  setStatus("loading", "⏳ Loading Python runtime (Pyodide)…");
  startLoadingTimer();
  appendOutput("⏳ Loading Python runtime (Pyodide)…", "info");

  try {
    pyodide = await loadPyodide({
      stdout: text => appendOutput(text, "stdout"),
      stderr: text => appendOutput(text, "stderr"),
    });

    // Redirect sys.stdout / sys.stderr properly
    pyodide.runPython(`
import sys, io

class _PyRunOut:
    def __init__(self, cb):
        self._cb = cb
    def write(self, s):
        if s:
            self._cb(s)
    def flush(self): pass

import js
sys.stdout = _PyRunOut(lambda s: js.appendOutputBridge(s, 'stdout'))
sys.stderr = _PyRunOut(lambda s: js.appendOutputBridge(s, 'stderr'))
`);

    // Expose JS callbacks into Python-land
    window.appendOutputBridge = (text, kind) => appendOutput(text, kind);

    // Load micropip
    await pyodide.loadPackage("micropip");

    stopLoadingTimer();
    setStatus("ready", "Python 3.11 ready");
    appendOutput("✅ Pyodide loaded — Python 3.11 ready!\n", "success");
    appendOutput('💡 Tip: Use micropip to install packages below. Press Ctrl+Enter to run.\n', "info");
    appendOutput("─".repeat(50) + "\n", "info");

    elBtnRun.disabled = false;

    // If in run mode, auto-run the code
    if (isRunMode && editor) {
      setTimeout(() => runCode(), 500);
    }

  } catch (err) {
    stopLoadingTimer();
    setStatus("error", "Load failed");
    appendOutput("❌ Failed to load Pyodide: " + err.message, "stderr");
    console.error(err);
  }
}

/* ════════════════════════════════════════════════
   RUN MODE UI (Hide editor, show only output)
════════════════════════════════════════════════ */
function setupRunMode() {
  if (!isRunMode) return;

  // Hide editor pane
  elEditorPane.style.display = "none";
  elDivider.style.display = "none";
  elToolbar.style.display = "none";
  elPackageBar.style.display = "none";

  // Make output pane full width
  elOutputPane.style.flex = "1";
  elOutputPane.style.width = "100%";

  // Update header
  elHeaderCenter.innerHTML = '<span style="color: var(--accent); font-size: 12px;">▶ Run Mode — Executing shared code</span>';

  // Update footer to remove branding reference in run mode
  const footer = document.querySelector(".footer");
  footer.innerHTML = '<span>Running shared code</span>';
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
  elStatusText.textContent = text;
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
  if (suggested && !isRunMode) {
    elEditorTheme.value = suggested;
    applyEditorTheme(suggested);
  }
  localStorage.setItem("pyrun-color-theme", theme);
}

function applyEditorTheme(theme) {
  if (editor) editor.setOption("theme", theme);
  localStorage.setItem("pyrun-editor-theme", theme);
}

function applyFontSize(size) {
  document.querySelectorAll(".CodeMirror").forEach(el => {
    el.style.fontSize = size + "px";
  });
  localStorage.setItem("pyrun-font-size", size);
}

/* ════════════════════════════════════════════════
   LOCAL STORAGE
════════════════════════════════════════════════ */
function saveCode() {
  if (editor && !isRunMode) localStorage.setItem("pyrun-code", editor.getValue());
}

function getSavedCode() {
  return localStorage.getItem("pyrun-code");
}

function loadPreferences() {
  const colorTheme  = localStorage.getItem("pyrun-color-theme")  || "dark-ocean";
  const editorTheme = localStorage.getItem("pyrun-editor-theme") || "dracula";
  const fontSize    = localStorage.getItem("pyrun-font-size")    || "14";

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
   SHARE AS CODE (Editable share)
════════════════════════════════════════════════ */
async function shareAsCode() {
  const code = editor.getValue();
  const encoded = btoa(unescape(encodeURIComponent(code)));
  const url = `${location.origin}${location.pathname}?code=${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    showToast("🔗 Share as Code URL copied!");
  } catch {
    prompt("Copy this share URL:", url);
  }
}

/* ════════════════════════════════════════════════
   SHARE AS RUN (Execute-only share)
════════════════════════════════════════════════ */
async function shareAsRun() {
  const code = editor.getValue();
  const encoded = btoa(unescape(encodeURIComponent(code)));
  const url = `${location.origin}${location.pathname}?run=${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    showToast("▶ Share as Run URL copied! (Opens in new tab)");
  } catch {
    prompt("Copy this run URL:", url);
  }
}

/* ════════════════════════════════════════════════
   LOAD SHARED CODE
════════════════════════════════════════════════ */
function loadSharedCode() {
  const params = new URLSearchParams(location.search);
  const codeParam = params.get("code");
  const runParam = params.get("run");

  if (runParam) {
    // Run mode - execute only, no editing
    isRunMode = true;
    try {
      const decoded = decodeURIComponent(escape(atob(runParam)));
      return decoded;
    } catch { 
      return null; 
    }
  } else if (codeParam) {
    // Normal share mode - editable
    try {
      const decoded = decodeURIComponent(escape(atob(codeParam)));
      return decoded;
    } catch { 
      return null; 
    }
  }
  return null;
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
  if (isRunMode) return; // No resizing in run mode

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
  elBtnShareCode.addEventListener("click", shareAsCode);
  elBtnShareRun.addEventListener("click", shareAsRun);
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
  // Check for shared code first
  const sharedCode = loadSharedCode();

  if (!isRunMode) {
    loadPreferences();
  }

  initEditor();

  // If shared code exists, use it
  if (sharedCode) {
    editor.setValue(sharedCode);
  }

  bindEvents();
  initResizablePanes();

  // Apply saved editor theme & font size after CM init (only in normal mode)
  if (!isRunMode) {
    const savedEdTheme = localStorage.getItem("pyrun-editor-theme") || "dracula";
    const savedFont    = localStorage.getItem("pyrun-font-size")    || "14";
    applyEditorTheme(savedEdTheme);
    applyFontSize(savedFont);
  }

  // Setup run mode UI if needed
  setupRunMode();

  // Disable run until Pyodide ready
  elBtnRun.disabled = true;

  // Init Pyodide in background
  await initPyodide();
}

document.addEventListener("DOMContentLoaded", boot);
