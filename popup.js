const toggleAktif = document.getElementById("toggle-aktif");
const sliderOpacity = document.getElementById("slider-opacity");
const nilaiOpacity = document.getElementById("nilai-opacity");

const DEFAULT_SETTINGS = {
    isAktif: true,
    opacity: 80
};

// Muat pengaturan terakhir ketika popup dibuka.
chrome.storage.local.get(DEFAULT_SETTINGS, (data) => {
    toggleAktif.checked = data.isAktif;
    sliderOpacity.value = data.opacity;
    nilaiOpacity.textContent = `${data.opacity}%`;
});

// Simpan status aktif/nonaktif.
toggleAktif.addEventListener("change", () => {
    chrome.storage.local.set({
        isAktif: toggleAktif.checked
    });
});

// Simpan intensitas cahaya ketika slider digeser.
sliderOpacity.addEventListener("input", () => {
    const opacity = Number(sliderOpacity.value);

    nilaiOpacity.textContent = `${opacity}%`;

    chrome.storage.local.set({ opacity });
});