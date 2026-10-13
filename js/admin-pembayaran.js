/* ============================================
   ADMIN PEMBAYARAN JS - Final
   Proses Bayar → Otomatis "Dana Diterima"
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const currentUser = Auth.getUser();
  
  if (!currentUser) {
    alert('Silakan login terlebih dahulu');
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.role !== 'admin') {
    window.location.href = 'akses-ditolak.html';
    return;
  }

  document.getElementById('userName').textContent = currentUser.nama || 'Admin';
  document.getElementById('userAvatar').textContent = (currentUser.nama || 'A').charAt(0).toUpperCase();

  let filterAktif = 'perlu-konfirmasi';
  let trxDipilihBerat = null;
  let trxDipilihBayar = null;

  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getStatusClass(status) {
    if (!status) return 'menunggu';
    const s = status.toLowerCase();
    if (s.includes('menunggu') || s.includes('verifikasi')) return 'menunggu';
    if (s.includes('tugas')) return 'ditugaskan';
    if (s.includes('dijemput')) return 'dijemput';
    if (s.includes('diperiksa')) return 'diperiksa';
    if (s.includes('selesai')) return 'selesai';
    if (s.includes('dibayar') || s.includes('diterima')) return 'selesai';
    return 'menunggu';
  }

  function getStatusIcon(status) {
    if (!status) return 'fa-clock';
    const s = status.toLowerCase();
    if (s.includes('menunggu')) return 'fa-clock';
    if (s.includes('tugas')) return 'fa-user-check';
    if (s.includes('dijemput')) return 'fa-truck';
    if (s.includes('diperiksa')) return 'fa-weight-hanging';
    if (s.includes('selesai')) return 'fa-check-circle';
    if (s.includes('dibayar')) return 'fa-money-bill-wave';
    if (s.includes('diterima')) return 'fa-hand-holding-usd';
    return 'fa-clock';
  }

  function getPengajuan() {
    return JSON.parse(localStorage.getItem('pengajuan') || '[]');
  }

  // ========== HITUNG STATISTIK ==========
  function hitungStatistik() {
    const pengajuan = getPengajuan();
    
    const perluKonfirmasi = pengajuan.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('diperiksa');
    }).length;
    
    const perluBayar = pengajuan.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('selesai') && !s.includes('dibayar') && !s.includes('diterima');
    }).length;
    
    const sudahBayar = pengajuan.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('dibayar') || s.includes('diterima');
    }).length;
    
    document.getElementById('statPerluKonfirmasi').textContent = perluKonfirmasi;
    document.getElementById('statPerluBayar').textContent = perluBayar;
    document.getElementById('statSudahBayar').textContent = sudahBayar;
  }

  // ========== RENDER LIST ==========
  function renderList() {
    const list = document.getElementById('pembayaranList');
    const empty = document.getElementById('emptyState');
    const pengajuan = getPengajuan();

    let filtered = pengajuan.filter(t => {
      const s = (t.status || '').toLowerCase();
      
      if (filterAktif === 'perlu-konfirmasi') return s.includes('diperiksa');
      if (filterAktif === 'perlu-bayar') return s.includes('selesai') && !s.includes('dibayar') && !s.includes('diterima');
      if (filterAktif === 'sudah-bayar') return s.includes('dibayar') || s.includes('diterima');
      return true;
    });

    filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (filtered.length === 0) {
      empty.style.display = 'block';
      list.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    list.style.display = 'flex';
    list.innerHTML = '';

    filtered.forEach(trx => {
      const statusClass = getStatusClass(trx.status);
      const statusIcon = getStatusIcon(trx.status);

      let itemsHtml = '';
      let totalBeratEstimasi = 0;
      if (trx.items && Array.isArray(trx.items)) {
        trx.items.forEach(item => {
          totalBeratEstimasi += item.berat || 0;
          itemsHtml += '<span class="admin-item-chip"><i class="fas fa-circle"></i> ' + 
            item.nama + ' ' + item.berat + ' kg</span>';
        });
      }

      const beratAktual = trx.beratAktual ? trx.beratAktual + ' kg' : '-';
      const nilaiAkhir = trx.nilaiAkhir || trx.totalEstimasi || 0;

      // Tombol aksi
      let actionHtml = '';
      if (statusClass === 'diperiksa') {
        actionHtml = '<button class="btn btn-primary btn-sm btn-konfirmasi-berat" data-id="' + trx.id + '">' +
          '<i class="fas fa-weight-hanging"></i> Konfirmasi Berat' +
        '</button>';
      } else if (statusClass === 'selesai' && !trx.status.toLowerCase().includes('dibayar') && !trx.status.toLowerCase().includes('diterima')) {
        actionHtml = '<button class="btn btn-success btn-sm btn-proses-bayar" data-id="' + trx.id + '">' +
          '<i class="fas fa-money-bill-wave"></i> Proses Pembayaran' +
        '</button>';
      } else if (trx.status.toLowerCase().includes('dibayar')) {
        actionHtml = '<span style="font-size:13px;color:#2e7d32;font-weight:600;">' +
          '<i class="fas fa-check-circle"></i> Sudah Dibayar' +
        '</span>';
      } else if (trx.status.toLowerCase().includes('diterima')) {
        actionHtml = '<span style="font-size:13px;color:#2e7d32;font-weight:600;">' +
          '<i class="fas fa-hand-holding-usd"></i> Dana Diterima' +
        '</span>';
      }

      const card = document.createElement('div');
      card.className = 'admin-card status-' + statusClass;
      card.innerHTML = 
        '<div class="admin-header">' +
          '<div class="admin-id">' +
            '<strong>' + trx.id + '</strong>' +
            '<span class="admin-tanggal">' +
              '<i class="fas fa-calendar"></i> ' + formatTanggal(trx.tanggal) +
            '</span>' +
          '</div>' +
          '<span class="status-badge status-' + statusClass + '">' +
            '<i class="fas ' + statusIcon + '"></i> ' + (trx.status || 'Menunggu') +
          '</span>' +
        '</div>' +
        '<div class="admin-body">' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-user"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Pelanggan</span>' +
              '<span class="value">' + (trx.pelangganNama || '-') + '</span>' +
              '<small>' + (trx.telepon || '-') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-weight-hanging"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Berat</span>' +
              '<span class="value">Estimasi: ' + totalBeratEstimasi.toFixed(1) + ' kg</span>' +
              '<small>Aktual: <strong>' + beratAktual + '</strong></small>' +
            '</div>' +
          '</div>' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-money-bill-wave"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Nilai</span>' +
              '<span class="value">' + formatRupiah(nilaiAkhir) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="admin-items">' +
            '<h4>Jenis Sampah</h4>' +
            '<div class="admin-items-list">' + itemsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-footer">' +
          '<div class="admin-total">' +
            'Supir: <strong>' + (trx.supirNama || '-') + '</strong>' +
          '</div>' +
          '<div class="admin-actions">' + actionHtml + '</div>' +
        '</div>';

      card.querySelector('.btn-konfirmasi-berat')?.addEventListener('click', () => bukaModalBerat(trx.id));
      card.querySelector('.btn-proses-bayar')?.addEventListener('click', () => bukaModalBayar(trx.id));

      list.appendChild(card);
    });
  }

  // ========== MODAL BERAT ==========
  const modalBerat = document.getElementById('modalKonfirmasiBerat');
  const inputBerat = document.getElementById('inputBeratAktual');

  function bukaModalBerat(trxId) {
    trxDipilihBerat = trxId;
    const pengajuan = getPengajuan();
    const trx = pengajuan.find(t => t.id === trxId);
    if (!trx) return;

    let totalEstimasi = 0;
    if (trx.items) {
      trx.items.forEach(i => totalEstimasi += i.berat || 0);
    }

    document.getElementById('infoBoxBerat').innerHTML = 
      '<h4>Info Transaksi</h4>' +
      '<div class="transaksi-info-row"><span class="label">ID</span><span class="value">' + trx.id + '</span></div>' +
      '<div class="transaksi-info-row"><span class="label">Pelanggan</span><span class="value">' + (trx.pelangganNama || '-') + '</span></div>' +
      '<div class="transaksi-info-row"><span class="label">Estimasi Berat</span><span class="value">' + totalEstimasi.toFixed(1) + ' kg</span></div>' +
      '<div class="transaksi-info-row"><span class="label">Berat dari Supir</span><span class="value">' + (trx.beratAktual ? trx.beratAktual + ' kg' : '-') + '</span></div>';

    inputBerat.value = trx.beratAktual || '';
    document.getElementById('catatanBerat').value = '';
    document.getElementById('error-berat').textContent = '';

    modalBerat.classList.add('active');
  }

  function tutupModalBerat() {
    modalBerat.classList.remove('active');
    trxDipilihBerat = null;
  }

  document.getElementById('modalCloseBerat')?.addEventListener('click', tutupModalBerat);
  document.getElementById('btnBatalBerat')?.addEventListener('click', tutupModalBerat);
  modalBerat?.addEventListener('click', (e) => {
    if (e.target === modalBerat) tutupModalBerat();
  });

  // ========== SIMPAN BERAT ==========
  document.getElementById('btnSimpanBerat')?.addEventListener('click', () => {
    const berat = parseFloat(inputBerat.value);
    const catatan = document.getElementById('catatanBerat').value.trim();

    if (!berat || berat <= 0 || isNaN(berat)) {
      document.getElementById('error-berat').textContent = 'Berat harus angka lebih dari 0';
      return;
    }
    if (berat > 1000) {
      document.getElementById('error-berat').textContent = 'Berat tidak masuk akal (maks 1000 kg)';
      return;
    }

    const pengajuan = getPengajuan();
    const index = pengajuan.findIndex(t => t.id === trxDipilihBerat);
    if (index === -1) return;

    let nilaiAkhir = 0;
    if (pengajuan[index].items && pengajuan[index].items.length > 0) {
      const totalBeratEstimasi = pengajuan[index].items.reduce((s, i) => s + i.berat, 0);
      pengajuan[index].items.forEach(item => {
        const proporsi = item.berat / totalBeratEstimasi;
        nilaiAkhir += (berat * proporsi) * item.harga;
      });
    }

    pengajuan[index].beratAktual = berat;
    pengajuan[index].nilaiAkhir = Math.round(nilaiAkhir);
    pengajuan[index].status = 'Selesai';
    pengajuan[index].tanggalKonfirmasiBerat = new Date().toISOString();
    pengajuan[index].catatanAdminBerat = catatan;

    if (!pengajuan[index].riwayatStatus) pengajuan[index].riwayatStatus = [];
    pengajuan[index].riwayatStatus.push({
      status: 'Selesai',
      waktu: new Date().toISOString(),
      oleh: currentUser.nama,
      keterangan: 'Berat dikonfirmasi: ' + berat + ' kg'
    });

    localStorage.setItem('pengajuan', JSON.stringify(pengajuan));

    tutupModalBerat();
    hitungStatistik();
    renderList();

    alert('Berhasil! Berat aktual ' + berat + ' kg. Nilai akhir: ' + formatRupiah(nilaiAkhir));
  });

  // ========== MODAL BAYAR ==========
  const modalBayar = document.getElementById('modalPembayaran');

  function bukaModalBayar(trxId) {
    trxDipilihBayar = trxId;
    const pengajuan = getPengajuan();
    const trx = pengajuan.find(t => t.id === trxId);
    if (!trx) return;

    document.getElementById('infoBoxBayar').innerHTML = 
      '<h4>Info Pembayaran</h4>' +
      '<div class="transaksi-info-row"><span class="label">ID</span><span class="value">' + trx.id + '</span></div>' +
      '<div class="transaksi-info-row"><span class="label">Pelanggan</span><span class="value">' + (trx.pelangganNama || '-') + '</span></div>' +
      '<div class="transaksi-info-row"><span class="label">Telepon</span><span class="value">' + (trx.telepon || '-') + '</span></div>' +
      '<div class="transaksi-info-row"><span class="label">Berat Aktual</span><span class="value">' + (trx.beratAktual || '-') + ' kg</span></div>' +
      '<div class="transaksi-info-row"><span class="label">Nilai Akhir</span><span class="value" style="color:#2e7d32;font-size:16px;">' + formatRupiah(trx.nilaiAkhir || trx.totalEstimasi || 0) + '</span></div>';

    document.getElementById('metodePembayaran').value = 'Transfer Bank';
    document.getElementById('catatanBayar').value = '';

    modalBayar.classList.add('active');
  }

  function tutupModalBayar() {
    modalBayar.classList.remove('active');
    trxDipilihBayar = null;
  }

  document.getElementById('modalCloseBayar')?.addEventListener('click', tutupModalBayar);
  document.getElementById('btnBatalBayar')?.addEventListener('click', tutupModalBayar);
  modalBayar?.addEventListener('click', (e) => {
    if (e.target === modalBayar) tutupModalBayar();
  });

  // ========== PROSES PEMBAYARAN ==========
  document.getElementById('btnProsesPembayaran')?.addEventListener('click', () => {
    const metode = document.getElementById('metodePembayaran').value;
    const catatan = document.getElementById('catatanBayar').value.trim();

    if (!metode) {
      alert('Pilih metode pembayaran');
      return;
    }

    const pengajuan = getPengajuan();
    const index = pengajuan.findIndex(t => t.id === trxDipilihBayar);
    if (index === -1) return;

    const trxId = trxDipilihBayar;

    // Update status jadi "Dibayar"
    pengajuan[index].status = 'Dibayar';
    pengajuan[index].tanggalDibayar = new Date().toISOString();
    pengajuan[index].metodePembayaran = metode;
    pengajuan[index].catatanPembayaran = catatan;
    pengajuan[index].nilaiDibayar = pengajuan[index].nilaiAkhir || pengajuan[index].totalEstimasi || 0;

    if (!pengajuan[index].riwayatStatus) pengajuan[index].riwayatStatus = [];
    pengajuan[index].riwayatStatus.push({
      status: 'Dibayar',
      waktu: new Date().toISOString(),
      oleh: currentUser.nama,
      keterangan: 'Metode: ' + metode
    });

    localStorage.setItem('pengajuan', JSON.stringify(pengajuan));

    // ⭐ OTOMATIS: Setelah 800ms, ubah jadi "Dana Diterima"
    // Biar saldo pelanggan langsung bertambah
    setTimeout(() => {
      const updatedPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
      const idx2 = updatedPengajuan.findIndex(t => t.id === trxId);
      if (idx2 !== -1) {
        updatedPengajuan[idx2].status = 'Dana Diterima';
        updatedPengajuan[idx2].tanggalDiterima = new Date().toISOString();
        
        if (!updatedPengajuan[idx2].riwayatStatus) updatedPengajuan[idx2].riwayatStatus = [];
        updatedPengajuan[idx2].riwayatStatus.push({
          status: 'Dana Diterima',
          waktu: new Date().toISOString(),
          oleh: 'Sistem',
          keterangan: 'Dana otomatis masuk ke saldo pelanggan'
        });
        
        localStorage.setItem('pengajuan', JSON.stringify(updatedPengajuan));
      }
    }, 800);

    tutupModalBayar();
    hitungStatistik();
    renderList();

    alert('Pembayaran berhasil diproses!\n\nDana otomatis masuk ke saldo pelanggan.\nPelanggan bisa tarik dana kapan saja.');
  });

  // ========== FILTER ==========
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAktif = btn.dataset.filter;
      renderList();
    });
  });

  // ========== SIDEBAR ==========
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const topbarToggle = document.getElementById('topbarToggle');
  const sidebarClose = document.getElementById('sidebarClose');

  topbarToggle?.addEventListener('click', () => {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
  });

  function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  }

  sidebarClose?.addEventListener('click', closeSidebar);
  sidebarOverlay?.addEventListener('click', closeSidebar);

  hitungStatistik();
  renderList();

});

function logoutUser() {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}