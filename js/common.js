/* ============================================
   GLOBAL JS - Waste2Worth
   Berlaku untuk semua halaman
   ============================================ */

// ========== NAVBAR SCROLL EFFECT ==========
const navbar = document.getElementById('navbar');
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar?.classList.add('scrolled');
    scrollTopBtn?.classList.add('show');
  } else {
    navbar?.classList.remove('scrolled');
    scrollTopBtn?.classList.remove('show');
  }
});

// ========== MOBILE MENU TOGGLE ==========
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle?.addEventListener('click', () => {
  navMenu?.classList.toggle('active');
  
  // Ganti ikon
  const icon = navToggle.querySelector('i');
  if (navMenu?.classList.contains('active')) {
    icon.classList.remove('fa-bars');
    icon.classList.add('fa-times');
  } else {
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
  }
});

// Tutup menu saat link diklik
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu?.classList.remove('active');
    const icon = navToggle?.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });
});

// ========== SCROLL TO TOP ==========
scrollTopBtn?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== SMOOTH SCROLL UNTUK ANCHOR ==========
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80; // Tinggi navbar
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ========== AUTH HELPERS ==========
const Auth = {
  // Ambil user yang sedang login
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
      return null;
    }
  },
  
  // Simpan user yang login
  setUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  
  // Logout
  logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../pages/login.html';
  },
  
  // Cek apakah user sudah login
  isLoggedIn() {
    return this.getUser() !== null;
  },
  
  // Cek role user
  hasRole(roles) {
    const user = this.getUser();
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  },
  
  // Proteksi halaman (redirect jika tidak login / role salah)
  requireRole(roles) {
    const user = this.getUser();
    if (!user) {
      window.location.href = '../pages/login.html';
      return false;
    }
    if (roles && !this.hasRole(roles)) {
      window.location.href = '../pages/akses-ditolak.html';
      return false;
    }
    return true;
  }
};

// ========== FORMAT HELPERS ==========
const Format = {
  // Format rupiah
  rupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  },
  
  // Format angka
  number(angka) {
    return Number(angka).toLocaleString('id-ID');
  },
  
  // Format tanggal
  tanggal(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  },
  
  // Format tanggal + waktu
  tanggalWaktu(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// ========== ANIMASI COUNTER ==========
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Format.number(target);
      clearInterval(timer);
    } else {
      element.textContent = Format.number(Math.floor(current));
    }
  }, 16);
}

// ========== EXPORT KE WINDOW (untuk akses global) ==========
window.Auth = Auth;
window.Format = Format;
window.animateCounter = animateCounter;