/* ============================================
   SUPIR UPDATE STATUS JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== CEK LOGIN ==========
  const currentUser = Auth.getUser();
  
  if (!currentUser) {
    alert('Silakan login terlebih dahulu');
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.role !== 'supir') {
    window.location.href = 'akses-ditolak.html';
    return;
  }

  // ========== TAMPILKAN USER ==========
  document.getElementById('userName').textContent = currentUser.nama || 'Supir';
  document.getElementById('userAvatar').textContent = (currentUser.nama || 'S').charAt(0).toUpperCase();

  // ========== AMBIL ID DARI URL ==========
  const urlParams = new URLSearchParams(window.location.search);
  const trxId = urlParams.get('id');

  if (!trxId) {
    document.getElementById('notFound').style.display = 'block';
    return;
  }

  // ========== CARI TRANSAKSI ==========
  const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
  const trxIndex = semuaPengajuan.findIndex(t => t.id === trxId);

  if (trxIndex === -1) {
    document.getElementById('notFound').style.display = 'block';
    return;
  }

  const transaksi = semuaPengajuan[trxIndex];
  let selectedStatus = transaksi.status || 'Ditugaskan';

  // ========== TAMPILKAN FORM ==========
  document.getElementById('formUpdate').style.display = 'block';

  // Info transaksi
  document.getElementById('infoId').textContent = transaksi.id;
  document.getElementById('infoPelanggan').textContent = transaksi.pelangganNama || '-';
  document.getElementById('infoAlamat').textContent = transaksi.alamat || '-';
  
  let estimasiBerat = 0;
  if (transaksi.items && Array.isArray(transaksi.items)) {
    estimasiBerat = transaksi.items.reduce((sum, i) => sum + (i.berat || 0), 0);
  }
  document.getElementById('infoEstimasiBerat').textContent = estimasiBerat.toFixed(1) + ' kg';
  document.getElementById('infoStatusSaat').textContent = transaksi.status || '-';

  // ========== MARK STATUS AKTIF ==========
  function markActive() {
    document.querySelectorAll('.status-step').forEach(step => {
      step.classList.remove('selected');
      if (step.dataset.status === selectedStatus) {
        step.classList.add('selected');
      }
    });

    // Tampilkan input berat kalau pilih "Sedang Diperiksa" atau "Selesai"
    const beratBox = document.getElementById('beratBox');
    if (selectedStatus === 'Sedang Diperiksa' || selectedStatus === 'Selesai') {
      beratBox.classList.add('show');
      // Prefill berat kalau sudah ada
      if (transaksi.beratAktual) {
        document.getElementById('beratAktual').value = transaksi.beratAktual;
      }
    } else {
      beratBox.classList.remove('show');
    }
  }

  markActive();

  // ========== KLIK STATUS ==========
  document.querySelectorAll('.status-step').forEach(step => {
    step.addEventListener('click', () => {
      selectedStatus = step.dataset.status;
      markActive();
    });
  });

  // ========== SIMPAN ==========
  document.getElementById('btnSimpan').addEventListener('click', () => {
    // Validasi berat kalau status "Sedang Diperiksa" atau "Selesai"
    if (selectedStatus === 'Sedang Diperiksa' || selectedStatus === 'Selesai') {
      const beratAktual = parseFloat(document.getElementById('beratAktual').value);
      
      if (!beratAktual || beratAktual <= 0 || isNaN(beratAktual)) {
        document.getElementById('error-berat').textContent = 'Berat aktual wajib diisi (angka > 0)';
        return;
      }
      if (beratAktual > 1000) {
        document.getElementById('error-berat').textContent = 'Berat tidak masuk akal (maks 1000 kg)';
        return;
      }
      
      document.getElementById('error-berat').textContent = '';
      
      // Simpan berat aktual
      semuaPengajuan[trxIndex].beratAktual = beratAktual;
    }

    // Update status
    semuaPengajuan[trxIndex].status = selectedStatus;
    semuaPengajuan[trxIndex].supirId = currentUser.id;
    semuaPengajuan[trxIndex].supirNama = currentUser.nama;
    semuaPengajuan[trxIndex].tanggalUpdate = new Date().toISOString();

    // Simpan catatan
    const catatan = document.getElementById('catatan').value.trim();
    if (catatan) {
      semuaPengajuan[trxIndex].catatanSupir = catatan;
    }

    // Update waktu
    if (!semuaPengajuan[trxIndex].riwayatStatus) {
      semuaPengajuan[trxIndex].riwayatStatus = [];
    }
    semuaPengajuan[trxIndex].riwayatStatus.push({
      status: selectedStatus,
      waktu: new Date().toISOString(),
      oleh: currentUser.nama
    });

    // Simpan ke localStorage
    localStorage.setItem('pengajuan', JSON.stringify(semuaPengajuan));

    // Tampilkan sukses
    document.getElementById('formUpdate').style.display = 'none';
    document.getElementById('successState').style.display = 'block';
  });

});