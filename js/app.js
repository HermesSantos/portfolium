const KEYWORDS = new Set([
  "package",
  "import",
  "type",
  "struct",
  "func",
  "var",
  "const",
  "return",
  "if",
  "else",
  "for",
  "range",
  "go",
  "defer",
  "interface",
  "map",
  "chan",
  "select",
  "switch",
  "case",
  "default",
  "break",
  "continue",
  "true",
  "false",
  "nil",
]);

const TYPES = new Set([
  "string",
  "int",
  "int64",
  "bool",
  "byte",
  "rune",
  "error",
  "float64",
  "Hermes",
  "any",
]);

function tokenize(line) {
  const tokens = [];
  let i = 0;
  const push = (text, cls) => tokens.push({ text, cls });

  while (i < line.length) {
    const rest = line.slice(i);
    const comment = rest.match(/^(\/\/.*|#.*)/);
    if (comment) {
      push(comment[0], "tok-com");
      i += comment[0].length;
      continue;
    }
    const str = rest.match(/^"(?:[^"\\]|\\.)*"?/);
    if (str) {
      push(str[0], "tok-str");
      i += str[0].length;
      continue;
    }
    const num = rest.match(/^\d+(\.\d+)?/);
    if (num) {
      push(num[0], "tok-num");
      i += num[0].length;
      continue;
    }
    const word = rest.match(/^[A-Za-z_][A-Za-z0-9_]*/);
    if (word) {
      const w = word[0];
      const after = rest.slice(w.length);
      let cls = "";
      if (KEYWORDS.has(w)) cls = "tok-kw";
      else if (TYPES.has(w)) cls = "tok-type";
      else if (after.startsWith("(")) cls = "tok-fn";
      push(w, cls);
      i += w.length;
      continue;
    }
    const punc = rest.match(/^[^A-Za-z0-9_\s"]+/);
    if (punc) {
      push(punc[0], "tok-punc");
      i += punc[0].length;
      continue;
    }
    const ws = rest.match(/^\s+/);
    if (ws) {
      push(ws[0], "");
      i += ws[0].length;
      continue;
    }
    push(rest.slice(0, 1), "");
    i += 1;
  }
  return tokens;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderCode(code) {
  const lines = code.replace(/\n$/, "").split("\n");
  return lines
    .map((line, idx) => {
      const tokens = tokenize(line)
        .map((t) => {
          const text = escapeHtml(t.text);
          return t.cls ? `<span class="${t.cls}">${text}</span>` : text;
        })
        .join("");
      return `<div class="code-line"><span class="code-ln">${idx + 1}</span><span>${tokens || "&nbsp;"}</span></div>`;
    })
    .join("");
}

let currentLang = "pt";

const ptSource = {
  title: "",
  description: "",
  byKey: { copied: "copiado" },
  nodes: [],
  aria: [],
  code: "",
};

function snapshotPt() {
  ptSource.title = document.title;
  const meta = document.querySelector('meta[name="description"]');
  ptSource.description = meta ? meta.getAttribute("content") || "" : "";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const useHtml = el.hasAttribute("data-i18n-html");
    const value = useHtml ? el.innerHTML : el.textContent;
    ptSource.nodes.push({ el, useHtml, value });
    if (key && !(key in ptSource.byKey)) {
      ptSource.byKey[key] = (el.textContent || "").replace(/^\s+|\s+$/g, "");
    }
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    ptSource.aria.push({ el, value: el.getAttribute("aria-label") || "" });
  });

  const pre = document.getElementById("hero-code");
  ptSource.code = pre ? pre.textContent.replace(/^\n/, "").replace(/\n$/, "") : "";
}

function t(key) {
  if (currentLang === "en") return I18N[key] || key;
  return ptSource.byKey[key] || key;
}

function applyValue(el, value, useHtml) {
  if (useHtml) el.innerHTML = value;
  else el.textContent = value;
}

function applyI18n() {
  const isEn = currentLang === "en";
  document.documentElement.lang = isEn ? "en" : "pt-BR";

  document.title = isEn ? I18N["meta.title"] || ptSource.title : ptSource.title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute("content", isEn ? I18N["meta.description"] || ptSource.description : ptSource.description);
  }

  ptSource.nodes.forEach(({ el, useHtml, value }) => {
    const key = el.getAttribute("data-i18n");
    applyValue(el, isEn ? I18N[key] || value : value, useHtml);
  });

  ptSource.aria.forEach(({ el, value }) => {
    const key = el.getAttribute("data-i18n-aria");
    el.setAttribute("aria-label", isEn ? I18N[key] || value : value);
  });

  const pre = document.getElementById("hero-code");
  if (pre) {
    const snippet = isEn ? CODE_SNIPPET_EN : ptSource.code;
    pre.innerHTML = renderCode(snippet);
    pre.dataset.source = snippet;
  }

  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.textContent = t("copy");
    btn.dataset.copied = "false";
  });

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang") === currentLang));
  });
}

function setLang(lang) {
  currentLang = lang === "en" ? "en" : "pt";
  localStorage.setItem("lang", currentLang);
  applyI18n();
}

function flashCopied(el) {
  if (!el) return;
  el.textContent = t("copied");
  el.dataset.copied = "true";
  setTimeout(() => {
    if (el.dataset.copied === "true") {
      el.textContent = t("copy");
      el.dataset.copied = "false";
    }
  }, 1600);
}

async function copyText(text, feedbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    flashCopied(feedbackEl);
  } catch {
    /* clipboard unavailable */
  }
}

function setupCopy() {
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    if (btn.closest("[data-copy]")) return;
    btn.addEventListener("click", async () => {
      const block = btn.closest(".code-block");
      const pre = block && block.querySelector("pre");
      const source = (pre && pre.dataset.source) || (pre && pre.innerText) || "";
      await copyText(source, btn);
    });
  });

  document.querySelectorAll("[data-copy]").forEach((el) => {
    el.addEventListener("click", async () => {
      await copyText(el.getAttribute("data-copy") || "", el.querySelector(".copy-btn"));
    });
  });
}

function setupMenu() {
  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("mobile-nav");
  if (!btn || !nav) return;

  const close = () => {
    nav.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "≡";
  };

  btn.addEventListener("click", () => {
    const open = !nav.classList.contains("open");
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "×" : "≡";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", close);
  });
}

function formatNumber(n) {
  return new Intl.NumberFormat(currentLang === "en" ? "en" : "pt-BR").format(n);
}

async function loadGithubStats() {
  const reposEl = document.getElementById("stat-repos");
  const followersEl = document.getElementById("stat-followers");
  const sinceEl = document.getElementById("stat-since");
  const fallback = { public_repos: 44, followers: 38, created_at: "2021-11-15T22:43:52Z" };

  const apply = (data) => {
    if (reposEl) reposEl.textContent = formatNumber(data.public_repos);
    if (followersEl) followersEl.textContent = formatNumber(data.followers);
    if (sinceEl) sinceEl.textContent = String(new Date(data.created_at).getFullYear());
  };

  apply(fallback);

  try {
    const res = await fetch("https://api.github.com/users/HermesSantos");
    if (!res.ok) return;
    const data = await res.json();
    apply({
      public_repos: data.public_repos ?? fallback.public_repos,
      followers: data.followers ?? fallback.followers,
      created_at: data.created_at || fallback.created_at,
    });
  } catch {
    /* keep fallback */
  }
}

document.addEventListener("DOMContentLoaded", () => {
  snapshotPt();
  currentLang = detectLang();
  applyI18n();
  setupCopy();
  setupMenu();
  loadGithubStats();

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.getAttribute("data-lang")));
  });
});
