if (!window.__GLASSWEB_LOADED__) {
  window.__GLASSWEB_LOADED__ = true;

  let highlightedNodes = [];

  function scrubPII(text) {
    let count = 0;
    const patterns = [
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      /(?:\+91[\-\s]?)?[6-9]\d{9}\b/g,
      /\b(?:\d[ -]*?){13,16}\b/g
    ];
    let clean = text;
    for (const regex of patterns) {
      clean = clean.replace(regex, () => {
        count++;
        return "[REDACTED_PII]";
      });
    }
    return { clean, count };
  }

  function extractCleanDOM() {
    const rawHtmlLen = document.documentElement.innerHTML.length || 1;
    const clone = document.body.cloneNode(true);

    clone
      .querySelectorAll("script, style, noscript, svg, iframe, canvas, footer, .glassweb-badge")
      .forEach((el) => el.remove());

    const rawText = (clone.innerText || "").replace(/\s+/g, " ").trim();
    const { clean, count } = scrubPII(rawText);
    const prunedText = clean.slice(0, 14000);
    const prunedPercent = Math.max(0, Math.min(99, Math.round((1 - prunedText.length / rawHtmlLen) * 100)));

    return {
      url: window.location.href,
      title: document.title,
      text: prunedText,
      prunedPercent,
      piiScrubbed: count
    };
  }

  function clearHighlights() {
    document.querySelectorAll(".glassweb-badge").forEach((b) => b.remove());
    highlightedNodes.forEach(({ el, oldOutline, oldBg, oldPos }) => {
      el.style.outline = oldOutline;
      el.style.backgroundColor = oldBg;
      el.style.position = oldPos;
      delete el.dataset.glasswebId;
    });
    highlightedNodes = [];
  }

  function highlightFlags(flags) {
    clearHighlights();
    if (!Array.isArray(flags) || flags.length === 0) return { matched: 0 };

    let matched = 0;

    flags.forEach((flag, idx) => {
      const target = (flag.snippet || "").trim().toLowerCase();
      if (target.length < 4) return;

      const shortTarget = target.split(/\s+/).slice(0, 3).join(" ");
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      let matchEl = null;

      while ((node = walker.nextNode())) {
        const val = (node.nodeValue || "").replace(/\s+/g, " ").toLowerCase();
        if (!val.trim()) continue;
        if (val.includes(target) || (shortTarget.length >= 8 && val.includes(shortTarget))) {
          const parent = node.parentElement;
          if (parent && parent.offsetParent !== null && !parent.closest(".glassweb-badge")) {
            matchEl = parent;
            break;
          }
        }
      }

      if (matchEl) {
        matched++;
        const isHigh = (flag.severity || "").toLowerCase() === "high";
        const borderColor = isHigh ? "#ef4444" : "#f59e0b";
        const bgTint = isHigh ? "rgba(239, 68, 68, 0.14)" : "rgba(245, 158, 11, 0.14)";

        highlightedNodes.push({
          el: matchEl,
          oldOutline: matchEl.style.outline,
          oldBg: matchEl.style.backgroundColor,
          oldPos: matchEl.style.position
        });

        matchEl.style.outline = `2.5px solid ${borderColor}`;
        matchEl.style.backgroundColor = bgTint;
        matchEl.style.borderRadius = "4px";
        matchEl.dataset.glasswebId = String(idx);

        const badge = document.createElement("span");
        badge.className = "glassweb-badge";
        badge.textContent = `⚠ GlassWeb: ${flag.category}`;
        badge.title = flag.explanation;
        Object.assign(badge.style, {
          display: "inline-block",
          marginLeft: "6px",
          padding: "2px 7px",
          background: borderColor,
          color: "#ffffff",
          fontSize: "11px",
          fontWeight: "700",
          fontFamily: "system-ui, sans-serif",
          borderRadius: "999px",
          verticalAlign: "middle",
          zIndex: "2147483647",
          boxShadow: "0 2px 6px rgba(0,0,0,0.35)"
        });
        matchEl.appendChild(badge);
      }
    });

    return { matched };
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === "EXTRACT_DOM") {
      sendResponse(extractCleanDOM());
    } else if (msg.type === "HIGHLIGHT_FLAGS") {
      sendResponse(highlightFlags(msg.flags));
    } else if (msg.type === "CLEAR_HIGHLIGHTS") {
      clearHighlights();
      sendResponse({ cleared: true });
    } else if (msg.type === "SCROLL_TO_FLAG") {
      const el = document.querySelector(`[data-glassweb-id="${msg.index}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      sendResponse({ ok: Boolean(el) });
    }
    return true;
  });
}