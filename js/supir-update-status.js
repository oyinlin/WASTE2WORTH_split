/* ============================================
   SUPIR UPDATE STATUS JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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

  document.getElementById('userName').textContent = currentUser.nama || 'Supir';
  document.getElementById('userAvatar').textContent = (currentUser.nama || 'S').charAt(0).toUpperCase();

  const urlParams = new URLSearchParams(window.location.search);
  const trxId = urlParams.get('id');

  if (!trxId) {
    document.getElementById('notFound').style.display = 'block';
    return;
  }

  const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
  const trxIndex = semuaPengajuan.findIndex(t => t.id === trxId);

  if (trxIndex === -1) {
    document.getElementById('notFound').style.display = 'block';
    return;
  }

  const transaksi = semuaPengajuan[trxIndex];
  let selectedStatus = transaksi.status || 'Ditugaskan';

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

  function markActive() {
    document.querySelectorAll('.status-step').forEach(step => {
      step.classList.remove('selected');
      if (step.dataset.status === selectedStatus) {
        step.classList.add('selected');
      }
    });

    const beratBox = document.getElementById('beratBox');
    if (selectedStatus === 'Sedang Diperiksa' || selectedStatus === 'Selesai') {
      beratBox.classList.add('show');
      if (transaksi.beratAktual) {
        document.getElementById('beratAktual').value = transaksi.beratAktual;
      }
    } else {
      beratBox.classList.remove('show');
    }
  }

  markActive();

  document.querySelectorAll('.status-step').forEach(step => {
    step.addEventListener('click', () => {
      selectedStatus = step.dataset.status;
      markActive();
    });
  });

  document.getElementById('btnSimpan').addEventListener('click', () => {
    let beratAktual = null;

    // Validasi berat kalau status "Sedang Diperiksa" atau "Selesai"
    if (selectedStatus === 'Sedang Diperiksa' || selectedStatus === 'Selesai') {
      beratAktual = parseFloat(document.getElementById('beratAktual').value);
      
      if (!beratAktual || beratAktual <= 0 || isNaN(beratAktual)) {
        document.getElementById('error-berat').textContent = 'Berat aktual wajib diisi (angka > 0)';
        return;
      }
      if (beratAktual > 1000) {
        document.getElementById('error-berat').textContent = 'Berat tidak masuk akal (maks 1000 kg)';
        return;
      }
      
      document.getElementById('error-berat').textContent = '';
      semuaPengajuan[trxIndex].beratAktual = beratAktual;
    }

    // Update status
    semuaPengajuan[trxIndex].status = selectedStatus;
    semuaPengajuan[trxIndex].supirId = currentUser.id;
    semuaPengajuan[trxIndex].supirNama = currentUser.nama;
    semuaPengajuan[trxIndex].supirTelepon = currentUser.telepon;
    semuaPengajuan[trxIndex].tanggalUpdate = new Date().toISOString();

    // Simpan catatan
    const catatan = document.getElementById('catatan').value.trim();
    if (catatan) {
      semuaPengajuan[trxIndex].catatanSupir = catatan;
    }

    // Update waktu tiap status
    if (selectedStatus === 'Dijemput') {
      semuaPengajuan[trxIndex].tanggalDijemput = new Date().toISOString();
    } else if (selectedStatus === 'Sedang Diperiksa') {
      semuaPengajuan[trxIndex].tanggalDiperiksa = new Date().toISOString();
    } else if (selectedStatus === 'Selesai') {
      semuaPengajuan[trxIndex].tanggalSelesai = new Date().toISOString();
    }

    // Riwayat status (log lengkap)
    if (!semuaPengajuan[trxIndex].riwayatStatus) {
      semuaPengajuan[trxIndex].riwayatStatus = [];
    }
    semuaPengajuan[trxIndex].riwayatStatus.push({
      status: selectedStatus,
      waktu: new Date().toISOString(),
      oleh: currentUser.nama,
      keterangan: beratAktual ? 'Berat: ' + beratAktual + ' kg' : ''
    });

    // Simpan
    localStorage.setItem('pengajuan', JSON.stringify(semuaPengajuan));

    // Tampilkan sukses
    document.getElementById('formUpdate').style.display = 'none';
    document.getElementById('successState').style.display = 'block';
  });

});