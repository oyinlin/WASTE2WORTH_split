/* ============================================
   COMMON JS - Waste2Worth
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== NAVBAR SCROLL ==========
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

  // ========== MOBILE MENU ==========
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    if (navMenu?.classList.contains('active')) {
      icon.classList.replace('fa-bars', 'fa-times');
    } else {
      icon.classList.replace('fa-times', 'fa-bars');
    }
  });

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

  // ========== SMOOTH SCROLL ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

});

// ========== AUTH HELPERS ==========
const Auth = {
  getUser() {
    try {
      return JSON.parse(localStorage.getItem('currentUser'));
    } catch {
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../pages/login.html';
  },
  isLoggedIn() {
    return this.getUser() !== null;
  },
  hasRole(roles) {
    const user = this.getUser();
    if (!user) return false;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  },
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
  rupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  },
  number(angka) {
    return Number(angka).toLocaleString('id-ID');
  },
  tanggal(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
};

// ========== COUNTER ANIMASI ==========
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

// ========== EXPORT KE WINDOW ==========
window.Auth = Auth;
window.Format = Format;
window.animateCounter = animateCounter;