const API_URL = "http://127.0.0.1:8000/analyze";

const scanBtn = document.getElementById("scanBtn");
const clearBtn = document.getElementById("clearBtn");
const output = document.getElementById("output");
const statsBar = document.getElementById("statsBar");
const engineBadge = document.getElementById("engineBadge");

async function getActiveTab() {
  let [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab) {
    [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  }
  return tab;
}

async function sendToTab(tabId, payload) {
  try {
    return await chrome.tabs.sendMessage(tabId, payload);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    return await chrome.tabs.sendMessage(tabId, payload);
  }
}

function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

function renderResult(data, domMeta, tabId) {
  statsBar.style.display = "grid";
  document.getElementById("statPruned").textContent = `${domMeta.prunedPercent}%`;
  document.getElementById("statPii").textContent = `${domMeta.piiScrubbed}`;
  document.getElementById("statTraps").textContent = `${(data.dark_patterns || []).length}`;
  engineBadge.textContent = (data.engine || "AI").toUpperCase();

  const factsHtml = (data.key_facts || [])
    .map((f) => `<div class="fact-row"><span class="fact-k">${escapeHtml(f.label)}</span><span class="fact-v">${escapeHtml(f.value)}</span></div>`)
    .join("");

  const flags = data.dark_patterns || [];
  const flagsHtml = flags.length
    ? flags.map((fl, i) => `
        <div class="flag ${(fl.severity || "high").toLowerCase()}" data-idx="${i}">
          <div class="flag-top">
            <span class="flag-cat">⚠ ${escapeHtml(fl.category)}</span>
            <span class="flag-sev">${escapeHtml(fl.severity || "high")}</span>
          </div>
          <div class="flag-snip">"${escapeHtml(fl.snippet)}"</div>
          <div class="flag-exp">${escapeHtml(fl.explanation)}</div>
        </div>
      `).join("")
    : `<div class="status" style="padding:8px 0; color:#86efac;">✓ No obvious dark patterns detected on this page.</div>`;

  output.innerHTML = `
    <div class="card">
      <div class="section-title">${escapeHtml(data.page_type || "Page Overview")}</div>
      <div class="tldr">${escapeHtml(data.tldr)}</div>
    </div>
    <div class="card">
      <div class="section-title">Extracted Key Facts</div>
      ${factsHtml || '<div class="status" style="padding:6px;">No structured facts found.</div>'}
    </div>
    <div class="card">
      <div class="section-title">Dark-Pattern & Fine-Print X-Ray (Click to Jump)</div>
      ${flagsHtml}
    </div>
  `;

  output.querySelectorAll(".flag").forEach((el) => {
    el.addEventListener("click", () => {
      sendToTab(tabId, { type: "SCROLL_TO_FLAG", index: Number(el.dataset.idx) });
    });
  });
}

scanBtn.addEventListener("click", async () => {
  scanBtn.disabled = true;
  scanBtn.textContent = "Scanning DOM...";
  output.innerHTML = `<div class="status">Pruning HTML, scrubbing PII locally & analyzing...</div>`;

  try {
    const tab = await getActiveTab();
    if (!tab?.id) {
      throw new Error("Click once on the webpage tab, then click Scan again.");
    }
    if (tab.url && /^(chrome|edge|about|chrome-extension):\/\//i.test(tab.url)) {
      throw new Error("Open a regular website tab (not a browser settings page) and try again.");
    }

    const domMeta = await sendToTab(tab.id, { type: "EXTRACT_DOM" });
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: domMeta.url,
        title: domMeta.title,
        text: domMeta.text
      })
    });

    if (!res.ok) throw new Error(`Backend returned HTTP ${res.status}`);
    const data = await res.json();

    renderResult(data, domMeta, tab.id);
    await sendToTab(tab.id, { type: "HIGHLIGHT_FLAGS", flags: data.dark_patterns || [] });
  } catch (err) {
    output.innerHTML = `<div class="error"><b>Scan failed:</b> ${escapeHtml(err.message)}<br><br>Make sure FastAPI is running at <code>127.0.0.1:8000</code>.</div>`;
  } finally {
    scanBtn.disabled = false;
    scanBtn.textContent = "Scan & X-Ray Page";
  }
});

clearBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  if (tab?.id) await sendToTab(tab.id, { type: "CLEAR_HIGHLIGHTS" }).catch(() => {});
});