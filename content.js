console.log("✅ Ekstensi Ambient Light: Versi Smart Crop & Optical Scaling (Level Senior)!");

setInterval(() => {
    const elemenVideo = document.querySelector('video.html5-main-video');
    const kanvasLama = document.getElementById('vibe-ambient-canvas');

    if (elemenVideo && !kanvasLama) {
        pasangAmbientLight(elemenVideo);
    }
}, 1500);

function pasangAmbientLight(elemenVideo) {
    const playerUtama = document.querySelector('.html5-video-player');
    if (!playerUtama) return;

    const kanvasCahaya = document.createElement('canvas');
    kanvasCahaya.id = 'vibe-ambient-canvas';
    
    // TRIK OPTIMASI GPU: OPTICAL SCALING
    kanvasCahaya.style.position = 'absolute';
    kanvasCahaya.style.top = '50%';
    kanvasCahaya.style.left = '50%';
    
    // Ukuran CSS kita buat sangat KECIL (hanya 10% dari layar)
    kanvasCahaya.style.width = '10vw'; 
    kanvasCahaya.style.height = '10vh';
    
    // Tapi kita PERBESAR (Scale) 15x lipat agar menutupi seluruh layar (150vw)
    kanvasCahaya.style.transform = 'translate(-50%, -50%) scale(15)'; 
    kanvasCahaya.style.zIndex = '-1'; 
    kanvasCahaya.style.pointerEvents = 'none';
    
    // Memberi tahu browser untuk mempersiapkan GPU agar tidak kaget (Hardware Acceleration)
    kanvasCahaya.style.willChange = 'transform, filter';

    // Karena di-scale 15x, nilai blur cukup 4px saja (4 * 15 = 60px visual blur). Ini sangat ringan!
    const isDarkTheme = document.documentElement.hasAttribute('dark');
    if (isDarkTheme) {
        kanvasCahaya.style.filter = 'blur(3px) saturate(150%) opacity(0.8)';
    } else {
        kanvasCahaya.style.filter = 'blur(3px) saturate(200%) opacity(0.5)';
        kanvasCahaya.style.mixBlendMode = 'multiply'; 
    }

    playerUtama.insertBefore(kanvasCahaya, playerUtama.firstChild);

    // CSS Perbaikan Fullscreen
    const style = document.createElement('style');
    style.innerHTML = `
        ::backdrop { background: transparent !important; }
        .html5-video-player.ytp-fullscreen, .html5-video-player, #ytd-player {
            background: transparent !important;
            background-color: transparent !important;
            overflow: visible !important;
        }
        #columns, ytd-comments {
            background: rgba(0, 0, 0, 0.9) !important;
            border-radius: 12px; padding: 20px; margin-top: 15px;
        }
        ytd-app, #page-manager { background: transparent !important; }
        #cinematics-container { display: none !important; }
    `;
    document.head.appendChild(style);

    const ctx = kanvasCahaya.getContext('2d', { alpha: false });
    
    let waktuTerakhirRender = 0;
    // FPS kita naikkan sedikit ke 20 agar cahayanya mulus, karena GPU sekarang sudah tidak terbebani
    const TARGET_FPS = 20; 
    const INTERVAL_RENDER = 1000 / TARGET_FPS;

    function renderCahaya(timestamp) {
        if (timestamp - waktuTerakhirRender >= INTERVAL_RENDER) {
            if (elemenVideo && !elemenVideo.paused && !elemenVideo.ended) {
                // Resolusi render internal kanvas
                kanvasCahaya.width = 64;  
                kanvasCahaya.height = 36;
                
                // SOLUSI VIDEO SINEMATIK: SMART CROP
                // Kita potong 12% dari atas dan 12% dari bawah untuk menghindari hardcoded black bars
                const potongY = elemenVideo.videoHeight * 0.12; 
                const tinggiBersih = elemenVideo.videoHeight * 0.76; // (100% - 12% - 12%)

                // Periksa agar video tidak crash jika dimensinya belum terbaca
                if (elemenVideo.videoWidth > 0 && elemenVideo.videoHeight > 0) {
                    ctx.drawImage(
                        elemenVideo,
                        0, potongY, elemenVideo.videoWidth, tinggiBersih, // Koordinat & ukuran sumber yang mau difoto (dicrop)
                        0, 0, kanvasCahaya.width, kanvasCahaya.height // Koordinat & ukuran tujuan di kanvas
                    );
                }
            }
            waktuTerakhirRender = timestamp;
        }
        requestAnimationFrame(renderCahaya);
    }
    
    requestAnimationFrame(renderCahaya);
}