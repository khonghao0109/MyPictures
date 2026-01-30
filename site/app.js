const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
const lbClose = document.getElementById("lbClose");

function openLightbox(src, caption) {
  lbImg.src = src;
  lbCaption.textContent = caption || "";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lbImg.src = "";
  lbCaption.textContent = "";
}

document.addEventListener("click", (e) => {
  const img = e.target.closest("img[data-full]");
  if (img) {
    openLightbox(img.dataset.full, img.alt);
    return;
  }
  if (e.target === lightbox) closeLightbox();
});

lbClose.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// Filter + search
const filter = document.getElementById("filter");
const search = document.getElementById("search");
const albums = Array.from(document.querySelectorAll(".album"));

function applyFilters() {
  const f = filter.value;
  const q = (search.value || "").trim().toLowerCase();

  albums.forEach((a) => {
    const cat = a.dataset.category;
    const kw = (a.dataset.keywords || "").toLowerCase();
    const text = a.innerText.toLowerCase();

    const matchCat = f === "all" || cat === f;
    const matchQ = !q || text.includes(q) || kw.includes(q);

    a.style.display = matchCat && matchQ ? "" : "none";
  });
}

filter.addEventListener("change", applyFilters);
search.addEventListener("input", applyFilters);
applyFilters();
