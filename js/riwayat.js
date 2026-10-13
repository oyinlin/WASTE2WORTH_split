/* ============================================
   RIWAYAT JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== CEK LOGIN ==========
  const currentUser = Auth.getUser();
  
  if (!currentUser) {
    alert('Silakan login terlebih dahulu');
    window.location.href = 'login.html';
    return;
  }

  // ========== AMBIL DATA ==========
  const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
  const transaksiUser = semuaPengajuan
    .filter(t => t.userId === currentUser.id)
    .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  // ========== HITUNG STATISTIK ==========
  let totalBerat = 0;
  let totalPendapatan = 0;

  transaksiUser.forEach(trx => {
    if (trx.items && Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        totalBerat += item.berat || 0;
      });
    }
    
    if (trx.status === 'Dibayar' || trx.status === 'Selesai') {
      totalPendapatan += trx.totalEstimasi || 0;
    }
  });

  document.getElementById('statTotalTransaksi').textContent = transaksiUser.length;
  document.getElementById('statTotalBerat').textContent = totalBerat.toFixed(1) + ' kg';
  document.getElementById('statTotalPendapatan').textContent = formatRupiah(totalPendapatan);

  // ========== STATE FILTER ==========
  let filterAktif = 'all';

  // ========== RENDER LIST ==========
  function renderRiwayat() {
    const list = document.getElementById('riwayatList');
    const emptyState = document.getElementById('emptyState');
    
    if (!list || !emptyState) return;

    // Filter data
    let filtered = transaksiUser;
    if (filterAktif !== 'all') {
      filtered = transaksiUser.filter(t => {
        const status = (t.status || '').toLowerCase();
        if (filterAktif === 'menunggu') return status.includes('menunggu') || status.includes('verifikasi');
        if (filterAktif === 'diproses') return status.includes('tugas') || status.includes('dijemput') || status.includes('diperiksa') || status.includes('proses');
        if (filterAktif === 'selesai') return status.includes('selesai') || status.includes('dibayar') || status.includes('diterima');
        return true;
      });
    }

    // Kalau kosong, tampilkan empty state
    if (filtered.length === 0) {
      emptyState.style.display = 'block';
      list.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    list.style.display = 'flex';
    list.innerHTML = '';

    filtered.forEach(trx => {
      const card = document.createElement('div');
      const statusClass = getStatusClass(trx.status);
      const statusIcon = getStatusIcon(trx.status);
      
      card.className = 'transaksi-card status-' + statusClass;

      // Item list
      let itemsHtml = '';
      if (trx.items && Array.isArray(trx.items)) {
        trx.items.forEach(item => {
          itemsHtml += 
            '<div class="transaksi-item">' +
              '<i class="fas fa-circle"></i>' +
              '<span><strong>' + item.nama + '</strong> - ' + item.berat + ' kg</span>' +
            '</div>';
        });
      } else {
        itemsHtml = '<div class="transaksi-item">Tidak ada detail item</div>';
      }

      card.innerHTML = 
        '<div class="transaksi-header">' +
          '<div class="transaksi-id">' +
            '<strong>' + (trx.id || '-') + '</strong>' +
            '<span class="transaksi-tanggal">' +
              '<i class="fas fa-calendar"></i> ' + formatTanggal(trx.tanggal) +
            '</span>' +
          '</div>' +
          '<span class="status-badge status-' + statusClass + '">' +
            '<i class="fas ' + statusIcon + '"></i> ' + (trx.status || 'Menunggu') +
          '</span>' +
        '</div>' +
        '<div class="transaksi-body">' +
          '<div class="transaksi-items">' + itemsHtml + '</div>' +
          '<div class="transaksi-total">' +
            '<span class="label">Total Estimasi</span>' +
            '<span class="value">' + formatRupiah(trx.totalEstimasi || 0) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="transaksi-footer">' +
          '<span class="transaksi-alamat">' +
            '<i class="fas fa-map-marker-alt"></i> ' + (trx.alamat || trx.kecamatan || '-') +
          '</span>' +
          '<button class="btn-detail" data-id="' + trx.id + '">' +
            '<i class="fas fa-eye"></i> Detail' +
          '</button>' +
        '</div>';

        // Event listener tombol detail → redirect ke halaman detail
      card.querySelector('.btn-detail')?.addEventListener('click', () => {
        window.location.href = 'detail-transaksi.html?id=' + trx.id;
      });

      list.appendChild(card);
    });
  }

  // ========== FILTER BUTTONS ==========
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAktif = btn.dataset.filter;
      renderRiwayat();
    });
  });

  // ========== SHOW DETAIL ==========
  function showDetailTransaksi(trx) {
    let itemsText = '';
    if (trx.items && Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        itemsText += '• ' + item.nama + ' - ' + item.berat + ' kg × Rp ' + item.harga.toLocaleString('id-ID') + '\n';
      });
    }

    alert(
      'DETAIL TRANSAKSI\n' +
      '━━━━━━━━━━━━━━━━━━━━━\n' +
      'ID: ' + trx.id + '\n' +
      'Tanggal: ' + formatTanggal(trx.tanggal) + '\n' +
      'Status: ' + trx.status + '\n\n' +
      'Items:\n' + itemsText + '\n' +
      'Total: ' + formatRupiah(trx.totalEstimasi || 0) + '\n' +
      'Alamat: ' + (trx.alamat || trx.kecamatan || '-')
    );
  }

  // ========== HELPER ==========
  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function getStatusClass(status) {
    if (!status) return 'menunggu';
    const s = status.toLowerCase();
    if (s.includes('menunggu') || s.includes('verifikasi')) return 'menunggu';
    if (s.includes('tugas') || s.includes('dijemput') || s.includes('diperiksa') || s.includes('proses')) return 'diproses';
    if (s.includes('selesai') || s.includes('dibayar') || s.includes('diterima')) return 'selesai';
    return 'menunggu';
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

  // ========== INIT ==========
  renderRiwayat();

});