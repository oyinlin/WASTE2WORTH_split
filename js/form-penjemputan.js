/* ============================================
   FORM PENJEMPUTAN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== CEK LOGIN ==========
  const currentUser = Auth.getUser();
  
  if (!currentUser) {
    alert('Silakan login terlebih dahulu untuk mengajukan penjemputan');
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.role !== 'pelanggan') {
    window.location.href = 'akses-ditolak.html';
    return;
  }

  // ========== UPDATE NAVBAR ==========
  const navActions = document.getElementById('navActions');
  if (navActions) {
    let dashboardUrl = 'dashboard-pelanggan.html';
    navActions.innerHTML = 
      '<a href="' + dashboardUrl + '" class="btn btn-primary">' +
        '<i class="fas fa-tachometer-alt"></i> Dashboard' +
      '</a>';
  }

  // ========== PREFILL DATA USER ==========
  document.getElementById('nama').value = currentUser.nama || '';
  document.getElementById('telepon').value = currentUser.telepon || '';
  document.getElementById('alamat').value = currentUser.alamat || '';

  // ========== AMBIL DATA SAMPAH DARI KALKULATOR ==========
  const daftarSampah = JSON.parse(localStorage.getItem('daftarSampah') || '[]');
  const kecamatanTerpilih = localStorage.getItem('kecamatanTerpilih') || '';

  if (daftarSampah.length > 0) {
    renderDaftarSampah(daftarSampah);
    
    // Prefill kecamatan
    if (kecamatanTerpilih) {
      document.getElementById('kecamatan').value = kecamatanTerpilih;
    }
  }

  // ========== RENDER DAFTAR SAMPAH ==========
  function renderDaftarSampah(items) {
    document.getElementById('emptySampah').style.display = 'none';
    document.getElementById('daftarSampahBox').style.display = 'block';

    const tbody = document.getElementById('bodySampah');
    tbody.innerHTML = '';
    
    let total = 0;

    items.forEach(item => {
      const subtotal = item.berat * item.harga;
      total += subtotal;

      const row = document.createElement('tr');
      row.innerHTML = 
        '<td><strong>' + item.nama + '</strong></td>' +
        '<td>' + item.berat + ' kg</td>' +
        '<td><strong>Rp ' + subtotal.toLocaleString('id-ID') + '</strong></td>';
      tbody.appendChild(row);
    });

    document.getElementById('totalEstimasi').textContent = 'Rp ' + total.toLocaleString('id-ID');
  }

  // ========== SET MIN DATE ==========
  const tanggalInput = document.getElementById('tanggal');
  const today = new Date();
  today.setDate(today.getDate() + 1); // Minimal besok
  const minDate = today.toISOString().split('T')[0];
  tanggalInput.setAttribute('min', minDate);

  // ========== HELPER ==========
  function setError(fieldId, message) {
    const el = document.getElementById('error-' + fieldId);
    if (el) el.textContent = message;
  }

  function clearErrors() {
    ['nama', 'telepon', 'kecamatan', 'alamat', 'tanggal', 'jam'].forEach(id => setError(id, ''));
  }

  // ========== VALIDASI ==========
  const validators = {
    nama: (val) => {
      if (!val) return 'Nama penerima wajib diisi';
      if (val.length < 3) return 'Nama minimal 3 karakter';
      if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Nama hanya boleh huruf';
      return '';
    },
    telepon: (val) => {
      if (!val) return 'Nomor HP wajib diisi';
      const clean = val.replace(/[\s-]/g, '');
      if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(clean)) {
        return 'Format nomor HP tidak valid';
      }
      return '';
    },
    kecamatan: (val) => {
      if (!val) return 'Kecamatan wajib dipilih';
      return '';
    },
    alamat: (val) => {
      if (!val) return 'Alamat wajib diisi';
      if (val.length < 10) return 'Alamat minimal 10 karakter';
      if (!/[a-zA-Z]/.test(val)) return 'Alamat harus berisi huruf';
      return '';
    },
    tanggal: (val) => {
      if (!val) return 'Tanggal wajib diisi';
      const selected = new Date(val);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      if (selected < tomorrow) return 'Tanggal minimal besok';
      return '';
    },
    jam: (val) => {
      if (!val) return 'Jam wajib dipilih';
      return '';
    }
  };

  // ========== REAL-TIME VALIDATION ==========
  Object.keys(validators).forEach(fieldId => {
    const input = document.getElementById(fieldId);
    if (!input) return;
    
    input.addEventListener('blur', () => {
      const error = validators[fieldId](input.value.trim());
      setError(fieldId, error);
    });
    
    input.addEventListener('input', () => {
      if (document.getElementById('error-' + fieldId).textContent) {
        const error = validators[fieldId](input.value.trim());
        setError(fieldId, error);
      }
    });
  });

  // ========== SUBMIT ==========
  const form = document.getElementById('formPenjemputan');
  const btnSubmit = document.getElementById('btnSubmit');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    // Cek apakah ada sampah
    if (daftarSampah.length === 0) {
      showToast('Tambahkan sampah terlebih dahulu di kalkulator', 'error');
      setTimeout(() => {
        window.location.href = 'kalkulator.html';
      }, 1500);
      return;
    }

    const data = {
      nama: document.getElementById('nama').value.trim(),
      telepon: document.getElementById('telepon').value.trim(),
      kecamatan: document.getElementById('kecamatan').value,
      alamat: document.getElementById('alamat').value.trim(),
      catatan: document.getElementById('catatan').value.trim(),
      tanggal: document.getElementById('tanggal').value,
      jam: document.getElementById('jam').value
    };

    // Validasi semua field
    let isValid = true;
    Object.keys(validators).forEach(fieldId => {
      const error = validators[fieldId](data[fieldId] || '');
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
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    // Simulasi kirim ke server
    setTimeout(() => {
      // Buat ID transaksi
      const trxId = 'TRX-' + Date.now().toString().slice(-8);
      
      // Buat objek pengajuan
      const pengajuan = {
        id: trxId,
        userId: currentUser.id,
        pelangganNama: data.nama,
        telepon: data.telepon,
        kecamatan: data.kecamatan,
        alamat: data.alamat,
        catatan: data.catatan,
        tanggalJemput: data.tanggal,
        jamJemput: data.jam,
        items: daftarSampah,
        totalEstimasi: daftarSampah.reduce((sum, item) => sum + (item.berat * item.harga), 0),
        totalBerat: daftarSampah.reduce((sum, item) => sum + item.berat, 0),
        status: 'Menunggu Verifikasi',
        tanggal: new Date().toISOString()
      };

      // Simpan ke localStorage
      const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
      semuaPengajuan.push(pengajuan);
      localStorage.setItem('pengajuan', JSON.stringify(semuaPengajuan));

      // Hapus data kalkulator (karena sudah dipakai)
      localStorage.removeItem('daftarSampah');
      localStorage.removeItem('kecamatanTerpilih');

      // Update step progress
      document.querySelectorAll('.step')[2].classList.add('active');

      // Notifikasi sukses
      showToast('Pengajuan berhasil! Admin akan memverifikasi.', 'success');

      // Redirect ke riwayat
      setTimeout(() => {
        window.location.href = 'riwayat.html';
      }, 1800);

    }, 1200);
  });

  // ========== TOAST ==========
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = 
      '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle') + '"></i>' +
      '<span>' + message + '</span>';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.4s ease reverse';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

});