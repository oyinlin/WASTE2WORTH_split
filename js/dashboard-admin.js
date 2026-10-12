/* ============================================
   DASHBOARD ADMIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== CEK LOGIN ==========
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

  // ========== TAMPILKAN DATA USER ==========
  const userName = currentUser.nama || 'Admin';
  const initial = userName.charAt(0).toUpperCase();

  document.getElementById('userName').textContent = userName;
  document.getElementById('welcomeName').textContent = userName.split(' ')[0];
  document.getElementById('userAvatar').textContent = initial;

  // ========== TANGGAL HARI INI ==========
  const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const now = new Date();
  const tanggalStr = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById('tanggalHariIni').textContent = tanggalStr;

  // ========== AMBIL DATA ==========
  const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
  const semuaUser = JSON.parse(localStorage.getItem('users') || '[]');

  // ========== HITUNG STATISTIK ==========
  let pending = 0;
  let proses = 0;
  let selesai = 0;
  let totalTransaksi = semuaPengajuan.length;
  let totalNilai = 0;
  let totalBerat = 0;

  semuaPengajuan.forEach(trx => {
    const status = (trx.status || '').toLowerCase();
    
    if (status.includes('menunggu') || status.includes('verifikasi')) pending++;
    else if (status.includes('tugas') || status.includes('dijemput') || 
             status.includes('diperiksa') || status.includes('proses')) proses++;
    else if (status.includes('selesai') || status.includes('dibayar') || 
             status.includes('diterima')) selesai++;

    totalNilai += trx.totalEstimasi || 0;

    if (trx.items && Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        totalBerat += item.berat || 0;
      });
    }
  });

  // Tampilkan statistik
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statProses').textContent = proses;
  document.getElementById('statSelesai').textContent = selesai;
  document.getElementById('statUser').textContent = semuaUser.length;
  document.getElementById('statTotalTransaksi').textContent = totalTransaksi;
  document.getElementById('statTotalNilai').textContent = formatRupiah(totalNilai);
  document.getElementById('statTotalBerat').textContent = totalBerat.toFixed(1) + ' kg';

  // ========== TAMPILKAN ANTRIAN VERIFIKASI ==========
  const pendingTrx = semuaPengajuan
    .filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('menunggu') || s.includes('verifikasi');
    })
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 5);

  if (pendingTrx.length > 0) {
    document.getElementById('emptyVerifikasi').style.display = 'none';
    document.getElementById('tableWrapper').style.display = 'block';

    const body = document.getElementById('bodyVerifikasi');
    body.innerHTML = '';

    pendingTrx.forEach(trx => {
      const statusClass = getStatusClass(trx.status);
      const statusIcon = getStatusIcon(trx.status);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${trx.id || '-'}</strong></td>
        <td>${trx.pelangganNama || 'Pelanggan'}</td>
        <td>${trx.kecamatan || '-'}</td>
        <td><strong>${formatRupiah(trx.totalEstimasi || 0)}</strong></td>
        <td>
          <span class="status-badge ${statusClass}">
            <i class="fas ${statusIcon}"></i> ${trx.status || 'Menunggu'}
          </span>
        </td>
        <td>
          <a href="admin-verifikasi.html?id=${trx.id}" class="btn btn-primary btn-sm">
            <i class="fas fa-check"></i> Verifikasi
          </a>
        </td>
      `;
      body.appendChild(row);
    });
  }

  // ========== TOGGLE SIDEBAR ==========
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const topbarToggle = document.getElementById('topbarToggle');
  const sidebarClose = document.getElementById('sidebarClose');

  function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  topbarToggle?.addEventListener('click', openSidebar);
  sidebarClose?.addEventListener('click', closeSidebar);
  sidebarOverlay?.addEventListener('click', closeSidebar);

  // ========== HELPER ==========
  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function getStatusClass(status) {
    if (!status) return 'status-menunggu';
    const s = status.toLowerCase();
    if (s.includes('menunggu') || s.includes('verifikasi')) return 'status-menunggu';
    if (s.includes('tugas') || s.includes('dijemput') || 
        s.includes('diperiksa') || s.includes('proses')) return 'status-diproses';
    if (s.includes('selesai') || s.includes('dibayar') || 
        s.includes('diterima')) return 'status-selesai';
    return 'status-menunggu';
  }

  function getStatusIcon(status) {
    if (!status) return 'fa-clock';
    const s = status.toLowerCase();
    if (s.includes('menunggu') || s.includes('verifikasi')) return 'fa-clock';
    if (s.includes('tugas') || s.includes('dijemput')) return 'fa-truck';
    if (s.includes('diperiksa')) return 'fa-search';
    if (s.includes('selesai') || s.includes('dibayar')) return 'fa-check-circle';
    return 'fa-clock';
  }

});

// ========== LOGOUT ==========
function logoutUser() {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}