(() => {
  const gift = window.LOVE_GIFT;
  const chapterNames = ["01", "02", "03", "04", "05", "06"];
  const cover = document.querySelector("#cover");
  const shell = document.querySelector("#site-shell");
  const chapterList = document.querySelector("#chapter-list");
  const body = document.querySelector("#letter-body");
  const dialog = document.querySelector("#secret-dialog");
  const photoDialog = document.querySelector("#photo-dialog");
  let activeChapter = 0;
  let toastTimer;
  const objectUrls = new Set();

  const universeNotes = [
    ["♡", "Pucca x Garu",],
    ["✿", "Orihime x Ichigo",],
    ["♡", "Dexter x Rita",],
    ["♡", "Joe x Love" ,],
    ["♡", "Bugs x Lola",],
    ["♡", "Roblox",],
    ["♡", "Minecraft",]
  ];

  function showToast(message) {
    const toast = document.querySelector("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2800);
  }

  function openStory(index = 0) {
    cover.hidden = true;
    shell.hidden = false;
    renderChapter(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderNavigation() {
    chapterList.innerHTML = "";
    gift.letters.forEach((letter, index) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chapter-link";
      button.dataset.index = index;
      button.setAttribute("aria-label", `Abrir carta ${index + 1}: ${letter.title || "Título pendiente"}`);
      button.innerHTML = `<span class="chapter-index">${chapterNames[index]}</span><span class="chapter-name">${escapeHtml(letter.title || "Título pendiente")}</span>`;
      button.addEventListener("click", () => renderChapter(index));
      li.append(button);
      chapterList.append(li);
    });
  }

  function renderChapter(index) {
    activeChapter = Math.max(0, Math.min(index, gift.letters.length - 1));
    const letter = gift.letters[activeChapter] || {};
    document.querySelectorAll(".chapter-link").forEach((button, i) => {
      button.classList.toggle("active", i === activeChapter);
      if (i === activeChapter) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    document.querySelector("#letter-number").textContent = `CARTA ${chapterNames[activeChapter]} / 06`;
    document.querySelector("#progress-caption").textContent = `CAPÍTULO ${activeChapter + 1} DE 6`;
    document.querySelector("#progress-fill").style.width = `${((activeChapter + 1) / 6) * 100}%`;
    document.querySelector("#letter-footnote").textContent = activeChapter === 5 ? "EL ÚLTIMO CAPÍTULO DE ESTA CARTITA" : "UNA CARTA ESCRITA PARA TI";

    if (!letter.text || letter.placeholder) {
      body.innerHTML = `<p class="chapter-kicker">PARTE ${chapterNames[activeChapter]}</p>
        <h2 class="chapter-title">${escapeHtml(letter.title || "Título pendiente")}</h2>
        <div class="placeholder-note"><span class="placeholder-icon">✎</span><div><strong>Tu carta va aquí</strong><p>Este espacio está listo para tu versión final. Pégala en <code>content.js</code>, dentro de la parte ${activeChapter + 1}. No añadí ningún texto al azar para cuidar tus palabras.</p></div></div>
        <div class="chapter-controls"><button class="chapter-step" type="button" data-step="-1" ${activeChapter === 0 ? "disabled" : ""}>← <span>Anterior</span></button><span class="chapter-dots">${chapterNames.map((n, i) => `<i class="${i === activeChapter ? "on" : ""}"></i>`).join("")}</span><button class="chapter-step next" type="button" data-step="1" ${activeChapter === 5 ? "disabled" : ""}><span>Siguiente</span> →</button></div>`;
    } else {
      const paragraphs = letter.text.split(/\n\s*\n/).filter(Boolean);
      body.innerHTML = `<p class="chapter-kicker">PARTE ${chapterNames[activeChapter]}</p><h2 class="chapter-title">${escapeHtml(letter.title || "Carta")}</h2><div class="letter-copy">${paragraphs.map(p => `<p>${escapeHtml(p).replaceAll("\n", "<br>")}</p>`).join("")}</div><div class="chapter-controls"><button class="chapter-step" type="button" data-step="-1" ${activeChapter === 0 ? "disabled" : ""}>← <span>Anterior</span></button><span class="chapter-dots">${chapterNames.map((n, i) => `<i class="${i === activeChapter ? "on" : ""}"></i>`).join("")}</span><button class="chapter-step next" type="button" data-step="1" ${activeChapter === 5 ? "disabled" : ""}><span>Siguiente</span> →</button></div>`;
    }
    body.querySelectorAll(".chapter-step").forEach(button => button.addEventListener("click", () => renderChapter(activeChapter + Number(button.dataset.step))));
    history.replaceState(null, "", `#parte-${activeChapter + 1}`);
  }

  function renderPhotos() {
    const grid = document.querySelector("#photo-grid");
    grid.innerHTML = "";
    gift.photos.forEach((photo, index) => {
      const card = document.createElement("div");
      card.className = `photo-card photo-card-${index + 1}`;
      const inner = photo.src
        ? `<button class="photo-frame has-photo" type="button" aria-label="Ver foto: ${escapeHtml(photo.caption)}"><img src="${escapeAttribute(photo.src)}" alt="${escapeHtml(photo.caption)}"><span class="photo-zoom" aria-hidden="true">↗</span></button>`
        : `<button class="photo-frame empty-photo" type="button" aria-label="Añadir foto: ${escapeHtml(photo.caption)}"><span class="photo-mark">${["♡", "✿", "☁"][index % 3]}</span><span class="photo-add">+ añadir foto</span><span class="photo-label">${escapeHtml(photo.caption)}</span></button>`;
      card.innerHTML = `${inner}<input class="photo-input" type="file" accept="image/*" hidden><p>${escapeHtml(photo.caption)}</p>`;
      const frame = card.querySelector(".photo-frame");
      const input = card.querySelector(".photo-input");
      frame.addEventListener("click", () => {
        if (photo.src || frame.classList.contains("has-photo")) {
          document.querySelector("#lightbox-image").src = frame.querySelector("img").src;
          photoDialog.showModal();
        } else input.click();
      });
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        objectUrls.add(url);
        const image = document.createElement("img");
        image.src = url;
        image.alt = photo.caption;
        frame.replaceChildren(image);
        frame.classList.remove("empty-photo");
        frame.classList.add("has-photo");
        frame.setAttribute("aria-label", `Ver foto: ${photo.caption}`);
        showToast("Foto añadida para esta visita. ♡");
      });
      grid.append(card);
    });
  }

  function renderSongs() {
    const list = document.querySelector("#track-list");
    list.innerHTML = "";
    gift.songs.forEach((song, index) => {
      const item = document.createElement("div");
      item.className = "track-item";
      const row = document.createElement("div");
      row.className = "track-row";
      row.innerHTML = `<span class="track-index">0${index + 1}</span><div class="track-info"><strong>${escapeHtml(song.title)}</strong></div><button class="track-play" type="button" aria-label="Abrir reproductor de YouTube para ${escapeHtml(song.title)}" aria-expanded="false" ${song.youtubeId ? "" : "disabled"}>▶</button>`;

      const player = document.createElement("section");
      player.className = "youtube-mini-player";
      player.hidden = true;
      player.setAttribute("aria-label", `Reproductor de YouTube para ${song.title}`);
      player.innerHTML = `<div class="youtube-mini-header"><span class="youtube-mini-brand"><span aria-hidden="true">▶</span> YouTube</span><button class="youtube-mini-close" type="button" aria-label="Cerrar reproductor">×</button></div><div class="youtube-video-frame"></div>`;

      const play = row.querySelector(".track-play");
      const close = player.querySelector(".youtube-mini-close");
      const frame = player.querySelector(".youtube-video-frame");
      const closePlayer = () => {
        player.hidden = true;
        frame.replaceChildren();
        play.textContent = "▶";
        play.setAttribute("aria-expanded", "false");
      };

      play.addEventListener("click", () => {
        if (player.hidden) {
          list.querySelectorAll(".track-item").forEach((otherItem) => {
            const otherPlayer = otherItem.querySelector(".youtube-mini-player");
            if (otherPlayer && !otherPlayer.hidden) {
              otherPlayer.hidden = true;
              otherPlayer.querySelector(".youtube-video-frame").replaceChildren();
              const otherButton = otherItem.querySelector(".track-play");
              otherButton.textContent = "▶";
              otherButton.setAttribute("aria-expanded", "false");
            }
          });
          if (window.location.protocol === "file:") {
            const note = document.createElement("p");
            note.className = "youtube-local-note";
            note.textContent = "YouTube necesita que esta página se abra desde una dirección web. Al publicarla, el mini reproductor aparecerá aquí.";
            frame.replaceChildren(note);
          } else {
            const video = document.createElement("iframe");
            video.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(song.youtubeId)}?rel=0&playsinline=1`;
            video.title = `YouTube: ${song.title}`;
            video.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            video.allowFullscreen = true;
            video.loading = "lazy";
            video.referrerPolicy = "strict-origin-when-cross-origin";
            frame.replaceChildren(video);
          }
          player.hidden = false;
          play.textContent = "×";
          play.setAttribute("aria-expanded", "true");
        } else {
          closePlayer();
        }
      });
      close.addEventListener("click", closePlayer);
      item.append(row, player);
      list.append(item);
    });
  }

  function renderUniverses() {
    const grid = document.querySelector("#universe-grid");
    grid.innerHTML = "";
    universeNotes.forEach(([icon, title], index) => {
      const entry = document.createElement("div");
      entry.className = "universe-entry";

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.hidden = true;
      input.setAttribute("aria-label", `Elegir foto para ${title}`);

      const button = document.createElement("button");
      button.className = "universe-card";
      button.type = "button";
      button.setAttribute("aria-label", `Mostrar espacio para foto de ${title}`);
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = `<span class="universe-icon">${icon}</span><span class="universe-name">${escapeHtml(title)}</span><span class="universe-hint">✦</span>`;

      const photoSpace = document.createElement("div");
      photoSpace.className = "universe-photo-space";
      photoSpace.id = `universe-photo-space-${index + 1}`;
      photoSpace.hidden = true;
      button.setAttribute("aria-controls", photoSpace.id);
      const photo = document.createElement("img");
      photo.className = "universe-photo-large";
      photo.alt = `Foto de ${title}`;
      const placeholder = document.createElement("div");
      placeholder.className = "universe-photo-empty";
      placeholder.textContent = `Aquí va la foto de ${title}`;
      const choosePhoto = document.createElement("button");
      choosePhoto.className = "universe-add-photo";
      choosePhoto.type = "button";

      const savedPhoto = gift.universePhotos?.[index];
      if (savedPhoto) {
        photo.src = savedPhoto;
        placeholder.hidden = true;
        choosePhoto.hidden = true;
      } else {
        photo.hidden = true;
        choosePhoto.textContent = "Elegir foto ✿";
      }

      button.addEventListener("click", () => {
        const expanded = button.getAttribute("aria-expanded") !== "true";
        button.setAttribute("aria-expanded", String(expanded));
        button.classList.toggle("revealed", expanded);
        button.querySelector(".universe-hint").textContent = expanded ? "nosotrosh ♡" : "✦";
        photoSpace.hidden = !expanded;
      });
      choosePhoto.addEventListener("click", () => input.click());
      input.addEventListener("change", () => {
        const file = input.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        objectUrls.add(url);
        photo.src = url;
        photo.hidden = false;
        placeholder.hidden = true;
        choosePhoto.textContent = "Cambiar foto ✎";
        showToast(`Foto añadida a ${title} ♡`);
        input.value = "";
      });
      button.style.setProperty("--delay", `${index * 35}ms`);
      photoSpace.append(photo, placeholder, choosePhoto);
      entry.append(button, photoSpace, input);
      grid.append(entry);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
  function escapeAttribute(value) { return escapeHtml(value); }

  document.querySelector("#open-letter").addEventListener("click", () => openStory(0));
  document.querySelector("#back-to-cover").addEventListener("click", () => {
    shell.hidden = true;
    cover.hidden = false;
    history.replaceState(null, "", "#inicio");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.querySelector("#open-universes").addEventListener("click", () => dialog.showModal());
  document.querySelector("#petal-button").addEventListener("click", event => {
    const petal = document.createElement("span");
    petal.className = "floating-petal";
    petal.textContent = ["✿", "♡", "✦"][Math.floor(Math.random() * 3)];
    event.currentTarget.append(petal);
    setTimeout(() => petal.remove(), 1700);
    showToast("Te amo y te amare por el resto de la eternidad Zara Nahomi Pineda Silva 💕");
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !dialog.open && !photoDialog.open) return;
    if (!shell.hidden && !dialog.open && !photoDialog.open && (event.key === "ArrowRight" || event.key === "ArrowLeft")) {
      renderChapter(activeChapter + (event.key === "ArrowRight" ? 1 : -1));
    }
  });
  window.addEventListener("beforeunload", () => objectUrls.forEach(url => URL.revokeObjectURL(url)));

  renderNavigation();
  renderPhotos();
  renderSongs();
  renderUniverses();
  const hashMatch = location.hash.match(/parte-(\d)/);
  if (hashMatch) openStory(Number(hashMatch[1]) - 1);
})();
