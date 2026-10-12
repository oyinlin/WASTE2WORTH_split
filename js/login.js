/* ============================================
   LOGIN JS - Logika Login Multi-Peran
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== SEED DATA DEMO (jika belum ada) ==========
  seedDemoUsers();

  const form = document.getElementById('formLogin');
  const btnLogin = document.getElementById('btnLogin');

  // ========== TOGGLE PASSWORD ==========
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
      }
    });
  });

  // ========== SET ERROR ==========
  function setError(fieldId, message) {
    const el = document.getElementById('error-' + fieldId);
    if (el) el.textContent = message;
  }

  function clearErrors() {
    ['email', 'password', 'login'].forEach(id => setError(id, ''));
  }

  // ========== SUBMIT LOGIN ==========
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Validasi
    let isValid = true;

    if (!email) {
      setError('email', 'Email wajib diisi');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'Format email tidak valid');
      isValid = false;
    }

    if (!password) {
      setError('password', 'Password wajib diisi');
      isValid = false;
    }

    if (!isValid) return;

    // Loading state
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    // Simulasi autentikasi (nanti ganti dengan fetch API)
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u =>
        u.email.toLowerCase() === email &&
        atob(u.password) === password
      );

      if (!user) {
        setError('login', 'Email atau password salah');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Masuk';
        return;
      }

      // Simpan session
      const session = {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        telepon: user.telepon,
        alamat: user.alamat
      };

      localStorage.setItem('currentUser', JSON.stringify(session));

      if (remember) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      // Redirect sesuai peran
      let redirectUrl = 'dashboard-pelanggan.html';
      if (user.role === 'supir') redirectUrl = 'dashboard-supir.html';
      if (user.role === 'admin') redirectUrl = 'dashboard-admin.html';

      showToast('Selamat datang, ' + user.nama + '!', 'success');

      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 800);

    }, 1000);
  });

  // ========== AUTO-FILL EMAIL ==========
  const rememberedEmail = localStorage.getItem('rememberEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    document.getElementById('remember').checked = true;
  }

  // ========== ENTER UNTUK SUBMIT ==========
  document.getElementById('password')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') form.requestSubmit();
  });

  // ========== TOAST ==========
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'info-circle') + '"></i> <span>' + message + '</span>';
    toast.style.cssText = 'position: fixed; top: 30px; right: 30px; background: ' + (type === 'success' ? '#4caf50' : '#2196f3') + '; color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 12px; font-weight: 600; z-index: 9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

});

/* ============================================
   SEED DEMO USERS - untuk testing
   ============================================ */
function seedDemoUsers() {
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

  // Cek apakah demo user sudah ada
  const hasDemo = existingUsers.some(u => u.email === 'pelanggan@demo.com');
  if (hasDemo) return;

  const demoUsers = [
    {
      id: 'USR-DEMO-001',
      nama: 'Budi Santoso',
      email: 'pelanggan@demo.com',
      telepon: '0812-3456-7890',
      alamat: 'Jl. Gatot Subroto No. 123, Medan Barat',
      password: btoa('123456'),
      role: 'pelanggan',
      tanggalDaftar: new Date().toISOString(),
      saldo: 0,
      totalSetoran: 0
    },
    {
      id: 'USR-DEMO-002',
      nama: 'Pak Supir Demo',
      email: 'supir@demo.com',
      telepon: '0813-4567-8901',
      alamat: 'Jl. Sudirman No. 45, Medan',
      password: btoa('123456'),
      role: 'supir',
      tanggalDaftar: new Date().toISOString(),
      statusAktif: true
    },
    {
      id: 'USR-DEMO-003',
      nama: 'Admin Waste2Worth',
      email: 'admin@demo.com',
      telepon: '0814-5678-9012',
      alamat: 'Kantor Waste2Worth, Medan',
      password: btoa('123456'),
      role: 'admin',
      tanggalDaftar: new Date().toISOString()
    }
  ];

  localStorage.setItem('users', JSON.stringify([...existingUsers, ...demoUsers]));
}