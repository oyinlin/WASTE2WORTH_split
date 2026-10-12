/* ============================================
   INDEX JS - Khusus Beranda
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== COUNTER ANIMASI ==========
  const statElements = document.querySelectorAll('.stat-item h3[data-count]');

  const observerStats = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        animateCounter(el, target, 2000);
        observerStats.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statElements.forEach(el => observerStats.observe(el));

  // ========== FADE IN ANIMASI ==========
  const animatedElements = document.querySelectorAll(
    '.feature-card, .step-card, .testimonial-card, .news-card'
  );

  const observerAnim = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
        observerAnim.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observerAnim.observe(el);
  });

  // ========== NAVBAR ACTIVE LINK SAAT SCROLL ==========
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  });

  // ========== CEK LOGIN ==========
  const currentUser = Auth.getUser();
  if (currentUser) {
    const navActions = document.querySelector('.nav-actions');
    if (navActions) {
      let dashboardUrl = 'pages/dashboard-pelanggan.html';
      if (currentUser.role === 'supir') dashboardUrl = 'pages/dashboard-supir.html';
      if (currentUser.role === 'admin') dashboardUrl = 'pages/dashboard-admin.html';

      navActions.innerHTML = 
        '<a href="' + dashboardUrl + '" class="btn btn-primary"><i class="fas fa-tachometer-alt"></i> Dashboard</a>' +
        '<button onclick="Auth.logout()" class="btn btn-outline"><i class="fas fa-sign-out-alt"></i> Keluar</button>';
    }
  }

});