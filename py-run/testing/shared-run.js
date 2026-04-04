/* ═══════════════════════════════════════════════════
   shared-run.js
   Standalone Python runner for Py-Run "Share as Run"
   Pure client code execution — zero branding.
   Loaded by the generated shared-run page.
═══════════════════════════════════════════════════ */

(async function () {
  "use strict";

  /* ── DOM refs ── */
  const elOut     = document.getElementById("run-output");
  const elLoader  = document.getElementById("run-loader");
  const elTimer   = document.getElementById("run-timer");
  const elStatus  = document.getElementById("run-status");

  /* ── Read encoded code from URL ── */
  const params  = new URLSearchParams(location.search);
  const encoded = params.get("code");

  if (!encoded) {
    setStatus("error");
    write("Error: No code found in URL.\nUsage: ?code=<base64-encoded-python>", true);
    hideLoader();
    return;
  }

  let code;
  try {
    code = decodeURIComponent(escape(atob(encoded)));
  } catch {
    setStatus("error");
    write("Error: Could not decode the shared code. The URL may be malformed.", true);
    hideLoader();
    return;
  }

  /* ── Live elapsed timer while loading ── */
  const loadStart = performance.now();
  const timerInterval = setInterval(() => {
    elTimer.textContent = `(${((performance.now() - loadStart) / 1000).toFixed(1)}s)`;
  }, 100);

  /* ── Output helpers ── */
  function write(text, isErr) {
    const span = document.createElement("span");
    if (isErr) span.className = "err";
    span.textContent = text;
    elOut.appendChild(span);
    elOut.scrollTop = elOut.scrollHeight;
  }

  function hideLoader() {
    if (elLoader) elLoader.style.display = "none";
  }

  function setStatus(state) {
    if (!elStatus) return;
    elStatus.className = "run-badge " + state;
    const labels = { loading: "Loading…", running: "Running…", done: "Done", error: "Error" };
    elStatus.textContent = labels[state] || state;
  }

  /* ── Load Pyodide ── */
  try {
    setStatus("loading");

    const py = await loadPyodide({
      stdout: t => write(t, false),
      stderr: t => write(t, true),
    });

    /* Redirect Python stdout/stderr through JS callbacks */
    py.runPython(`
import sys

class _Out:
    def write(self, s):
        if s:
            import js
            js._pyWrite(s, False)
    def flush(self): pass

class _Err:
    def write(self, s):
        if s:
            import js
            js._pyWrite(s, True)
    def flush(self): pass

sys.stdout = _Out()
sys.stderr = _Err()
`);

    window._pyWrite = (text, isErr) => write(text, isErr);

    /* Stop load timer, start run */
    clearInterval(timerInterval);
    const loadElapsed = ((performance.now() - loadStart) / 1000).toFixed(2);
    elTimer.textContent = `(loaded in ${loadElapsed}s)`;

    hideLoader();
    setStatus("running");

    const runStart = performance.now();

    await py.runPythonAsync(code);

    const runElapsed = ((performance.now() - runStart) / 1000).toFixed(3);
    setStatus("done");

    /* Subtle done indicator */
    const done = document.createElement("span");
    done.className = "done-line";
    done.textContent = `\n[finished in ${runElapsed}s]`;
    elOut.appendChild(done);

  } catch (err) {
    clearInterval(timerInterval);
    hideLoader();
    setStatus("error");
    write("\n" + (err.message || String(err)), true);
  }
})();
