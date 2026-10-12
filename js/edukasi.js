/* ============================================================
   WASTE2WORTH - JS HALAMAN EDUKASI (edukasi.html)
   Isi: video edukasi (modal, Picture-in-Picture, fullscreen).
   ============================================================ */

/* ============================================================
   14. VIDEO EDUKASI (edukasi.html)
   ============================================================ */

/** Buka video modal dan mulai putar video */
function playVideo(videoSrc) {
    const videoModal  = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoModal && videoPlayer) {
        videoPlayer.src = videoSrc;
        videoModal.classList.add('active');
        videoPlayer.play();
    }
}

/** Tutup video modal dan pause video */
function closeVideoModal() {
    const videoModal  = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoModal && videoPlayer) {
        videoPlayer.pause();
        videoPlayer.src = '';
        videoModal.classList.remove('active');
    }
}

/**
 * Picture-in-Picture (PiP): video mengapung di atas halaman lain
 * Browser perlu mendukung PiP API (Chrome, Edge, Safari)
 */
function togglePip(videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;

    if (document.pictureInPictureElement) {
        document.exitPictureInPicture(); // keluar dari PiP jika sudah aktif
    } else if (document.pictureInPictureEnabled) {
        video.requestPictureInPicture();
    }
}

/**
 * Fullscreen: tampilkan video fullscreen
 * Mendukung prefix webkit (Safari) dan ms (IE/Edge lama)
 */
function toggleFullscreen(videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;

    if (!document.fullscreenElement) {
        // Masuk fullscreen (coba semua prefix)
        (video.requestFullscreen || video.webkitRequestFullscreen || video.msRequestFullscreen).call(video);
    } else {
        // Keluar fullscreen
        (document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen).call(document);
    }
}


/* ============================================================
   INISIALISASI HALAMAN: DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

    /* ---- Handler tutup video modal (edukasi.html) ---- */
    document.getElementById('closeVideoModal')?.addEventListener('click', closeVideoModal);

    /* ---- Tutup video modal dengan tombol ESC ---- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideoModal();
        }
    });
});


/* ============================================================
   EKSPOR FUNGSI KE GLOBAL SCOPE (dipanggil via onclick="" di HTML)
   ============================================================ */
window.playVideo       = playVideo;
window.closeVideoModal = closeVideoModal;
window.toggleFullscreen = toggleFullscreen;
window.togglePip       = togglePip;
