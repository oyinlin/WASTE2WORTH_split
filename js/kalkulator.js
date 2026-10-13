/* ============================================
   KALKULATOR JS - Multi Jenis Sampah
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  let daftarSampah = [];
  let kecamatanTerpilih = '';

  const kecamatanEl = document.getElementById('kecamatan');
  const jenisEl = document.getElementById('jenisSampah');
  const beratEl = document.getElementById('berat');
  const btnTambah = document.getElementById('btnTambah');
  const btnAjukan = document.getElementById('btnAjukan');
  const bodyTabel = document.getElementById('bodyTabel');
  const tabelSampah = document.getElementById('tabelSampah');
  const emptyState = document.getElementById('emptyState');
  const totalCard = document.getElementById('totalCard');
  const totalNilai = document.getElementById('totalNilai');

  function setError(fieldId, message) {
    const el = document.getElementById('error-' + fieldId);
    if (el) el.textContent = message;
  }

  function clearErrors() {
    ['kecamatan', 'jenis', 'berat'].forEach(id => setError(id, ''));
  }

  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function getHargaJenis(jenis) {
    const option = jenisEl.querySelector('option[value="' + jenis + '"]');
    return option ? parseInt(option.dataset.harga) : 0;
  }

  function getNamaJenis(jenis) {
    const option = jenisEl.querySelector('option[value="' + jenis + '"]');
    return option ? option.textContent.split(' - ')[0] : jenis;
  }

  // ========== TAMBAH ITEM ==========
  btnTambah?.addEventListener('click', () => {
    clearErrors();

    const kecamatan = kecamatanEl.value;
    const jenis = jenisEl.value;
    const berat = parseFloat(beratEl.value);

    let valid = true;

    if (!kecamatan) {
      setError('kecamatan', 'Kecamatan harus dipilih');
      valid = false;
    }

    if (!jenis) {
      setError('jenis', 'Jenis sampah harus dipilih');
      valid = false;
    }

    if (!berat || berat <= 0 || isNaN(berat)) {
      setError('berat', 'Berat harus angka lebih dari 0');
      valid = false;
    } else if (berat > 1000) {
      setError('berat', 'Berat tidak masuk akal (maks 1000 kg)');
      valid = false;
    }

    if (!valid) return;

    kecamatanTerpilih = kecamatan;

    const existingIndex = daftarSampah.findIndex(item => item.jenis === jenis);

    if (existingIndex !== -1) {
      daftarSampah[existingIndex].berat += berat;
    } else {
      daftarSampah.push({
        jenis: jenis,
        nama: getNamaJenis(jenis),
        berat: berat,
        harga: getHargaJenis(jenis)
      });
    }

    jenisEl.value = '';
    beratEl.value = '';
    renderTabel();
    jenisEl.focus();
  });

  // ========== RENDER TABEL ==========
  function renderTabel() {
    if (daftarSampah.length === 0) {
      tabelSampah.style.display = 'none';
      emptyState.style.display = 'block';
      totalCard.style.display = 'none';
      return;
    }

    tabelSampah.style.display = 'table';
    emptyState.style.display = 'none';
    totalCard.style.display = 'block';

    bodyTabel.innerHTML = '';
    let total = 0;

    daftarSampah.forEach((item, index) => {
      const subtotal = item.berat * item.harga;
      total += subtotal;

      const row = document.createElement('tr');
      row.innerHTML = 
        '<td>' + item.nama + '</td>' +
        '<td>' + item.berat + ' kg</td>' +
        '<td>' + formatRupiah(item.harga) + '</td>' +
        '<td><strong>' + formatRupiah(subtotal) + '</strong></td>' +
        '<td><button class="btn-hapus" data-index="' + index + '"><i class="fas fa-trash"></i></button></td>';
      bodyTabel.appendChild(row);
    });

    totalNilai.textContent = formatRupiah(total);

    document.querySelectorAll('.btn-hapus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        hapusItem(index);
      });
    });
  }

  function hapusItem(index) {
    daftarSampah.splice(index, 1);
    renderTabel();
  }

  // ========== AJUKAN ==========
  btnAjukan?.addEventListener('click', () => {
    if (daftarSampah.length === 0) {
      alert('Daftar sampah masih kosong');
      return;
    }

    const currentUser = Auth.getUser();

    // Simpan ke localStorage
    localStorage.setItem('daftarSampah', JSON.stringify(daftarSampah));
    localStorage.setItem('kecamatanTerpilih', kecamatanTerpilih);

    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk melanjutkan');
      window.location.href = 'login.html';
      return;
    }

    showToast('Berhasil! Silakan lengkapi alamat penjemputan.', 'success');

    setTimeout(() => {
      window.location.href = 'form-penjemputan.html';
    }, 1200);
  });

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.innerHTML = '<i class="fas fa-check-circle"></i><span>' + message + '</span>';
    toast.style.cssText = 'position:fixed;top:30px;right:30px;background:#4caf50;color:white;padding:16px 24px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.2);display:flex;align-items:center;gap:12px;font-weight:600;z-index:9999;';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  beratEl?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnTambah.click();
  });

});
