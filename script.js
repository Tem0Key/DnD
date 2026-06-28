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
