/* ============================================
   DETAIL TRANSAKSI JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== CEK LOGIN ==========
  const currentUser = Auth.getUser();
  
  if (!currentUser) {
    alert('Silakan login terlebih dahulu');
    window.location.href = 'login.html';
    return;
  }

  // ========== AMBIL ID DARI URL ==========
  const urlParams = new URLSearchParams(window.location.search);
  const trxId = urlParams.get('id');

  if (!trxId) {
    showNotFound();
    return;
  }

  // ========== CARI TRANSAKSI ==========
  const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
  const transaksi = semuaPengajuan.find(t => 
    t.id === trxId && t.userId === currentUser.id
  );

  if (!transaksi) {
    showNotFound();
    return;
  }

  // ========== RENDER ==========
  renderDetail(transaksi);

  // ========== FUNGSI RENDER ==========
  function renderDetail(trx) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('contentState').style.display = 'block';

    // Header
    document.getElementById('trxId').textContent = trx.id || '-';
    document.getElementById('trxTanggal').textContent = 'Tanggal: ' + formatTanggalLengkap(trx.tanggal);

    // Status badge
    const statusBadge = document.getElementById('statusBadge');
    const statusClass = getStatusClass(trx.status);
    const statusIcon = getStatusIcon(trx.status);
    statusBadge.className = 'status-badge status-' + statusClass;
    statusBadge.innerHTML = '<i class="fas ' + statusIcon + '"></i> ' + (trx.status || 'Menunggu');

    // Info Pelanggan
    document.getElementById('infoNama').textContent = trx.pelangganNama || '-';
    document.getElementById('infoTelepon').textContent = trx.telepon || '-';
    document.getElementById('infoKecamatan').textContent = formatKecamatan(trx.kecamatan);
    document.getElementById('infoAlamat').textContent = trx.alamat || '-';
    
    if (trx.catatan) {
      document.getElementById('rowCatatan').style.display = 'flex';
      document.getElementById('infoCatatan').textContent = trx.catatan;
    }

    // Jadwal
    document.getElementById('infoTanggalJemput').textContent = trx.tanggalJemput ? formatTanggalLengkap(trx.tanggalJemput) : '-';
    document.getElementById('infoJamJemput').textContent = trx.jamJemput || '-';

    // Daftar Sampah
    const bodyDetail = document.getElementById('bodyDetailSampah');
    bodyDetail.innerHTML = '';
    let total = 0;

    if (trx.items && Array.isArray(trx.items)) {
      trx.items.forEach(item => {
        const subtotal = item.berat * item.harga;
        total += subtotal;

        const row = document.createElement('tr');
        row.innerHTML = 
          '<td><strong>' + item.nama + '</strong></td>' +
          '<td>' + item.berat + ' kg</td>' +
          '<td>Rp ' + item.harga.toLocaleString('id-ID') + '</td>' +
          '<td><strong>Rp ' + subtotal.toLocaleString('id-ID') + '</strong></td>';
        bodyDetail.appendChild(row);
      });
    }

    document.getElementById('totalEstimasi').textContent = 'Rp ' + total.toLocaleString('id-ID');
    document.getElementById('totalBayar').textContent = 'Rp ' + (trx.totalEstimasi || total).toLocaleString('id-ID');

    // Status Pembayaran
    const statusBayar = document.getElementById('statusBayar');
    const isPaid = trx.status === 'Dibayar' || trx.status === 'Dana Diterima';
    
    if (isPaid) {
      statusBayar.className = 'payment-status paid';
      statusBayar.innerHTML = '<i class="fas fa-check-circle"></i> Sudah Dibayar';
    } else {
      statusBayar.className = 'payment-status';
      statusBayar.innerHTML = '<i class="fas fa-hourglass-half"></i> Belum Dibayar';
    }

    // Tampilkan tombol konfirmasi kalau status "Dibayar"
    if (trx.status === 'Dibayar') {
      document.getElementById('konfirmasiDanaBox').style.display = 'block';
    }

    // Timeline
    renderTimeline(trx.status);
  }

  // ========== TIMELINE ==========
  function renderTimeline(currentStatus) {
    const steps = [
      { key: 'Menunggu Verifikasi', title: 'Menunggu Verifikasi', desc: 'Pengajuan kamu sedang diverifikasi admin', icon: 'fa-clock' },
      { key: 'Ditugaskan', title: 'Ditugaskan ke Supir', desc: 'Admin sudah menugaskan supir untuk jemput', icon: 'fa-user-check' },
      { key: 'Dijemput', title: 'Dalam Penjemputan', desc: 'Supir sedang menuju lokasimu', icon: 'fa-truck' },
      { key: 'Sedang Diperiksa', title: 'Sedang Diperiksa', desc: 'Sampah sedang ditimbang oleh supir', icon: 'fa-weight-hanging' },
      { key: 'Selesai', title: 'Selesai', desc: 'Sampah sudah diterima bank sampah', icon: 'fa-check-circle' },
      { key: 'Dibayar', title: 'Dibayar', desc: 'Dana sudah ditransfer ke rekeningmu', icon: 'fa-money-bill-wave' },
      { key: 'Dana Diterima', title: 'Dana Diterima', desc: 'Kamu sudah konfirmasi dana diterima', icon: 'fa-hand-holding-usd' }
    ];

    const currentIndex = steps.findIndex(s => 
      currentStatus && currentStatus.toLowerCase().includes(s.key.toLowerCase())
    );

    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';

    steps.forEach((step, index) => {
      const item = document.createElement('div');
      item.className = 'timeline-item';

      if (index < currentIndex) {
        item.classList.add('done');
      } else if (index === currentIndex) {
        item.classList.add('current');
      }

      const dotIcon = index < currentIndex ? 'fa-check' : step.icon;

      item.innerHTML = 
        '<div class="timeline-dot"><i class="fas ' + dotIcon + '"></i></div>' +
        '<div class="timeline-content">' +
          '<h4>' + step.title + '</h4>' +
          '<p>' + step.desc + '</p>' +
        '</div>';

      timeline.appendChild(item);
    });
  }

  // ========== TOMBOL KONFIRMASI DANA ==========
  document.getElementById('btnKonfirmasiDana')?.addEventListener('click', () => {
    if (!confirm('Yakin dana sudah kamu terima?')) return;

    const semuaPengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
    const index = semuaPengajuan.findIndex(t => t.id === trxId);
    
    if (index !== -1) {
      semuaPengajuan[index].status = 'Dana Diterima';
      semuaPengajuan[index].tanggalDiterima = new Date().toISOString();
      localStorage.setItem('pengajuan', JSON.stringify(semuaPengajuan));

      showToast('Terima kasih! Transaksi selesai.', 'success');

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  });

  // ========== FUNGSI NOT FOUND ==========
  function showNotFound() {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('notFoundState').style.display = 'block';
  }

  // ========== HELPER ==========
  function formatTanggalLengkap(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function formatKecamatan(kec) {
    if (!kec) return '-';
    return kec.split('-').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
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
    if (s.includes('tugas')) return 'fa-user-check';
    if (s.includes('dijemput')) return 'fa-truck';
    if (s.includes('diperiksa')) return 'fa-weight-hanging';
    if (s.includes('dibayar')) return 'fa-money-bill-wave';
    if (s.includes('diterima')) return 'fa-hand-holding-usd';
    if (s.includes('selesai')) return 'fa-check-circle';
    return 'fa-clock';
  }

  // ========== TOAST ==========
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = 
      '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'info-circle') + '"></i>' +
      '<span>' + message + '</span>';
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.4s ease reverse';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

});