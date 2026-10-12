/* ============================================
   DASHBOARD PELANGGAN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== CEK LOGIN ==========
  const currentUser = Auth.getUser();
  
  if (!currentUser) {
    alert('Silakan login terlebih dahulu');
    window.location.href = 'login.html';
    return;
  }

  if (currentUser.role !== 'pelanggan') {
    window.location.href = 'akses-ditolak.html';
    return;
  }

  // ========== TAMPILKAN DATA USER ==========
  const userName = currentUser.nama || 'Pelanggan';
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

  // ========== AMBIL DATA TRANSAKSI ==========
  const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
  const transaksiUser = semuaPengajuan.filter(t => t.userId === currentUser.id);

  // ========== HITUNG STATISTIK ==========
  let totalBerat = 0;
  let totalPendapatan = 0;
  let transaksiAktif = 0;
  let transaksiSelesai = 0;

  transaksiUser.forEach(trx => {
    // Hitung total berat
    if (trx.items && Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        totalBerat += item.berat || 0;
      });
    }
    
    // Hitung pendapatan (kalau sudah dibayar)
    if (trx.status === 'Dibayar' || trx.status === 'Selesai') {
      totalPendapatan += trx.totalEstimasi || 0;
      transaksiSelesai++;
    }
    
    // Transaksi aktif (belum selesai)
    if (trx.status !== 'Selesai' && trx.status !== 'Dibayar' && trx.status !== 'Dana Diterima') {
      transaksiAktif++;
    }
  });

  document.getElementById('totalSetoran').textContent = totalBerat.toFixed(1) + ' kg';
  document.getElementById('totalPendapatan').textContent = formatRupiah(totalPendapatan);
  document.getElementById('transaksiAktif').textContent = transaksiAktif;
  document.getElementById('transaksiSelesai').textContent = transaksiSelesai;

  // ========== TAMPILKAN 5 TRANSAKSI TERBARU ==========
  const sortedTrx = transaksiUser
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
    .slice(0, 5);

  if (sortedTrx.length > 0) {
    document.getElementById('emptyRiwayat').style.display = 'none';
    document.getElementById('tableWrapper').style.display = 'block';

    const body = document.getElementById('bodyRiwayat');
    body.innerHTML = '';

    sortedTrx.forEach(trx => {
      // Hitung jenis dan berat
      let jenisList = '-';
      let beratTotal = 0;
      
      if (trx.items && Array.isArray(trx.items)) {
        jenisList = trx.items.map(i => i.nama).join(', ');
        beratTotal = trx.items.reduce((sum, i) => sum + (i.berat || 0), 0);
      }

      // Status badge
      const statusClass = getStatusClass(trx.status);
      const statusIcon = getStatusIcon(trx.status);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${trx.id || '-'}</strong></td>
        <td>${formatTanggal(trx.tanggal)}</td>
        <td>${jenisList}</td>
        <td>${beratTotal.toFixed(1)} kg</td>
        <td>
          <span class="status-badge ${statusClass}">
            <i class="fas ${statusIcon}"></i> ${trx.status || 'Menunggu'}
          </span>
        </td>
        <td><strong>${formatRupiah(trx.totalEstimasi || 0)}</strong></td>
      `;
      body.appendChild(row);
    });
  }

  // ========== TOGGLE SIDEBAR (MOBILE) ==========
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

  // ========== HELPER FUNCTIONS ==========
  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function getStatusClass(status) {
    if (!status) return 'status-menunggu';
    const s = status.toLowerCase();
    if (s.includes('menunggu') || s.includes('verifikasi')) return 'status-menunggu';
    if (s.includes('proses') || s.includes('dijemput') || s.includes('ditugaskan') || s.includes('diperiksa')) return 'status-diproses';
    if (s.includes('selesai') || s.includes('dibayar') || s.includes('diterima')) return 'status-selesai';
    return 'status-menunggu';
  }

  function getStatusIcon(status) {
    if (!status) return 'fa-clock';
    const s = status.toLowerCase();
    if (s.includes('menunggu') || s.includes('verifikasi')) return 'fa-clock';
    if (s.includes('proses') || s.includes('dijemput') || s.includes('ditugaskan')) return 'fa-truck';
    if (s.includes('selesai') || s.includes('dibayar') || s.includes('diterima')) return 'fa-check-circle';
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