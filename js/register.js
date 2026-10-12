/* ============================================
   REGISTER JS - Registrasi Pelanggan
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('formRegister');
  const btnRegister = document.getElementById('btnRegister');
  const passwordInput = document.getElementById('password');

  // ========== TOGGLE PASSWORD VISIBILITY ==========
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

  // ========== PASSWORD STRENGTH ==========
  const strengthMeter = document.getElementById('passwordStrength');
  const strengthBar = strengthMeter?.querySelector('.strength-bar');
  const strengthText = strengthMeter?.querySelector('.strength-text');

  passwordInput?.addEventListener('input', () => {
    const val = passwordInput.value;

    if (!val) {
      strengthMeter.classList.remove('show');
      return;
    }

    strengthMeter.classList.add('show');

    let score = 0;
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    strengthBar.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');

    if (score <= 2) {
      strengthBar.classList.add('weak');
      strengthText.classList.add('weak');
      strengthText.textContent = 'Lemah';
    } else if (score <= 4) {
      strengthBar.classList.add('medium');
      strengthText.classList.add('medium');
      strengthText.textContent = 'Sedang';
    } else {
      strengthBar.classList.add('strong');
      strengthText.classList.add('strong');
      strengthText.textContent = 'Kuat';
    }
  });

  // ========== HELPER ==========
  function setError(fieldId, message) {
    const el = document.getElementById('error-' + fieldId);
    if (el) el.textContent = message;
  }

  function clearError(fieldId) {
    const el = document.getElementById('error-' + fieldId);
    if (el) el.textContent = '';
  }

  function clearAllErrors() {
    ['nama', 'email', 'telepon', 'alamat', 'password', 'konfirmasi', 'setuju'].forEach(clearError);
  }

  // ========== VALIDATOR ==========
  const validators = {
    nama: (val) => {
      if (!val) return 'Nama lengkap wajib diisi';
      if (val.length < 3) return 'Nama minimal 3 karakter';
      if (val.length > 60) return 'Nama maksimal 60 karakter';
      if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Nama hanya boleh huruf dan spasi';
      return '';
    },
    email: (val) => {
      if (!val) return 'Email wajib diisi';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) return 'Format email tidak valid';
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.email.toLowerCase() === val.toLowerCase())) {
        return 'Email sudah terdaftar, silakan login';
      }
      return '';
    },
    telepon: (val) => {
      if (!val) return 'Nomor HP wajib diisi';
      const clean = val.replace(/[\s-]/g, '');
      if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(clean)) {
        return 'Format nomor HP tidak valid (contoh: 0812-3456-7890)';
      }
      return '';
    },
    alamat: (val) => {
      if (!val) return 'Alamat wajib diisi';
      if (val.length < 10) return 'Alamat minimal 10 karakter';
      if (!/[a-zA-Z]/.test(val)) return 'Alamat harus berisi huruf';
      return '';
    },
    password: (val) => {
      if (!val) return 'Password wajib diisi';
      if (val.length < 6) return 'Password minimal 6 karakter';
      if (val.length > 50) return 'Password maksimal 50 karakter';
      return '';
    },
    konfirmasi: (val) => {
      if (!val) return 'Konfirmasi password wajib diisi';
      if (val !== passwordInput.value) return 'Password tidak sama';
      return '';
    },
    setuju: () => {
      if (!document.getElementById('setuju').checked) {
        return 'Anda harus menyetujui Syarat & Ketentuan';
      }
      return '';
    }
  };

  // ========== REAL-TIME VALIDATION ==========
  ['nama', 'email', 'telepon', 'alamat', 'password', 'konfirmasi'].forEach(fieldId => {
    const input = document.getElementById(fieldId);
    input?.addEventListener('blur', () => {
      const error = validators[fieldId](input.value.trim());
      setError(fieldId, error);
    });
    input?.addEventListener('input', () => {
      if (document.getElementById('error-' + fieldId).textContent) {
        const error = validators[fieldId](input.value.trim());
        setError(fieldId, error);
      }
    });
  });

  // ========== SUBMIT ==========
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    clearAllErrors();

    const data = {
      nama: document.getElementById('nama').value.trim(),
      email: document.getElementById('email').value.trim().toLowerCase(),
      telepon: document.getElementById('telepon').value.trim(),
      alamat: document.getElementById('alamat').value.trim(),
      password: document.getElementById('password').value,
      konfirmasi: document.getElementById('konfirmasi').value
    };

    let isValid = true;
    Object.keys(validators).forEach(fieldId => {
      const val = fieldId === 'setuju' ? '' : (data[fieldId] || '');
      const error = validators[fieldId](val);
      if (error) {
        setError(fieldId, error);
        isValid = false;
      }
    });

    if (!isValid) {
      const firstError = document.querySelector('.error-message:not(:empty)');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Loading state
    btnRegister.disabled = true;
    btnRegister.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      const newUser = {
        id: 'USR-' + Date.now(),
        nama: data.nama,
        email: data.email,
        telepon: data.telepon,
        alamat: data.alamat,
        password: btoa(data.password), // ⚠️ Simulasi, di production pakai backend hash
        role: 'pelanggan',
        tanggalDaftar: new Date().toISOString(),
        saldo: 0,
        totalSetoran: 0
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      showToast('Akun berhasil dibuat! Silakan login.', 'success');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);

    }, 1200);
  });

  // ========== TOAST ==========
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'info-circle') + '"></i> <span>' + message + '</span>';
    toast.style.cssText = 'position:fixed;top:30px;right:30px;background:' + (type === 'success' ? '#4caf50' : '#2196f3') + ';color:white;padding:16px 24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:12px;font-weight:600;z-index:9999;max-width:400px;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

});