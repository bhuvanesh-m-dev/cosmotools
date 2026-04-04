/* ═══════════════════════════════════════════════════
   Py-Run — Online Python Compiler by CosmoTools
   share.js  |  Share as Code + Share as Run
   https://github.com/bhuvanesh-m-dev/cosmotools
═══════════════════════════════════════════════════ */

"use strict";

/* ════════════════════════════════════════════════
   SHARE DROPDOWN TOGGLE
════════════════════════════════════════════════ */

export function toggleShareDropdown(e) {
  e.stopPropagation();
  document.getElementById("share-wrapper").classList.toggle("open");
}

export function closeShareDropdown() {
  document.getElementById("share-wrapper").classList.remove("open");
}

/* ════════════════════════════════════════════════
   ENCODE / DECODE HELPERS
════════════════════════════════════════════════ */

function encodeCode(code) {
  return btoa(unescape(encodeURIComponent(code)));
}

export function decodeCode(encoded) {
  return decodeURIComponent(escape(atob(encoded)));
}

/* ════════════════════════════════════════════════
   SHARE AS CODE
   ─────────────────────────────────────────────
   Encodes the user's code as base64 and appends
   it to the current Py-Run URL as ?code=...
   When the recipient opens the link in Py-Run,
   the code is decoded and loaded directly into
   the editor — ready to edit and run.
════════════════════════════════════════════════ */

export async function shareAsCode(getCode, showToast) {
  closeShareDropdown();

  const code    = getCode();
  const encoded = encodeCode(code);
  const url     = `${location.origin}${location.pathname}?code=${encoded}`;

  try {
    await navigator.clipboard.writeText(url);
    showToast("🔗 Share-as-Code URL copied! Opens in Py-Run editor.");
  } catch {
    prompt("Copy this URL (opens in Py-Run editor):", url);
  }
}

/* ════════════════════════════════════════════════
   SHARE AS RUN
   ─────────────────────────────────────────────
   Builds a minimal, self-contained HTML page that:
     • Loads Pyodide from CDN
     • Loads shared-run.js (the standalone runner)
     • Passes the encoded code via URL ?code=...
     • Executes the code immediately on page load
     • Shows ONLY the user's output — zero branding

   The generated page is intentionally plain.
   It is the client's code and output, nothing else.
════════════════════════════════════════════════ */

export function shareAsRun(getCode, showToast) {
  closeShareDropdown();

  const code    = getCode();
  const encoded = encodeCode(code);

  /*
   * Determine the absolute URL to shared-run.js.
   * Works both locally (file://) and on GitHub Pages.
   * We derive it from the current page's location.
   */
  const base         = location.href.split("?")[0].replace(/[^/]*$/, "");
  const sharedRunUrl = base + "shared-run.js";
  const pyodideUrl   = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";

  /* The runner page URL: same page + encoded code as param */
  const runnerPageUrl = `${base}run.html?code=${encoded}`;

  /*
   * Generate run.html — a standalone, branding-free page.
   * It reads ?code= from its own URL and passes it to shared-run.js.
   */
  const runPage = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Python Output</title>
<style>
/* ── Pure output page — no branding ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0b0c11;
  color: #d4e0f0;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  font-size: 14px;
  line-height: 1.75;
  padding: 28px 32px;
  min-height: 100vh;
}

#run-loader {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #4b5a6b;
  font-size: 12px;
  margin-bottom: 16px;
}

.loader-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #38bdf8;
  flex-shrink: 0;
  animation: ldot 1s ease-in-out infinite;
}

@keyframes ldot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.15; transform: scale(0.7); }
}

#run-status {
  display: none;
}

#run-output {
  white-space: pre-wrap;
  word-break: break-all;
}

.err       { color: #f87171; }
.done-line { color: #334155; font-size: 11px; }

/* Run badge (top-right corner) */
.run-badge {
  position: fixed;
  top: 12px;
  right: 16px;
  font-size: 10px;
  padding: 3px 9px;
  border-radius: 20px;
  display: block;
  font-family: inherit;
}

.run-badge.loading { background: #1e3a4a; color: #38bdf8; border: 1px solid #2a5570; }
.run-badge.running { background: #1a2f1a; color: #4ade80; border: 1px solid #2a5040; }
.run-badge.done    { background: #0f2a1a; color: #34d399; border: 1px solid #205040; }
.run-badge.error   { background: #2a1010; color: #f87171; border: 1px solid #5a2020; }
</style>
</head>
<body>

<!-- Status badge (top-right) -->
<span id="run-status" class="run-badge loading">Loading…</span>

<!-- Loader bar -->
<div id="run-loader">
  <span class="loader-dot"></span>
  <span>Loading Python runtime… </span>
  <span id="run-timer"></span>
</div>

<!-- Pure output -->
<pre id="run-output"></pre>

<!-- Pyodide -->
<script src="${pyodideUrl}"><\/script>
<!-- Py-Run shared runner (no branding) -->
<script src="${sharedRunUrl}"><\/script>

</body>
</html>`;

  /*
   * Open strategy:
   * 1. Try to open run.html as a Blob URL (works offline/local).
   * 2. The Blob URL includes the ?code= param so shared-run.js
   *    can read it from location.search.
   *
   * Note: Because Blob URLs are origin-less, shared-run.js is
   * fetched from the absolute sharedRunUrl we embedded above.
   */
  const blob    = new Blob([runPage], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);

  /*
   * We append the code param to the blob URL so shared-run.js
   * can read it via URLSearchParams(location.search).
   * Blob URLs don't support query strings natively in all browsers,
   * so we inject the param into the page via a meta script tag instead.
   */
  const runPageWithParam = runPage.replace(
    "<!-- Pyodide -->",
    `<!-- Injected code param -->
<script>
  /* Inject ?code param into location.search for shared-run.js */
  (function(){
    const encoded = ${JSON.stringify(encoded)};
    Object.defineProperty(window, '_sharedRunCode', { value: encoded, writable: false });
  })();
<\/script>
<!-- Pyodide -->`
  ).replace(
    /* Also patch shared-run.js to support _sharedRunCode fallback */
    `const encoded = params.get("code");`,
    `const encoded = params.get("code") || window._sharedRunCode || null;`
  );

  /* Re-create blob with injected param */
  const blobFinal = new Blob([runPageWithParam], { type: "text/html" });
  const finalUrl  = URL.createObjectURL(blobFinal);

  window.open(finalUrl, "_blank");
  showToast("▶ Share-as-Run opened — pure output, zero branding.");
}

/* ════════════════════════════════════════════════
   INIT — wire up DOM buttons
   Called from script.js after DOM is ready
════════════════════════════════════════════════ */

export function initShareUI(getCodeFn, showToastFn) {
  const btnToggle = document.getElementById("btn-share-toggle");
  const btnCode   = document.getElementById("btn-share-code");
  const btnRun    = document.getElementById("btn-share-run");
  const wrapper   = document.getElementById("share-wrapper");

  if (btnToggle) btnToggle.addEventListener("click", toggleShareDropdown);
  if (btnCode)   btnCode.addEventListener("click",   () => shareAsCode(getCodeFn, showToastFn));
  if (btnRun)    btnRun.addEventListener("click",    () => shareAsRun(getCodeFn, showToastFn));

  /* Close on outside click */
  document.addEventListener("click", e => {
    if (wrapper && !wrapper.contains(e.target)) closeShareDropdown();
  });

  /* Close on Escape */
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeShareDropdown();
  });
}
