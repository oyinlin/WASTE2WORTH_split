/* ============================================
   SUPIR JADWAL JS - Final Version
   Data Fresh + Sinkronisasi ke Admin & Pelanggan
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

  const userName = currentUser.nama || 'Supir';
  document.getElementById('userName').textContent = userName;
  document.getElementById('userAvatar').textContent = userName.charAt(0).toUpperCase();

  // Tanggal hari ini
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();
  document.getElementById('tanggalHariIni').textContent = 
    hari[now.getDay()] + ', ' + now.getDate() + ' ' + bulan[now.getMonth()] + ' ' + now.getFullYear();

  // ========== FILTER ==========
  let filterAktif = 'all';

  // ========== AMBIL DATA FRESH ==========
  function getTugasSupir() {
    const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
    return semuaPengajuan
      .filter(t => t.supirId === currentUser.id || t.supirNama === currentUser.nama)
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
  }

  // ========== UPDATE STATISTIK ==========
  function updateStatistik(tugasSupir) {
    const total = tugasSupir.length;
    const proses = tugasSupir.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('tugas') || s.includes('dijemput') || s.includes('diperiksa');
    }).length;
    const selesai = tugasSupir.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('selesai') || s.includes('dibayar') || s.includes('diterima');
    }).length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statProses').textContent = proses;
    document.getElementById('statSelesai').textContent = selesai;
  }

  // ========== RENDER ==========
  function renderJadwal() {
    const list = document.getElementById('jadwalList');
    const empty = document.getElementById('emptyJadwal');

    // Ambil data FRESH setiap kali render
    const tugasSupir = getTugasSupir();

    // Update statistik
    updateStatistik(tugasSupir);

    // Filter
    let filtered = tugasSupir;
    if (filterAktif !== 'all') {
      filtered = tugasSupir.filter(t => {
        const s = (t.status || '').toLowerCase();
        if (filterAktif === 'ditugaskan') return s.includes('tugas');
        if (filterAktif === 'dijemput') return s.includes('dijemput');
        if (filterAktif === 'diperiksa') return s.includes('diperiksa');
        if (filterAktif === 'selesai') return s.includes('selesai') || s.includes('dibayar') || s.includes('diterima');
        return true;
      });
    }

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

      // Items sampah
      let itemsHtml = '';
      let totalBerat = 0;
      if (trx.items && Array.isArray(trx.items)) {
        trx.items.forEach(item => {
          totalBerat += item.berat || 0;
          itemsHtml += '<span class="jadwal-item-chip"><i class="fas fa-circle"></i> ' + 
            item.nama + ' ' + item.berat + ' kg</span>';
        });
      }

      // Info berat aktual (kalau sudah ada)
      let beratInfo = '';
      if (trx.beratAktual) {
        beratInfo = ' — Aktual: ' + trx.beratAktual + ' kg';
      }

      const card = document.createElement('div');
      card.className = 'jadwal-card status-' + statusClass;
      card.innerHTML = 
        '<div class="jadwal-header">' +
          '<div class="jadwal-id">' +
            '<strong>' + trx.id + '</strong>' +
            '<span class="jadwal-tanggal">' +
              '<i class="fas fa-calendar"></i> ' + formatTanggal(trx.tanggal) +
            '</span>' +
          '</div>' +
          '<span class="status-badge status-' + statusClass + '">' +
            '<i class="fas ' + statusIcon + '"></i> ' + (trx.status || 'Menunggu') +
          '</span>' +
        '</div>' +
        '<div class="jadwal-body">' +
          '<div class="jadwal-info">' +
            '<div class="jadwal-info-icon"><i class="fas fa-user"></i></div>' +
            '<div class="jadwal-info-content">' +
              '<span class="label">Pelanggan</span>' +
              '<span class="value">' + (trx.pelangganNama || '-') + '</span>' +
              '<small>' + (trx.telepon || '-') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="jadwal-info">' +
            '<div class="jadwal-info-icon"><i class="fas fa-map-marker-alt"></i></div>' +
            '<div class="jadwal-info-content">' +
              '<span class="label">Alamat</span>' +
              '<span class="value">' + formatKecamatan(trx.kecamatan) + '</span>' +
              '<small>' + (trx.alamat || '-') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="jadwal-info">' +
            '<div class="jadwal-info-icon"><i class="fas fa-clock"></i></div>' +
            '<div class="jadwal-info-content">' +
              '<span class="label">Jadwal Jemput</span>' +
              '<span class="value">' + (trx.tanggalJemput ? formatTanggal(trx.tanggalJemput) : '-') + '</span>' +
              '<small>Jam: ' + (trx.jamJemput || '-') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="jadwal-items">' +
            '<h4>Jenis Sampah (' + totalBerat.toFixed(1) + ' kg' + beratInfo + ')</h4>' +
            '<div class="jadwal-items-list">' + itemsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="jadwal-footer">' +
          '<div class="jadwal-total">' +
            'Estimasi: <strong>' + formatRupiah(trx.totalEstimasi || 0) + '</strong>' +
          '</div>' +
          '<div class="jadwal-actions">' +
            '<a href="supir-update-status.html?id=' + trx.id + '" class="btn btn-primary btn-sm">' +
              '<i class="fas fa-edit"></i> Update Status' +
            '</a>' +
            '<a href="https://www.google.com/maps/search/?api=1&query=' + 
              encodeURIComponent(trx.alamat || '') + '" ' +
              'target="_blank" class="btn btn-outline btn-sm">' +
              '<i class="fas fa-directions"></i> Rute' +
            '</a>' +
          '</div>' +
        '</div>';
      list.appendChild(card);
    });
  }

  // ========== FILTER BUTTONS ==========
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAktif = btn.dataset.filter;
      renderJadwal();
    });
  });

  // ========== SIDEBAR TOGGLE ==========
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

  // ========== HELPER ==========
  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatKecamatan(kec) {
    if (!kec) return '-';
    return kec.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  function getStatusClass(status) {
    if (!status) return 'menunggu';
    const s = status.toLowerCase();
    if (s.includes('menunggu') || s.includes('verifikasi')) return 'menunggu';
    if (s.includes('tugas')) return 'ditugaskan';
    if (s.includes('dijemput')) return 'dijemput';
    if (s.includes('diperiksa')) return 'diperiksa';
    if (s.includes('selesai') || s.includes('dibayar') || s.includes('diterima')) return 'selesai';
    return 'menunggu';
  }

  function getStatusIcon(status) {
    if (!status) return 'fa-clock';
    const s = status.toLowerCase();
    if (s.includes('menunggu')) return 'fa-clock';
    if (s.includes('tugas')) return 'fa-user-check';
    if (s.includes('dijemput')) return 'fa-truck';
    if (s.includes('diperiksa')) return 'fa-weight-hanging';
    if (s.includes('dibayar')) return 'fa-money-bill-wave';
    if (s.includes('diterima')) return 'fa-hand-holding-usd';
    if (s.includes('selesai')) return 'fa-check-circle';
    return 'fa-clock';
  }

  // ========== INIT ==========
  renderJadwal();

  // ========== AUTO REFRESH tiap 5 detik (opsional, biar data selalu fresh) ==========
  setInterval(() => {
    renderJadwal();
  }, 5000);

});

function logoutUser() {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}