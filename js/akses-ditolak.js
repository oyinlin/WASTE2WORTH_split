/* ============================================
   AKSES DITOLAK JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const user = Auth.getUser();
  const infoText = document.getElementById('infoText');

  if (!user) {
    infoText.textContent = 'Anda belum login. Silakan login terlebih dahulu.';
  } else {
    const roleLabel = {
      pelanggan: 'Pelanggan',
      supir: 'Supir',
      admin: 'Admin'
    };

    infoText.innerHTML = 'Anda login sebagai <strong>' +
      (roleLabel[user.role] || user.role) + '</strong> (' + user.email +
      '). Peran ini tidak memiliki akses ke halaman yang Anda tuju.';
  }

  // Auto redirect ke dashboard setelah 10 detik
  setTimeout(() => {
    if (user) {
      let dashboardUrl = 'dashboard-pelanggan.html';
      if (user.role === 'supir') dashboardUrl = 'dashboard-supir.html';
      if (user.role === 'admin') dashboardUrl = 'dashboard-admin.html';

      window.location.href = dashboardUrl;
    } else {
      window.location.href = 'login.html';
    }
  }, 10000);

});