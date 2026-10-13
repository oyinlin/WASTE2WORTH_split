/* ============================================
   TARIK DANA JS - Fitur Withdraw Pelanggan
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

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

  document.getElementById('userName').textContent = currentUser.nama || 'Pelanggan';
  document.getElementById('userAvatar').textContent = (currentUser.nama || 'P').charAt(0).toUpperCase();

  // ========== HITUNG SALDO ==========
  function hitungSaldo() {
    const pengajuan = JSON.parse(localStorage.getItem('pengajuan') || '[]');
    const transaksiPelanggan = pengajuan.filter(t => t.userId === currentUser.id);

    let totalPendapatan = 0;
    let totalPenarikan = 0;

    transaksiPelanggan.forEach(trx => {
      if (trx.status === 'Dana Diterima' || trx.status === 'Dibayar') {
        totalPendapatan += trx.nilaiAkhir || trx.totalEstimasi || 0;
      }
    });

    const penarikan = JSON.parse(localStorage.getItem('penarikan') || '[]');
    penarikan.forEach(p => {
      if (p.userId === currentUser.id && (p.status === 'Selesai' || p.status === 'Diproses')) {
        totalPenarikan += p.jumlah;
      }
    });

    const saldo = totalPendapatan - totalPenarikan;
    return saldo > 0 ? saldo : 0;
  }

  function updateSaldo() {
    const saldo = hitungSaldo();
    document.getElementById('saldoValue').textContent = 'Rp ' + saldo.toLocaleString('id-ID');
  }

  updateSaldo();

  // ========== TAB SWITCHER ==========
  document.querySelectorAll('.tab-btn-tarik').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn-tarik').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-tarik').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');

      if (tab === 'riwayat') renderRiwayat();
    });
  });

  // ========== HELPER ==========
  function setError(id, msg) {
    const el = document.getElementById('error-' + id);
    if (el) el.textContent = msg;
  }

  function clearErrors(prefix) {
    const ids = prefix === 'rek' 
      ? ['bank', 'rekening', 'namaRek', 'jumlahRek']
      : ['wallet', 'noHp', 'namaWallet', 'jumlahWallet'];
    ids.forEach(id => setError(id, ''));
  }

  // ========== QUICK BUTTONS ==========
  document.querySelectorAll('.btn-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      const input = document.getElementById('inputJumlahRek');
      if (amount === 'all') input.value = hitungSaldo();
      else input.value = amount;
    });
  });

  document.querySelectorAll('.btn-quick-wallet').forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      const input = document.getElementById('inputJumlahWallet');
      if (amount === 'all') input.value = hitungSaldo();
      else input.value = amount;
    });
  });

  // ========== AJUKAN PENARIKAN REKENING ==========
  document.getElementById('btnTarikRek')?.addEventListener('click', () => {
    clearErrors('rek');

    const bank = document.querySelector('input[name="bank"]:checked')?.value;
    const rekening = document.getElementById('inputRekening').value.trim();
    const namaRek = document.getElementById('inputNamaRek').value.trim();
    const jumlah = parseInt(document.getElementById('inputJumlahRek').value);
    const saldo = hitungSaldo();

    let valid = true;

    if (!bank) { setError('bank', 'Pilih bank terlebih dahulu'); valid = false; }
    if (!rekening || rekening.length < 8) { setError('rekening', 'Nomor rekening minimal 8 digit'); valid = false; }
    if (!namaRek || namaRek.length < 3) { setError('namaRek', 'Nama minimal 3 karakter'); valid = false; }
    if (!jumlah || jumlah < 10000) { setError('jumlahRek', 'Minimal penarikan Rp 10.000'); valid = false; }
    else if (jumlah > saldo) { setError('jumlahRek', 'Saldo tidak cukup. Saldo kamu: Rp ' + saldo.toLocaleString('id-ID')); valid = false; }

    if (!valid) return;

    prosesPenarikan({
      metode: 'Bank',
      bank: bank,
      rekening: rekening,
      namaPemilik: namaRek,
      jumlah: jumlah
    });
  });

  // ========== AJUKAN PENARIKAN EWALLET ==========
  document.getElementById('btnTarikWallet')?.addEventListener('click', () => {
    clearErrors('wallet');

    const wallet = document.querySelector('input[name="wallet"]:checked')?.value;
    const noHp = document.getElementById('inputNoHp').value.trim();
    const namaWallet = document.getElementById('inputNamaWallet').value.trim();
    const jumlah = parseInt(document.getElementById('inputJumlahWallet').value);
    const saldo = hitungSaldo();

    let valid = true;

    if (!wallet) { setError('wallet', 'Pilih e-wallet terlebih dahulu'); valid = false; }
    
    const cleanHp = noHp.replace(/[\s-]/g, '');
    if (!cleanHp || !/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(cleanHp)) {
      setError('noHp', 'Format nomor HP tidak valid'); valid = false;
    }
    
    if (!namaWallet || namaWallet.length < 3) { setError('namaWallet', 'Nama minimal 3 karakter'); valid = false; }
    if (!jumlah || jumlah < 10000) { setError('jumlahWallet', 'Minimal penarikan Rp 10.000'); valid = false; }
    else if (jumlah > saldo) { setError('jumlahWallet', 'Saldo tidak cukup. Saldo kamu: Rp ' + saldo.toLocaleString('id-ID')); valid = false; }

    if (!valid) return;

    prosesPenarikan({
      metode: 'E-Wallet',
      wallet: wallet,
      noHp: noHp,
      namaPemilik: namaWallet,
      jumlah: jumlah
    });
  });

  // ========== PROSES PENARIKAN ==========
  function prosesPenarikan(data) {
    const penarikan = JSON.parse(localStorage.getItem('penarikan') || '[]');

    const newPenarikan = {
      id: 'WD-' + Date.now().toString().slice(-8),
      userId: currentUser.id,
      userNama: currentUser.nama,
      userTelepon: currentUser.telepon,
      metode: data.metode,
      bank: data.bank || null,
      rekening: data.rekening || null,
      wallet: data.wallet || null,
      noHp: data.noHp || null,
      namaPemilik: data.namaPemilik,
      jumlah: data.jumlah,
      status: 'Menunggu',
      tanggal: new Date().toISOString()
    };

    penarikan.push(newPenarikan);
    localStorage.setItem('penarikan', JSON.stringify(penarikan));

    showToast('Pengajuan penarikan berhasil! Menunggu konfirmasi admin.', 'success');

    // Reset form
    document.getElementById('inputRekening').value = '';
    document.getElementById('inputNamaRek').value = '';
    document.getElementById('inputJumlahRek').value = '';
    document.getElementById('inputNoHp').value = '';
    document.getElementById('inputNamaWallet').value = '';
    document.getElementById('inputJumlahWallet').value = '';
    document.querySelectorAll('input[name="bank"], input[name="wallet"]').forEach(r => r.checked = false);

    setTimeout(() => {
      document.querySelector('[data-tab="riwayat"]').click();
    }, 1000);
  }

  // ========== RENDER RIWAYAT ==========
  function renderRiwayat() {
    const list = document.getElementById('riwayatList');
    const empty = document.getElementById('emptyRiwayat');
    if (!list) return;

    const penarikan = JSON.parse(localStorage.getItem('penarikan') || '[]')
      .filter(p => p.userId === currentUser.id)
      .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

    if (penarikan.length === 0) {
      empty.style.display = 'block';
      list.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    list.style.display = 'flex';
    list.innerHTML = '';

    penarikan.forEach(p => {
      const isBank = p.metode === 'Bank';
      const statusClass = p.status.toLowerCase();

      const item = document.createElement('div');
      item.className = 'riwayat-item';
      item.innerHTML = 
        '<div class="riwayat-icon ' + (isBank ? 'bank' : 'wallet') + '">' +
          '<i class="fas fa-' + (isBank ? 'university' : 'mobile-alt') + '"></i>' +
        '</div>' +
        '<div class="riwayat-content">' +
          '<h4>' + (isBank ? 'Transfer ' + p.bank : p.wallet) + '</h4>' +
          '<p>' + (isBank ? 'Rek: ' + p.rekening : 'HP: ' + p.noHp) + ' • ' + formatTanggal(p.tanggal) + '</p>' +
        '</div>' +
        '<div class="riwayat-right">' +
          '<span class="riwayat-amount">Rp ' + p.jumlah.toLocaleString('id-ID') + '</span>' +
          '<span class="badge-status ' + statusClass + '">' + p.status + '</span>' +
        '</div>';

      list.appendChild(item);
    });
  }

  function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="fas fa-' + (type === 'success' ? 'check-circle' : 'info-circle') + '"></i><span>' + message + '</span>';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

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

  renderRiwayat();

});

function logoutUser() {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}