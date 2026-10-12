/* ============================================================
   WASTE2WORTH - JS HALAMAN BERANDA (index.html)
   Isi: animasi counter angka di hero section.
   ============================================================ */

/* ============================================================
   7. ANIMASI COUNTER ANGKA
   Menghitung dari 0 ke angka target secara animasi
   Dipakai di hero section (data-count="15234" dll)
   ============================================================ */

/**
 * Animasikan satu elemen counter dari 0 ke target
 * @param {HTMLElement} element - elemen yang ditampilkan
 * @param {number} target - angka akhir yang dituju
 */
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50; // 50 langkah

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target.toLocaleString(); // format ribuan
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 20); // interval 20ms = total ~1 detik
}

/** Setup IntersectionObserver untuk trigger counter saat section hero terlihat */
function initCounters() {
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.stat-number[data-count]').forEach(num => {
                    const target = parseInt(num.getAttribute('data-count'));
                    if (!isNaN(target)) animateCounter(num, target);
                });
                observer.unobserve(entry.target); // hanya sekali
            }
        });
    }, { threshold: 0.5 });

    observer.observe(statsSection);
}


/* ============================================================
   INISIALISASI HALAMAN: DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    initCounters();
});
