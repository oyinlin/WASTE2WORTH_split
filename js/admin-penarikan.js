/* ============================================
   ADMIN PENARIKAN JS
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

  let filterAktif = 'menunggu';

  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function getPenarikan() {
    return JSON.parse(localStorage.getItem('penarikan') || '[]');
  }

  function hitungStatistik() {
    const penarikan = getPenarikan();
    const menunggu = penarikan.filter(p => p.status === 'Menunggu').length;
    const diproses = penarikan.filter(p => p.status === 'Diproses').length;
    const selesai = penarikan.filter(p => p.status === 'Selesai').length;

    document.getElementById('statMenunggu').textContent = menunggu;
    document.getElementById('statDiproses').textContent = diproses;
    document.getElementById('statSelesai').textContent = selesai;
  }

  function renderList() {
    const list = document.getElementById('penarikanList');
    const empty = document.getElementById('emptyState');

    let filtered = getPenarikan();
    if (filterAktif !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === filterAktif);
    }

    filtered.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (filtered.length === 0) {
      empty.style.display = 'block';
      list.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    list.style.display = 'flex';
    list.innerHTML = '';

    filtered.forEach(p => {
      const isBank = p.metode === 'Bank';
      const statusClass = p.status.toLowerCase();

      const card = document.createElement('div');
      card.className = 'admin-card';
      card.innerHTML = 
        '<div class="admin-header">' +
          '<div class="admin-id">' +
            '<strong>' + p.id + '</strong>' +
            '<span class="admin-tanggal">' +
              '<i class="fas fa-calendar"></i> ' + formatTanggal(p.tanggal) +
            '</span>' +
          '</div>' +
          '<span class="status-badge status-' + (statusClass === 'menunggu' ? 'menunggu' : statusClass === 'diproses' ? 'ditugaskan' : 'selesai') + '">' +
            '<i class="fas fa-' + (p.status === 'Selesai' ? 'check-circle' : p.status === 'Diproses' ? 'spinner' : 'clock') + '"></i> ' + p.status +
          '</span>' +
        '</div>' +
        '<div class="admin-body">' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-user"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Pelanggan</span>' +
              '<span class="value">' + (p.userNama || '-') + '</span>' +
              '<small>' + (p.userTelepon || '-') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-' + (isBank ? 'university' : 'mobile-alt') + '"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">' + (isBank ? 'Bank' : 'E-Wallet') + '</span>' +
              '<span class="value">' + (isBank ? p.bank : p.wallet) + '</span>' +
              '<small>' + (isBank ? 'Rek: ' + p.rekening : 'HP: ' + p.noHp) + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-money-bill-wave"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Jumlah</span>' +
              '<span class="value" style="color:#2e7d32;font-size:18px;">' + formatRupiah(p.jumlah) + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-user-check"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Pemilik Rekening/Akun</span>' +
              '<span class="value">' + (p.namaPemilik || '-') + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-footer">' +
          '<div class="admin-total">' +
            'Diajukan: <strong>' + formatTanggal(p.tanggal) + '</strong>' +
          '</div>' +
          '<div class="admin-actions">' +
            (p.status === 'Menunggu' ? 
              '<button class="btn btn-primary btn-sm btn-approve" data-id="' + p.id + '">' +
                '<i class="fas fa-check"></i> Approve' +
              '</button>' +
              '<button class="btn btn-outline btn-sm btn-reject" data-id="' + p.id + '" style="border-color:#f44336;color:#f44336;">' +
                '<i class="fas fa-times"></i> Tolak' +
              '</button>'
            : p.status === 'Diproses' ?
              '<button class="btn btn-success btn-sm btn-selesai" data-id="' + p.id + '" style="background:#4caf50;color:#fff;border:none;padding:8px 16px;border-radius:8px;font-weight:600;cursor:pointer;">' +
                '<i class="fas fa-check-circle"></i> Tandai Selesai' +
              '</button>'
            : '<span style="font-size:13px;color:#2e7d32;font-weight:600;"><i class="fas fa-check-circle"></i> Sudah Selesai</span>')
          '</div>' +
        '</div>';

      card.querySelector('.btn-approve')?.addEventListener('click', () => approvePenarikan(p.id));
      card.querySelector('.btn-reject')?.addEventListener('click', () => rejectPenarikan(p.id));
      card.querySelector('.btn-selesai')?.addEventListener('click', () => selesaiPenarikan(p.id));

      list.appendChild(card);
    });
  }

  function approvePenarikan(id) {
    if (!confirm('Approve pengajuan penarikan ini?')) return;
    const penarikan = getPenarikan();
    const idx = penarikan.findIndex(p => p.id === id);
    if (idx === -1) return;
    penarikan[idx].status = 'Diproses';
    penarikan[idx].tanggalDiproses = new Date().toISOString();
    penarikan[idx].diprosesOleh = currentUser.nama;
    localStorage.setItem('penarikan', JSON.stringify(penarikan));
    alert('Penarikan di-approve! Status: Diproses');
    hitungStatistik();
    renderList();
  }

  function rejectPenarikan(id) {
    const reason = prompt('Alasan penolakan:');
    if (reason === null) return;
    const penarikan = getPenarikan();
    const idx = penarikan.findIndex(p => p.id === id);
    if (idx === -1) return;
    penarikan[idx].status = 'Gagal';
    penarikan[idx].alasanGagal = reason || 'Ditolak admin';
    penarikan[idx].tanggalGagal = new Date().toISOString();
    localStorage.setItem('penarikan', JSON.stringify(penarikan));
    alert('Penarikan ditolak!');
    hitungStatistik();
    renderList();
  }

  function selesaiPenarikan(id) {
    if (!confirm('Tandai penarikan ini sebagai selesai?')) return;
    const penarikan = getPenarikan();
    const idx = penarikan.findIndex(p => p.id === id);
    if (idx === -1) return;
    penarikan[idx].status = 'Selesai';
    penarikan[idx].tanggalSelesai = new Date().toISOString();
    localStorage.setItem('penarikan', JSON.stringify(penarikan));
    alert('Penarikan selesai! Dana sudah dikirim ke pelanggan.');
    hitungStatistik();
    renderList();
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAktif = btn.dataset.filter;
      renderList();
    });
  });

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