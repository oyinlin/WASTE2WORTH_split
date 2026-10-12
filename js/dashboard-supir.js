/* ============================================
   DASHBOARD SUPIR JS
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

  // ========== TAMPILKAN DATA USER ==========
  const userName = currentUser.nama || 'Supir';
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

  // ========== AMBIL DATA TUGAS ==========
  const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
  const tugasSupir = semuaPengajuan.filter(t => 
    t.supirId === currentUser.id || 
    t.supir === currentUser.nama ||
    t.status === 'Ditugaskan' || 
    t.status === 'Dijemput' ||
    t.status === 'Sedang Diperiksa'
  );

  // ========== HITUNG STATISTIK ==========
  const today = new Date().toDateString();
  
  let tugasHariIni = 0;
  let sedangDiproses = 0;
  let selesaiHariIni = 0;
  let totalBerat = 0;

  tugasSupir.forEach(trx => {
    const trxDate = new Date(trx.tanggal).toDateString();
    
    if (trxDate === today) tugasHariIni++;
    
    if (trx.status === 'Ditugaskan' || trx.status === 'Dijemput' || trx.status === 'Sedang Diperiksa') {
      sedangDiproses++;
    }
    
    if (trx.status === 'Selesai' && trxDate === today) selesaiHariIni++;
    
    if (trx.items && Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        totalBerat += item.berat || 0;
      });
    }
  });

  document.getElementById('tugasHariIni').textContent = tugasHariIni;
  document.getElementById('sedangDiproses').textContent = sedangDiproses;
  document.getElementById('selesaiHariIni').textContent = selesaiHariIni;
  document.getElementById('totalBerat').textContent = totalBerat.toFixed(1) + ' kg';

  // ========== TAMPILKAN TUGAS ==========
  if (tugasSupir.length > 0) {
    document.getElementById('emptyTugas').style.display = 'none';
    document.getElementById('tableWrapper').style.display = 'block';

    const body = document.getElementById('bodyTugas');
    body.innerHTML = '';

    tugasSupir.slice(0, 10).forEach(trx => {
      const statusClass = getStatusClass(trx.status);
      const statusIcon = getStatusIcon(trx.status);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td><strong>${trx.id || '-'}</strong></td>
        <td>${trx.pelangganNama || 'Pelanggan'}</td>
        <td>${trx.alamat || '-'}</td>
        <td>${trx.kecamatan || '-'}</td>
        <td>
          <span class="status-badge ${statusClass}">
            <i class="fas ${statusIcon}"></i> ${trx.status || 'Menunggu'}
          </span>
        </td>
        <td>
          <a href="supir-update-status.html?id=${trx.id}" class="btn btn-primary btn-sm">
            <i class="fas fa-edit"></i> Update
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
  function getStatusClass(status) {
    if (!status) return 'status-menunggu';
    const s = status.toLowerCase();
    if (s.includes('menunggu')) return 'status-menunggu';
    if (s.includes('tugas') || s.includes('dijemput') || s.includes('diperiksa')) return 'status-diproses';
    if (s.includes('selesai')) return 'status-selesai';
    return 'status-menunggu';
  }

  function getStatusIcon(status) {
    if (!status) return 'fa-clock';
    const s = status.toLowerCase();
    if (s.includes('menunggu')) return 'fa-clock';
    if (s.includes('tugas') || s.includes('dijemput')) return 'fa-truck';
    if (s.includes('diperiksa')) return 'fa-search';
    if (s.includes('selesai')) return 'fa-check-circle';
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