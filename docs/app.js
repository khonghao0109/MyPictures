const albumsEl = document.getElementById("albums");
const filterEl = document.getElementById("filter");
const searchEl = document.getElementById("search");

// Lightbox
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

lbClose.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

/**
 * Nếu GitHub Pages trả MIME không chuẩn, <video> có thể không phát khi nhúng.
 * Bật USE_BLOB_WORKAROUND = true để fetch mp4 -> blob URL (fix chắc chắn).
 */
const USE_BLOB_WORKAROUND = true;

async function attachVideoBlob(videoEl, url) {
  const res = await fetch(url, { cache: "force-cache" });
  if (!res.ok) throw new Error(`Fetch video failed: ${res.status} ${url}`);
  const blob = await res.blob();
  const mp4 = new Blob([blob], { type: "video/mp4" });
  const objectUrl = URL.createObjectURL(mp4);
  videoEl.src = objectUrl;
  // Giải phóng URL blob khi video element bị remove
  videoEl.addEventListener(
    "emptied",
    () => {
      URL.revokeObjectURL(objectUrl);
    },
    { once: true },
  );
}

function renderAlbum(album) {
  const article = document.createElement("article");
  article.className = "album";
  article.dataset.category = album.folder;
  article.dataset.keywords =
    `${album.folder} ${album.title} ${album.description || ""}`.toLowerCase();

  const head = document.createElement("div");
  head.className = "album-head";
  head.innerHTML = `<h2>${album.title}</h2><p>${album.description || ""}</p>`;
  article.appendChild(head);

  // Grid ảnh
  const grid = document.createElement("div");
  grid.className = "grid";

  (album.images || []).forEach((src, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = src;
    img.alt = `${album.folder} ${idx + 1}`;
    img.addEventListener("click", () => openLightbox(src, img.alt));

    card.appendChild(img);
    grid.appendChild(card);
  });

  if ((album.images || []).length) article.appendChild(grid);

  // Video
  if ((album.videos || []).length) {
    const videoWrap = document.createElement("div");
    videoWrap.className = "video";
    videoWrap.innerHTML = `<div class="video-title">🎥 Video</div>`;

    album.videos.forEach((src) => {
      const ratio = document.createElement("div");
      ratio.className = "ratio";

      const v = document.createElement("video");
      v.controls = true;
      v.preload = "metadata";
      v.playsInline = true;

      // Debug nếu cần:
      v.addEventListener("error", () => {
        console.log("VIDEO ERROR:", src, v.error);
      });

      if (USE_BLOB_WORKAROUND) {
        // Fix chắc chắn khi server trả sai Content-Type
        attachVideoBlob(v, src).catch((err) => {
          console.warn("Blob workaround failed, fallback to source tag:", err);

          // fallback: source tag
          const s = document.createElement("source");
          s.src = src;
          s.type = "video/mp4";
          v.appendChild(s);
        });
      } else {
        const s = document.createElement("source");
        s.src = src;
        s.type = "video/mp4";
        v.appendChild(s);
      }

      ratio.appendChild(v);
      videoWrap.appendChild(ratio);

      const link = document.createElement("div");
      link.style.marginTop = "8px";
      link.innerHTML = `<a href="${src}" target="_blank" rel="noopener noreferrer">Mở video ở tab mới / tải về</a>`;
      videoWrap.appendChild(link);

      const spacer = document.createElement("div");
      spacer.style.height = "14px";
      videoWrap.appendChild(spacer);
    });

    article.appendChild(videoWrap);
  }

  return article;
}

function applyFilters() {
  const f = filterEl.value;
  const q = (searchEl.value || "").trim().toLowerCase();

  document.querySelectorAll(".album").forEach((a) => {
    const cat = a.dataset.category;
    const kw = a.dataset.keywords || "";
    const text = a.innerText.toLowerCase();

    const matchCat = f === "all" || cat === f;
    const matchQ = !q || text.includes(q) || kw.includes(q);

    a.style.display = matchCat && matchQ ? "" : "none";
  });
}

async function init() {
  const res = await fetch("./manifest.json", { cache: "no-store" });
  const data = await res.json();

  albumsEl.innerHTML = "";
  data.albums.forEach((album) => albumsEl.appendChild(renderAlbum(album)));

  filterEl.addEventListener("change", applyFilters);
  searchEl.addEventListener("input", applyFilters);
  applyFilters();
}

init();
