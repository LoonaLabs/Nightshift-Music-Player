const genreFolders = {
  metal: "metal",
  "rap-marocain": "rap-marocain",
  rai: "rai",
  electronic: "electronic",
  blues: "blues",
  orchestral: "orchestral"
};

const genreLabels = {
  metal: "Metal",
  "rap-marocain": "Rap-Marocain",
  rai: "Raï",
  electronic: "Electronic",
  blues: "Blues",
  orchestral: "Orchestral"
};

const songsByGenre = {
  metal: [
    "All-The-Things-She-Said",
    "Bring-Me-To-Life",
    "In-The-End",
    "Nothing-Else-Matters",
    "Numb",
    "Sonne",
    "Still-Loving-You",
    "The-Eagles-Flies-Alon"
  ],

"rap-marocain": [
    "AL-RISSALA",
    "Batal-L3alam",
    "Bladi-Blad",
    "Blue-Love",
    "Dmou3-L7awma",
    "Law-Kan-Lwa9i3-Law7a",
    "LMEHDI-14",
    "LMEHDI-HNA",
    "Mgharba-Tal-Mout",
    "STALINE"
  ],

rai: [
    "Bakhta",
    "Chira-Ly-Nabghiha",
    "Hasdouni-La3rab",
    "Li-Bini-Ou-Binha",
    "Mauvais-Song",
    "Mazal-Souvenir-Andi",
    "Tal-Ghyabek-Ya-Ghzali"
  ],

electronic: [
    "Black-Candelabra-Avernvx",
    "Christopher-Ladex-Elephant",
    "ECHVYM-Under-Skin",
    "Elvis-Crespo-Suavemente",
    "Francis-Mercier-Mahmout-Orhan-Sadete",
    "MoBlack-Yamore",
    "OXEN-ECSTASY",
    "OXEN-ELMATADOR",
    "Rick-Wollflich-Another-Life",
    "Rui-Da-Silva-Touch-Me",
    "Strivv-Fever",
    "Vidojean-X-Oliver-Loenn-Embawe",
    "Vidojean-X-Oliver-Loenn-Waist",
    "Zeyxo-Music-Sandstorm"
  ],

blues: [
    "Built-To-Last",
    "Our-Last-Goodby",
    "Stand-By-Me",
    "Strong-Enough",
    "Tennessee-Whiskey",
    "The-Sky-Is-Crying",
    "Way-Down-We-Go"
  ],

orchestral: [
    "Ameno-ERA",
    "Carol-Of-The-Bells",
    "Conquest-Of-Paradise",
    "Cry-For-The-Moon",
    "Fairytale",
    "Gladiator",
    "O-Fortuna",
    "The-Mass-ERA"
  ]
};

let nextId = 0;

const tracks = Object.entries(songsByGenre).flatMap(
  ([genre, songs]) =>
    songs.map((fileName) => ({
      id: nextId++,
      title: fileName.replaceAll("-", " "),
      artist: "Nightshift Radio",
      genre,
      genreLabel: genreLabels[genre],
      audio: `assets/audio/${genreFolders[genre]}/${fileName}.mp3`,
      cover: `assets/images/${genreFolders[genre]}/${fileName}.jpeg`
    }))
);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const audio = $("#audioPlayer");

let currentTrackId = tracks[0]?.id ?? 0;
let isPlaying = false;
let isRepeatEnabled = false;
let isShuffleEnabled = false;

let likedTracks = JSON.parse(
  localStorage.getItem("likedTracks") || "[]"
);

let recentTracks = JSON.parse(
  localStorage.getItem("recentTracks") || "[]"
);

function getTrack(id) {
  return tracks.find((track) => track.id === id);
}

function saveState() {
  localStorage.setItem("likedTracks", JSON.stringify(likedTracks));
  localStorage.setItem("recentTracks", JSON.stringify(recentTracks));

const likedCount = $("#likedCount");

if (likedCount) {
    likedCount.textContent = likedTracks.length;
  }
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getFilteredTracks(genre = "all", query = "") {
  const normalizedQuery = query.trim().toLowerCase();

return tracks.filter((track) => {
    const matchesGenre =
      genre === "all" || track.genre === genre;

const searchableText = [
      track.title,
      track.artist,
      track.genreLabel
    ]
      .join(" ")
      .toLowerCase();

return (
      matchesGenre &&
      searchableText.includes(normalizedQuery)
    );
  });
}

function createCard(track) {
  return `
    <article class="track-card" data-track-id="${track.id}">
      <div class="track-cover">
        <img src="${track.cover}" alt="${track.title} cover">

<button
          class="card-play"
          data-play-id="${track.id}"
          type="button"
        >
          ▶
        </button>
      </div>

<h3>${track.title}</h3>
      <p>${track.genreLabel}</p>
    </article>
  `;
}

function createRow(track) {
  const isLiked = likedTracks.includes(track.id);

return `
    <div class="track-row" data-track-id="${track.id}">
      <img
        class="row-cover"
        src="${track.cover}"
        alt="${track.title} cover"
      >

<div class="row-info">
        <div class="row-title">${track.title}</div>
        <div class="row-subtitle">
          ${track.genreLabel} · ${track.artist}
        </div>
      </div>

<a
        class="action-link"
        href="${track.audio}"
        download
        title="Download authorized file"
      >
        ↓
      </a>

<a
        class="action-link"
        href="https://www.youtube.com/results?search_query=${encodeURIComponent(track.title)}"
        target="_blank"
        rel="noopener noreferrer"
        title="Search on YouTube"
      >
        ▶
      </a>

<button
        class="like-button ${isLiked ? "liked" : ""}"
        data-like-id="${track.id}"
        type="button"
        aria-label="Like ${track.title}"
      >
        ${isLiked ? "♥" : "♡"}
      </button>
    </div>
  `;
}

function renderHome(query = "") {
  const visibleTracks = getFilteredTracks("all", query);

$("#pageView").innerHTML = `
    <section class="hero">
      <div>
        <span class="eyebrow">Your late-night soundtrack</span>

<h1>
          Music is not a hobby,<br>
          <em>It's a heartbeat.</em>
        </h1>

<p>
          Curated sounds for long drives, deep focus,
          and the hours when the city goes quiet.
        </p>
      </div>

<img
        class="hero-cover"
        src="${tracks[0].cover}"
        alt="Nightshift cover"
      >
    </section>

<div class="section-title">
      <h2>Genres</h2>
    </div>

<div class="genre-chips">
      ${Object.entries(genreLabels)
        .map(
          ([genre, label]) => `
            <button
              class="genre-chip"
              data-genre-link="${genre}"
              type="button"
            >
              ${label}
            </button>
          `
        )
        .join("")}
    </div>

<div class="section-title">
      <h2>Made for tonight</h2>
    </div>

<div class="track-grid">
      ${
        visibleTracks.length
          ? visibleTracks
              .slice(0, 8)
              .map(createCard)
              .join("")
          : `<div class="empty">No songs found.</div>`
      }
    </div>
  `;

bindDynamicElements();
}

function renderList(title, visibleTracks) {
  $("#pageView").innerHTML = `
    <section class="hero">
      <div>
        <span class="eyebrow">Nightshift library</span>
        <h1>${title}</h1>
        <p>${visibleTracks.length} tracks ready when you are.</p>
      </div>
    </section>

${
      visibleTracks.length
        ? `
          <div class="track-list">
            ${visibleTracks.map(createRow).join("")}
          </div>
        `
        : `<div class="empty">Nothing here yet.</div>`
    }
  `;

bindDynamicElements();
}

function renderPage(page = "home", genre = "all", query = "") {
  if (page === "home") {
    renderHome(query);
    return;
  }

if (page === "liked") {
    const liked = tracks.filter((track) =>
      likedTracks.includes(track.id)
    );

renderList("Liked Songs", liked);
    return;
  }

if (page === "recent") {
    const recent = recentTracks
      .map((id) => getTrack(id))
      .filter(Boolean);

renderList("Recently Played", recent);
    return;
  }

const title =
    genre === "all"
      ? "Discover"
      : genreLabels[genre];

renderList(title, getFilteredTracks(genre, query));
}

function setActiveNavigation(page, genre = "all") {
  $$(".nav-item").forEach((button) => {
    const pageIsActive =
      button.dataset.page === page;

const genreIsActive =
      button.dataset.genre === genre;

button.classList.toggle(
      "active",
      pageIsActive || genreIsActive
    );
  });
}

function openPage(page, genre = "all") {
  setActiveNavigation(page, genre);
  renderPage(page, genre, $("#searchInput").value);

$("#sidebar")?.classList.remove("open");
}

function playTrack(id) {
  const track = getTrack(id);

if (!track || !audio) {
    return;
  }

currentTrackId = id;
  audio.src = track.audio;
  audio.load();

recentTracks = [
    id,
    ...recentTracks.filter((trackId) => trackId !== id)
  ].slice(0, 12);

saveState();
  updatePlayer();

audio
    .play()
    .then(() => {
      isPlaying = true;
      updatePlayer();
    })
    .catch(() => {
      showToast(
        "Audio could not play. Check the MP3 file."
      );
    });
}

function updatePlayer() {
  const track = getTrack(currentTrackId);

if (!track) {
    return;
  }

$("#playerTitle").textContent = track.title;
  $("#playerArtist").textContent = track.genreLabel;
  $("#playerCover").src = track.cover;

$("#playButton").textContent = isPlaying
    ? "Ⅱ"
    : "▶";

const liked = likedTracks.includes(track.id);

$("#playerLike").textContent = liked ? "♥" : "♡";
  $("#playerLike").classList.toggle("liked", liked);
}

function toggleLike(id) {
  if (likedTracks.includes(id)) {
    likedTracks = likedTracks.filter(
      (trackId) => trackId !== id
    );
  } else {
    likedTracks.push(id);
  }

saveState();
  updatePlayer();

const activePage =
    $(".nav-item.active")?.dataset.page || "home";

const activeGenre =
    $(".nav-item.active")?.dataset.genre || "all";

renderPage(
    activePage,
    activeGenre,
    $("#searchInput").value
  );
}

function playNext() {
  if (!tracks.length) {
    return;
  }

let nextTrack;

if (isShuffleEnabled) {
    const randomIndex = Math.floor(
      Math.random() * tracks.length
    );

nextTrack = tracks[randomIndex];
  } else {
    const currentIndex = tracks.findIndex(
      (track) => track.id === currentTrackId
    );

nextTrack =
      tracks[(currentIndex + 1) % tracks.length];
  }

playTrack(nextTrack.id);
}

function playPrevious() {
  if (!tracks.length) {
    return;
  }

const currentIndex = tracks.findIndex(
    (track) => track.id === currentTrackId
  );

const previousIndex =
    (currentIndex - 1 + tracks.length) % tracks.length;

playTrack(tracks[previousIndex].id);
}

function showToast(message) {
  const toast = $("#toast");

if (!toast) {
    return;
  }

toast.textContent = message;
  toast.classList.add("visible");

clearTimeout(showToast.timeout);

showToast.timeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 3000);
}

function bindDynamicElements() {
  $$(".track-card, .track-row").forEach((element) => {
    element.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) {
        return;
      }

playTrack(Number(element.dataset.trackId));
    });
  });

$$("[data-play-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      playTrack(Number(button.dataset.playId));
    });
  });

$$("[data-like-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleLike(Number(button.dataset.likeId));
    });
  });

$$("[data-genre-link]").forEach((button) => {
    button.addEventListener("click", () => {
      openPage("discover", button.dataset.genreLink);
    });
  });
}

$$("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    openPage(button.dataset.page, "all");
  });
});

$$("[data-genre]").forEach((button) => {
  button.addEventListener("click", () => {
    openPage("discover", button.dataset.genre);
  });
});

$("#playButton").addEventListener("click", () => {
  if (!audio.src) {
    playTrack(currentTrackId);
    return;
  }

if (audio.paused) {
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }

updatePlayer();
});

$("#nextButton").addEventListener("click", playNext);
$("#previousButton").addEventListener("click", playPrevious);

$("#shuffleButton").addEventListener("click", () => {
  isShuffleEnabled = !isShuffleEnabled;

$("#shuffleButton").classList.toggle(
    "liked",
    isShuffleEnabled
  );
});

$("#repeatButton").addEventListener("click", () => {
  isRepeatEnabled = !isRepeatEnabled;

$("#repeatButton").classList.toggle(
    "liked",
    isRepeatEnabled
  );
});

$("#playerLike").addEventListener("click", () => {
  toggleLike(currentTrackId);
});

$("#volumeBar").addEventListener("input", (event) => {
  audio.volume = Number(event.target.value);
});

$("#progressBar").addEventListener("input", (event) => {
  if (!audio.duration) {
    return;
  }

audio.currentTime =
    (Number(event.target.value) / 100) *
    audio.duration;
});

audio.addEventListener("timeupdate", () => {
  $("#currentTime").textContent =
    formatTime(audio.currentTime);

$("#duration").textContent =
    formatTime(audio.duration);

if (audio.duration) {
    $("#progressBar").value =
      (audio.currentTime / audio.duration) * 100;
  }
});

audio.addEventListener("ended", () => {
  if (isRepeatEnabled) {
    playTrack(currentTrackId);
  } else {
    playNext();
  }
});

$("#searchInput").addEventListener("input", (event) => {
  renderPage("discover", "all", event.target.value);
});

$("#mobileMenu").addEventListener("click", () => {
  $("#sidebar").classList.toggle("open");
});

$("#themeButton").addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
});

document.addEventListener("keydown", (event) => {
  if (
    (event.ctrlKey || event.metaKey) &&
    event.key.toLowerCase() === "k"
  ) {
    event.preventDefault();
    $("#searchInput").focus();
  }
});

audio.volume = 0.8;

saveState();
renderPage();
updatePlayer();

