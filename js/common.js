/* ============================================================
   WASTE2WORTH - JS BERSAMA (dipakai semua halaman)
   Isi: notifikasi, header scroll, hamburger, back-to-top, modal login/register, AOS.
   Dimuat SEBELUM file JS khusus halaman (index.js / layanan.js / dll).
   ============================================================ */

/* ============================================================
   2. FUNGSI UTILITY: NOTIFIKASI
   Menampilkan popup notifikasi kanan bawah layar
   
   Parameter:
   - message (string): teks notifikasi
   - type (string): 'success' (hijau) atau 'error' (merah)
   
   CSS class yang dipakai: .notification, .notification.success, .notification.error
   Animasi: transform translateX dari 400px → 0 (geser dari kanan)
   ============================================================ */
function showNotification(message, type = 'success') {
    // Hapus notifikasi lama jika masih ada (hindari tumpuk)
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) existingNotif.remove();

    // Buat elemen notifikasi
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Delay 100ms sebelum tambah class 'show' agar CSS transition berjalan
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto-hapus setelah 3 detik
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300); // tunggu animasi keluar selesai
    }, 3000);
}


/* ============================================================
   3. HEADER SCROLL EFFECT
   Tambah class 'scrolled' saat scroll > 50px
   Class ini membuat bayangan header lebih tebal (via CSS)
   ============================================================ */
window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 50);
    }
});


/* ============================================================
   4. HAMBURGER MENU (Mobile)
   Toggle class 'active' pada hamburger dan navMenu
   .nav-menu.active → left: 0 (menu geser masuk dari kiri)
   ============================================================ */
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Klik link menu → tutup hamburger menu
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}


/* ============================================================
   5. BACK TO TOP
   Tampilkan tombol saat scroll > 300px
   Klik → smooth scroll ke atas
   ============================================================ */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('show', window.scrollY > 300);
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}


/* ============================================================
   6. MODAL LOGIN / REGISTER
   Fungsi buka/tutup modal popup auth
   ============================================================ */
const modal = document.getElementById('authModal');

/** Buka modal dan langsung ke tab yang diminta (login/register) */
function openModal(type) {
    if (modal) {
        modal.style.display = 'flex';
        switchAuthTab(type);
    }
}

/** Tutup modal */
function closeModal() {
    if (modal) modal.style.display = 'none';
}

/**
 * Ganti tab aktif di modal (Masuk ↔ Daftar)
 * Cara kerja: hapus class 'active' dari semua tab+form, lalu tambah ke yang dipilih
 */
function switchAuthTab(tab) {
    const tabs  = document.querySelectorAll('.tab-auth');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));

    if (tab === 'login') {
        tabs[0]?.classList.add('active');
        document.getElementById('loginForm')?.classList.add('active');
    } else {
        tabs[1]?.classList.add('active');
        document.getElementById('registerForm')?.classList.add('active');
    }
}

// Klik area overlay (di luar kotak modal) → tutup modal
window.onclick = function (event) {
    if (event.target === modal) closeModal();
};


/* ============================================================
   INISIALISASI BERSAMA: DOMContentLoaded
   Dipanggil satu kali saat semua HTML selesai dimuat
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

    /* ---- Inisialisasi AOS (Animate On Scroll) ---- */
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
            disable: false,
            mirror: false,
            anchorPlacement: 'top-bottom'
        });
    }

    /* ---- Inisialisasi komponen UI ---- */
    initHamburger();
    initBackToTop();

    /* ---- Handler form login (di semua halaman) ---- */
    document.getElementById('loginForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        showNotification('Login berhasil! Selamat datang.', 'success');
        closeModal();
    });

    /* ---- Handler form register (di semua halaman) ---- */
    document.getElementById('registerForm')?.addEventListener('submit', function (e) {
        e.preventDefault();
        showNotification('Akun berhasil dibuat! Silakan masuk.', 'success');
        closeModal();
    });
});


/* ============================================================
   EKSPOR FUNGSI KE GLOBAL SCOPE
   Fungsi yang dipanggil via onclick="" di HTML harus ada di global scope
   ============================================================ */
window.openModal       = openModal;
window.closeModal      = closeModal;
window.switchAuthTab   = switchAuthTab;
