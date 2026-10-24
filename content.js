console.log("YouTube Ambient Light: Initialized");

const DEFAULT_SETTINGS = {
    isAktif: true,
    opacity: 80
};

let pengaturan = { ...DEFAULT_SETTINGS };
let temaGelap = document.documentElement.hasAttribute("dark");

// Memeriksa video utama dan memasang ambient light jika belum ada.
setInterval(() => {
    const video = document.querySelector("video.html5-main-video");
    const canvasLama = document.getElementById("vibe-ambient-canvas");

    if (video && !canvasLama) {
        pasangAmbientLight(video);
    }
}, 1500);

function pasangAmbientLight(video) {
    const player = document.querySelector(".html5-video-player");

    if (!player) return;

    const canvas = document.createElement("canvas");
    canvas.id = "vibe-ambient-canvas";

    // Pertahankan pendekatan Optical Scaling.
    Object.assign(canvas.style, {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "10vw",
        height: "10vh",
        transform: "translate(-50%, -50%) scale(15)",
        zIndex: "-1",
        pointerEvents: "none",
        willChange: "transform, filter"
    });

    player.insertBefore(canvas, player.firstChild);

    // Pertahankan CSS dasar dari versi sebelumnya.
    const style = document.createElement("style");
    style.id = "vibe-ambient-style";
    style.textContent = `
        ::backdrop {
            background: transparent !important;
        }
        .html5-video-player.ytp-fullscreen,
        .html5-video-player,
        #ytd-player {
            background: transparent !important;
            background-color: transparent !important;
            overflow: visible !important;
        }

        #columns, ytd-comments {
            background: rgba(0, 0, 0, 0.9) !important;
            border-radius: 12px;
            padding: 20px;
            margin-top: 15px;
        }

        ytd-app, #page-manager {
            background: transparent !important;
        }

        #cinematics-container {
            display: none !important;
        }
    `;

    if (!document.getElementById("vibe-ambient-style")) {
        document.head.appendChild(style);
    }
    const ctx = canvas.getContext("2d", { alpha: false });
    let waktuTerakhirRender = 0;
    const INTERVAL_RENDER = 1000 / 20;

    function renderCahaya(timestamp) {
        if (timestamp - waktuTerakhirRender >= INTERVAL_RENDER) {
            if (!video.paused && !video.ended) {
                // Hindari mereset canvas jika ukurannya tidak berubah.
                if (canvas.width !== 64) canvas.width = 64;
                if (canvas.height !== 36) canvas.height = 36;

                if (video.videoWidth > 0 && video.videoHeight > 0) {
                    const potongY = video.videoHeight * 0.12;
                    const tinggiBersih = video.videoHeight * 0.76;

                    ctx.drawImage(video,0,potongY,video.videoWidth,
                        tinggiBersih,0,0,canvas.width,canvas.height);
                }
            }

            waktuTerakhirRender = timestamp;
        }

        requestAnimationFrame(renderCahaya);
    }

    // Terapkan pengaturan setelah canvas dibuat.
    terapkanPengaturan();
    requestAnimationFrame(renderCahaya);
}

// PBI 5: terapkan pengaturan popup.
// TODO: Buat di dalam pengaturan Youtube / CSS injection
function terapkanPengaturan() {
    const canvas = document.getElementById("vibe-ambient-canvas");

    // Pengaturan tetap tersimpan meskipun canvas belum dibuat.
    if (!canvas) return;

    if (!pengaturan.isAktif) {
        canvas.style.display = "none";
        return;
    }

    canvas.style.display = "block";

    const opacity = Math.max(0,Math.min(100, Number(pengaturan.opacity))) / 100;

    temaGelap = document.documentElement.hasAttribute("dark");

    const filterBase = temaGelap
        ? "blur(4px) saturate(150%)"
        : "blur(4px) saturate(200%)";

    canvas.style.filter = `${filterBase} opacity(${opacity})`;

    if (temaGelap) {
        canvas.style.removeProperty("mix-blend-mode");
    } else {
        canvas.style.mixBlendMode = "multiply";
    }
}

// Baca pengaturan tersimpan saat content script dijalankan.
chrome.storage.local.get(DEFAULT_SETTINGS, (data) => {
    pengaturan = {
        isAktif: data.isAktif,
        opacity: Number(data.opacity)
    };
    terapkanPengaturan();
});

// Dengarkan perubahan dari popup.
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "local") return;
    if (changes.isAktif) {
        pengaturan.isAktif = changes.isAktif.newValue;
    }

    if (changes.opacity) {
        pengaturan.opacity = Number(changes.opacity.newValue);
    }

    terapkanPengaturan();
});

// PBI 3: deteksi perubahan tema tanpa refresh.
const themeObserver = new MutationObserver(() => {
    const temaBaru = document.documentElement.hasAttribute("dark");

    if (temaBaru !== temaGelap) {
        temaGelap = temaBaru;
        terapkanPengaturan();
    }
});

themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["dark"]
});