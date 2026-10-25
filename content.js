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

        .html5-video-player,
        #ytd-player {
            background: transparent !important;
            background-color: transparent !important;
            overflow: visible !important;
        }

        #cinematics-container {
            display: none !important;
        }
    `;
  
    if (!document.getElementById("vibe-ambient-style")) {
        document.head.appendChild(style);
    }
    const ctx = canvas.getContext("2d", { alpha: false });
    
    // --- MANAJEMEN RENDER & OPTIMASI TINGKAT LANJUT ---
        const TARGET_FPS = 20; 
    const INTERVAL_RENDER = 1000 / TARGET_FPS;
    // Jadwal target render berikutnya (menggantikan waktuTerakhirRender)
    let waktuRenderBerikutnya = null;
    
    let renderLoopId = null;
    let isFramePertama = true; // Mencegah kilatan hitam, frame pertama langsung 100% opacity
    
    // Deteksi dukungan RVFC dari browser
    const isMendukungRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

    function renderCahaya(now, metadata) {
        renderLoopId = null;

        if (!pengaturan.isAktif || video.paused || video.ended) {
            return; 
        }

        const timestamp = metadata ? metadata.expectedDisplayTime : now;

        // Inisialisasi jadwal saat render pertama atau setelah reset
        if (waktuRenderBerikutnya === null) {
            waktuRenderBerikutnya = timestamp;
        }

        // Eksekusi render jika waktu saat ini sudah mencapai atau melewati jadwal
        if (timestamp >= waktuRenderBerikutnya) {
            if (canvas.width !== 64) canvas.width = 64;
            if (canvas.height !== 36) canvas.height = 36;

            if (video.videoWidth > 0 && video.videoHeight > 0) {
                const potongY = video.videoHeight * 0.12;
                const tinggiBersih = video.videoHeight * 0.76;

                // Frame pertama langsung tampil penuh, berikutnya bercampur untuk efek smoothing
                ctx.globalAlpha = isFramePertama ? 1.0 : 0.3;

                ctx.drawImage(
                    video,
                    0, potongY, video.videoWidth, tinggiBersih,
                    0, 0, canvas.width, canvas.height
                );

                isFramePertama = false;
            }

            // Pertahankan jadwal target agar tidak selalu bergeser berdasarkan waktu render aktual
            do {
                waktuRenderBerikutnya += INTERVAL_RENDER;
            } while (waktuRenderBerikutnya <= timestamp);
        }

        // Tetap gunakan mekanisme callback yang sudah ada
        jadwalkanRender();
    }

    // FUNGSI KONTROL SIKLUS (Anti Double-Loop)
    function jadwalkanRender() {
        if (renderLoopId !== null) return; // Mencegah dua siklus berjalan bersamaan
        
        if (isMendukungRVFC) {
            renderLoopId = video.requestVideoFrameCallback(renderCahaya);
        } else {
            renderLoopId = requestAnimationFrame(renderCahaya);
        }
    }

    function hentikanRender() {
        if (renderLoopId === null) return;
        
        if (isMendukungRVFC) {
            video.cancelVideoFrameCallback(renderLoopId);
        } else {
            cancelAnimationFrame(renderLoopId);
        }
        renderLoopId = null;
    }

    // EVENT LISTENERS UNTUK KONTROL SIKLUS OTOMATIS
    video.addEventListener('play', () => {
        isFramePertama = true; 
        waktuRenderBerikutnya = null; // Tambahan Patch: Reset jadwal
        
        if (pengaturan.isAktif) jadwalkanRender();
    });

    video.addEventListener('pause', hentikanRender);
    video.addEventListener('ended', hentikanRender);
    
    video.addEventListener('seeked', () => {
        isFramePertama = true; 
        waktuRenderBerikutnya = null; // Tambahan Patch: Reset jadwal saat di-skip
    });

    // Mulai render pertama kali jika video sedang berjalan
    if (!video.paused && pengaturan.isAktif) {
        jadwalkanRender();
    }
}

// PBI 5: terapkan pengaturan popup.
// TODO: Buat di dalam pengaturan Youtube / CSS injection
function terapkanPengaturan() {
    const canvas = document.getElementById("vibe-ambient-canvas");
    const video = document.querySelector("video.html5-main-video");

    if (!canvas) return;

    if (!pengaturan.isAktif) {
        canvas.style.display = "none";
        // Panggil event pause tiruan agar render berhenti
        if (video) video.dispatchEvent(new Event('pause')); 
        return;
    }

    canvas.style.display = "block";
    const opacity = Math.max(0, Math.min(100, Number(pengaturan.opacity))) / 100;
    
    temaGelap = document.documentElement.hasAttribute("dark");
    const filterBase = temaGelap ? "blur(4px) saturate(150%)" : "blur(4px) saturate(200%)";
    
    canvas.style.filter = `${filterBase} opacity(${opacity})`;

    if (temaGelap) {
        canvas.style.removeProperty("mix-blend-mode");
    } else {
        canvas.style.mixBlendMode = "multiply";
    }

    // Pemicu agar saat dinyalakan dari mati, render berjalan lagi
    if (video && !video.paused) {
        video.dispatchEvent(new Event('play')); 
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

// PBI 6: Kontrol Ambient Light di menu pengaturan YouTube.

let ambientMenuControls = null;
let timeoutSimpanOpacity = null;

function perbaruiKontrolAmbient() {
    if (!ambientMenuControls) return;

    const { toggle, slider, nilai, panelOpacity } = ambientMenuControls;

    toggle.setAttribute("aria-checked", String(pengaturan.isAktif));
    toggle.querySelector(".ytp-menuitem-content").textContent =
        pengaturan.isAktif ? "Aktif" : "Nonaktif";

    // Tampilkan pengaturan intensitas hanya saat Ambient Light aktif.
    panelOpacity.hidden = !pengaturan.isAktif;

    slider.value = pengaturan.opacity;
    nilai.textContent = `${pengaturan.opacity}%`;
}

function tambahKontrolAmbient(player) {
    const menu = player.querySelector(
        ".ytp-settings-menu .ytp-panel-menu"
    );

    if (!menu || menu.querySelector("#vibe-ambient-controls")) {
        return;
    }

    const controls = document.createElement("div");
    controls.id = "vibe-ambient-controls";

    // Baris toggle dengan gaya menu YouTube.
    const toggle = document.createElement("div");
    toggle.className = "ytp-menuitem";
    toggle.setAttribute("role", "menuitemcheckbox");
    toggle.setAttribute("tabindex", "0");
    toggle.setAttribute("aria-checked", String(pengaturan.isAktif));

    toggle.innerHTML = `
        <div class="ytp-menuitem-icon">
            <svg viewBox="0 0 24 24" width="24" height="24"
                 aria-hidden="true">
                <path fill="currentColor"
                    d="M12 2a7 7 0 0 0-4 12.75V17h8v-2.25A7 7 0 0 0 12 2zm3 11.5-.5.35V15h-5v-1.15l-.5-.35a5 5 0 1 1 6 0zM9 19h6v-1H9v1zm1 2h4v-1h-4v1z"/>
            </svg>
        </div>
        <div class="ytp-menuitem-label">Ambient Light</div>
        <div class="ytp-menuitem-content"></div>
    `;

    function toggleAmbient() {
        const aktifBaru = !pengaturan.isAktif;

        // Perbarui efek langsung.
        pengaturan.isAktif = aktifBaru;
        terapkanPengaturan();
        perbaruiKontrolAmbient();

        // Simpan agar popup dan YouTube tetap sinkron.
        chrome.storage.local.set({
            isAktif: aktifBaru
        });
    }

    toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        toggleAmbient();
    });

    toggle.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            toggleAmbient();
        }
    });

    // Bagian pengatur intensitas cahaya.
    const panelOpacity = document.createElement("div");
    panelOpacity.className = "vibe-ambient-opacity";

    panelOpacity.innerHTML = `
        <div class="vibe-ambient-opacity-header">
            <label for="vibe-ambient-opacity-slider">
                Intensitas cahaya
            </label>
            <span id="vibe-ambient-opacity-value">50%</span>
        </div>

        <input
            type="range"
            id="vibe-ambient-opacity-slider"
            min="0"
            max="100"
            step="5"
            value="${pengaturan.opacity}"
            aria-label="Intensitas cahaya ambient"
        >
    `;

    const slider = panelOpacity.querySelector("input");
    const nilai = panelOpacity.querySelector(
        "#vibe-ambient-opacity-value"
    );

    function simpanOpacity() {
        clearTimeout(timeoutSimpanOpacity);

        chrome.storage.local.set({
            opacity: pengaturan.opacity
        });
    }

    slider.addEventListener("input", (event) => {
        event.stopPropagation();

        const opacity = Number(slider.value);

        // Terapkan perubahan secara langsung tanpa menunggu storage.
        pengaturan.opacity = opacity;
        nilai.textContent = `${opacity}%`;

        terapkanPengaturan();

        // Debounce agar tidak menulis storage pada setiap gerakan slider.
        clearTimeout(timeoutSimpanOpacity);
        timeoutSimpanOpacity = setTimeout(simpanOpacity, 150);
    });

    slider.addEventListener("change", () => {
        simpanOpacity();
    });

    // Cegah interaksi slider mengganggu navigasi menu YouTube.
    ["click", "pointerdown", "pointerup", "keydown", "keyup"].forEach(
        (eventName) => {
            slider.addEventListener(eventName, (event) => {
                event.stopPropagation();
            });
        }
    );

    controls.append(toggle, panelOpacity);
    menu.appendChild(controls);

    ambientMenuControls = {
        toggle,
        slider,
        nilai,
        panelOpacity
    };

    pasangStyleKontrolAmbient();
    perbaruiKontrolAmbient();
}

function pasangStyleKontrolAmbient() {
    if (document.getElementById("vibe-ambient-controls-style")) {
        return;
    }

    const style = document.createElement("style");
    style.id = "vibe-ambient-controls-style";

    style.textContent = `
        #vibe-ambient-controls {
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            margin-top: 4px;
            padding-top: 4px;
        }

        #vibe-ambient-controls .vibe-ambient-opacity {
            padding: 10px 16px 14px 48px;
            box-sizing: border-box;
            color: inherit;
            font-family: inherit;
        }

        #vibe-ambient-controls .vibe-ambient-opacity-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 8px;
            font-size: 12px;
        }

        #vibe-ambient-controls .vibe-ambient-opacity-header label {
            color: inherit;
        }

        #vibe-ambient-controls #vibe-ambient-opacity-value {
            min-width: 35px;
            text-align: right;
            opacity: 0.8;
        }

        #vibe-ambient-controls #vibe-ambient-opacity-slider {
            display: block;
            width: 100%;
            margin: 0;
            padding: 0;
            cursor: pointer;
            accent-color: #f00;
        }
    `;

    document.head.appendChild(style);
}

// Sinkronisasi dengan popup ekstensi.
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== "local") return;

    if (changes.isAktif) {
        pengaturan.isAktif = changes.isAktif.newValue;
    }

    if (changes.opacity) {
        pengaturan.opacity = Number(changes.opacity.newValue);
    }

    perbaruiKontrolAmbient();
});

// YouTube membangun menu secara dinamis, jadi amati perubahan DOM.
const playerObserver = new MutationObserver(() => {
    const player = document.querySelector(".html5-video-player");

    if (player) {
        tambahKontrolAmbient(player);
    }
});

playerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});