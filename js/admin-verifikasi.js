/* ============================================
   ADMIN VERIFIKASI JS
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
  let trxDipilih = null;

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
    if (s.includes('selesai') || s.includes('dibayar')) return 'selesai';
    return 'menunggu';
  }

  function getStatusIcon(status) {
    if (!status) return 'fa-clock';
    const s = status.toLowerCase();
    if (s.includes('menunggu')) return 'fa-clock';
    if (s.includes('tugas')) return 'fa-user-check';
    if (s.includes('dijemput')) return 'fa-truck';
    if (s.includes('selesai')) return 'fa-check-circle';
    return 'fa-clock';
  }

  function getPengajuan() {
    return JSON.parse(localStorage.getItem('pengajuan') || '[]');
  }

  function getSupir() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    return users.filter(u => u.role === 'supir');
  }

  function hitungStatistik() {
    const pengajuan = getPengajuan();
    
    const menunggu = pengajuan.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('menunggu') || s.includes('verifikasi');
    }).length;
    
    const ditugaskan = pengajuan.filter(t => {
      const s = (t.status || '').toLowerCase();
      return s.includes('tugas') || s.includes('dijemput');
    }).length;
    
    document.getElementById('statMenunggu').textContent = menunggu;
    document.getElementById('statDitugaskan').textContent = ditugaskan;
    document.getElementById('statTotal').textContent = pengajuan.length;
  }

  function renderList() {
    const list = document.getElementById('verifikasiList');
    const empty = document.getElementById('emptyState');
    const pengajuan = getPengajuan();

    let filtered = pengajuan;
    
    if (filterAktif === 'menunggu') {
      filtered = pengajuan.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s.includes('menunggu') || s.includes('verifikasi');
      });
    } else if (filterAktif === 'ditugaskan') {
      filtered = pengajuan.filter(t => {
        const s = (t.status || '').toLowerCase();
        return s.includes('tugas') || s.includes('dijemput') || s.includes('diperiksa');
      });
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

    filtered.forEach(trx => {
      const statusClass = getStatusClass(trx.status);
      const statusIcon = getStatusIcon(trx.status);

      let itemsHtml = '';
      let totalBerat = 0;
      if (trx.items && Array.isArray(trx.items)) {
        trx.items.forEach(item => {
          totalBerat += item.berat || 0;
          itemsHtml += '<span class="admin-item-chip"><i class="fas fa-circle"></i> ' + 
            item.nama + ' ' + item.berat + ' kg</span>';
        });
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
            '<div class="admin-info-icon"><i class="fas fa-map-marker-alt"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Alamat</span>' +
              '<span class="value">' + formatKecamatan(trx.kecamatan) + '</span>' +
              '<small>' + (trx.alamat || '-') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="admin-info">' +
            '<div class="admin-info-icon"><i class="fas fa-clock"></i></div>' +
            '<div class="admin-info-content">' +
              '<span class="label">Jadwal Jemput</span>' +
              '<span class="value">' + (trx.tanggalJemput ? formatTanggal(trx.tanggalJemput) : '-') + '</span>' +
              '<small>Jam: ' + (trx.jamJemput || '-') + '</small>' +
            '</div>' +
          '</div>' +
          '<div class="admin-items">' +
            '<h4>Jenis Sampah (' + totalBerat.toFixed(1) + ' kg)</h4>' +
            '<div class="admin-items-list">' + itemsHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="admin-footer">' +
          '<div class="admin-total">' +
            'Estimasi: <strong>' + formatRupiah(trx.totalEstimasi || 0) + '</strong>' +
          '</div>' +
          '<div class="admin-actions">' +
            (statusClass === 'menunggu' ?
              '<button class="btn btn-primary btn-sm btn-tugaskan" data-id="' + trx.id + '">' +
                '<i class="fas fa-user-check"></i> Tugaskan Supir' +
              '</button>' :
              '<span style="font-size:13px;color:#616161;">Ditugaskan ke: <strong>' + (trx.supirNama || '-') + '</strong></span>'
            ) +
          '</div>' +
        '</div>';

      const btnTugaskan = card.querySelector('.btn-tugaskan');
      if (btnTugaskan) {
        btnTugaskan.addEventListener('click', () => bukaModalTugaskan(trx.id));
      }

      list.appendChild(card);
    });
  }

  const modal = document.getElementById('modalTugaskan');
  const selectSupir = document.getElementById('selectSupir');

  function bukaModalTugaskan(trxId) {
    trxDipilih = trxId;

    const supirList = getSupir();
    selectSupir.innerHTML = '<option value="">-- Pilih Supir --</option>';
    
    if (supirList.length === 0) {
      selectSupir.innerHTML = '<option value="">Belum ada supir terdaftar</option>';
    } else {
      supirList.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.nama + ' (' + (s.telepon || '-') + ')';
        selectSupir.appendChild(opt);
      });
    }

    document.getElementById('catatanAdmin').value = '';
    document.getElementById('error-supir').textContent = '';
    modal.classList.add('active');
  }

  function tutupModal() {
    modal.classList.remove('active');
    trxDipilih = null;
  }

  document.getElementById('modalClose')?.addEventListener('click', tutupModal);
  document.getElementById('btnBatalModal')?.addEventListener('click', tutupModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) tutupModal();
  });

  document.getElementById('btnTugaskan')?.addEventListener('click', () => {
    const supirId = selectSupir.value;
    const catatan = document.getElementById('catatanAdmin').value.trim();

    if (!supirId) {
      document.getElementById('error-supir').textContent = 'Pilih supir terlebih dahulu';
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const supir = users.find(u => u.id === supirId);

    if (!supir) {
      document.getElementById('error-supir').textContent = 'Supir tidak ditemukan';
      return;
    }

    const pengajuan = getPengajuan();
    const index = pengajuan.findIndex(t => t.id === trxDipilih);

    if (index === -1) {
      alert('Transaksi tidak ditemukan');
      return;
    }

    pengajuan[index].status = 'Ditugaskan';
    pengajuan[index].supirId = supir.id;
    pengajuan[index].supirNama = supir.nama;
    pengajuan[index].supirTelepon = supir.telepon;
    pengajuan[index].tanggalDitugaskan = new Date().toISOString();
    pengajuan[index].catatanAdmin = catatan;

    if (!pengajuan[index].riwayatStatus) pengajuan[index].riwayatStatus = [];
    pengajuan[index].riwayatStatus.push({
      status: 'Ditugaskan',
      waktu: new Date().toISOString(),
      oleh: currentUser.nama,
      keterangan: 'Ditugaskan ke ' + supir.nama
    });

    localStorage.setItem('pengajuan', JSON.stringify(pengajuan));

    tutupModal();
    hitungStatistik();
    renderList();

    alert('Berhasil ditugaskan ke ' + supir.nama);
  });

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