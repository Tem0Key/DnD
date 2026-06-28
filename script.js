const searchInput = document.querySelector("#wikiSearch");
const sections = [...document.querySelectorAll(".searchable")];
const navLinks = [...document.querySelectorAll(".side-nav a")];

function normalize(value) {
  return value.toLowerCase().replaceAll("ё", "е").trim();
}

searchInput?.addEventListener("input", (event) => {
  const query = normalize(event.target.value);

  sections.forEach((section) => {
    const haystack = normalize(`${section.textContent} ${section.dataset.search || ""}`);
    section.classList.toggle("is-hidden", query.length > 0 && !haystack.includes(query));
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { rootMargin: "-25% 0px -60% 0px", threshold: [0.12, 0.24, 0.36] }
);

sections.forEach((section) => observer.observe(section));

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const strip = document.querySelector(`.${button.dataset.scrollTarget}`);
    if (!strip) return;
    const direction = Number(button.dataset.scrollDir || 1);
    strip.scrollBy({ left: direction * strip.clientWidth * 0.86, behavior: "smooth" });
  });
});

document.querySelectorAll("[data-drag-scroll]").forEach((strip) => {
  let scrollDrag = null;

  strip.addEventListener("pointerdown", (event) => {
    strip.setPointerCapture(event.pointerId);
    strip.classList.add("is-dragging");
    scrollDrag = { x: event.clientX, left: strip.scrollLeft };
  });

  strip.addEventListener("pointermove", (event) => {
    if (!scrollDrag) return;
    strip.scrollLeft = scrollDrag.left - (event.clientX - scrollDrag.x);
  });

  const stopScrollDrag = () => {
    scrollDrag = null;
    strip.classList.remove("is-dragging");
  };

  strip.addEventListener("pointerup", stopScrollDrag);
  strip.addEventListener("pointercancel", stopScrollDrag);
  strip.addEventListener("pointerleave", stopScrollDrag);
});

const backTop = document.querySelector(".back-top");
const treeDetails = [...document.querySelectorAll(".codex-tree details")];

treeDetails.forEach((details, index) => {
  const key = `codex-tree-${index}`;
  const saved = localStorage.getItem(key);
  if (saved !== null) details.open = saved === "true";
  details.addEventListener("toggle", () => localStorage.setItem(key, String(details.open)));
});

window.addEventListener("scroll", () => {
  backTop?.classList.toggle("is-visible", window.scrollY > 520);
}, { passive: true });

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
    event.preventDefault();
    searchInput?.focus();
  }
});

const eraButtons = [...document.querySelectorAll(".era-step")];
const eraPanels = [...document.querySelectorAll(".era-panel")];

eraButtons.forEach((button) => {
  button.addEventListener("click", () => {
    eraButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    eraPanels.forEach((panel) => panel.classList.toggle("is-active", panel.id === button.dataset.era));
  });
});

const autoLinkTerms = [
  { text: "Заражённые", href: "race-infected.html" },
  { text: "заражённые", href: "race-infected.html" },
  { text: "Мёртвые земли", href: "map.html" },
  { text: "Мертвые земли", href: "map.html" },
  { text: "Велтир", href: "state-veltir.html" },
  { text: "Маркор", href: "state-markor.html" },
  { text: "Элидор", href: "state-elidor.html" },
  { text: "Картур", href: "kartur.html" },
  { text: "Кхарак", href: "kharak.html" },
  { text: "Руда", href: "magic.html#ore" },
  { text: "руда", href: "magic.html#ore" },
  { text: "Эссенция", href: "magic.html#forbidden" },
  { text: "эссенция", href: "magic.html#forbidden" }
];

function shouldSkipAutoLink(node) {
  const parent = node.parentElement;
  return !parent || parent.closest("a, h1, h2, h3, dt, .article-toc, .breadcrumbs, .codex-tree, .topbar");
}

function linkFirstTerm(root, term) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkipAutoLink(node) || !node.nodeValue.includes(term.text)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const node = walker.nextNode();
  if (!node) return;
  const index = node.nodeValue.indexOf(term.text);
  const fragment = document.createDocumentFragment();
  const before = node.nodeValue.slice(0, index);
  const match = node.nodeValue.slice(index, index + term.text.length);
  const after = node.nodeValue.slice(index + term.text.length);
  if (before) fragment.append(document.createTextNode(before));
  const link = document.createElement("a");
  link.href = term.href;
  link.className = "auto-linked";
  link.textContent = match;
  fragment.append(link);
  if (after) fragment.append(document.createTextNode(after));
  node.parentNode.replaceChild(fragment, node);
}

document.querySelectorAll(".codex-article, .content").forEach((root) => {
  autoLinkTerms.forEach((term) => linkFirstTerm(root, term));
});


