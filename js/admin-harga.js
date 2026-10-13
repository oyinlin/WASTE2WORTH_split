/* ============================================
   ADMIN HARGA JS
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

  // ========== STATE ==========
  let dataHarga = [];
  let editId = null;
  let hapusId = null;

  // ========== DEFAULT DATA ==========
  const defaultHarga = [
    { id: 1, nama: 'Plastik PET', kategori: 'Plastik', harga: 5000, keterangan: 'Botol air mineral bening', tanggalUpdate: new Date().toISOString() },
    { id: 2, nama: 'Plastik HDPE', kategori: 'Plastik', harga: 4500, keterangan: 'Botol sabun, shampoo', tanggalUpdate: new Date().toISOString() },
    { id: 3, nama: 'Kardus', kategori: 'Kertas', harga: 4000, keterangan: 'Kardus bekas kemasan', tanggalUpdate: new Date().toISOString() },
    { id: 4, nama: 'Kertas HVS', kategori: 'Kertas', harga: 3000, keterangan: 'Kertas putih bekas', tanggalUpdate: new Date().toISOString() },
    { id: 5, nama: 'Logam Tembaga', kategori: 'Logam', harga: 10000, keterangan: 'Kawat tembaga, pipa', tanggalUpdate: new Date().toISOString() },
    { id: 6, nama: 'Kaleng Aluminium', kategori: 'Logam', harga: 7000, keterangan: 'Kaleng minuman ringan', tanggalUpdate: new Date().toISOString() },
    { id: 7, nama: 'Botol Kaca', kategori: 'Kaca', harga: 2000, keterangan: 'Botol kaca bening', tanggalUpdate: new Date().toISOString() },
    { id: 8, nama: 'Kertas Koran', kategori: 'Kertas', harga: 2500, keterangan: 'Koran bekas', tanggalUpdate: new Date().toISOString() }
  ];

  // ========== LOAD DATA ==========
  function loadData() {
    const saved = localStorage.getItem('hargaSampah');
    if (saved) {
      try {
        dataHarga = JSON.parse(saved);
      } catch (e) {
        dataHarga = [...defaultHarga];
      }
    } else {
      dataHarga = [...defaultHarga];
      saveData();
    }
  }

  function saveData() {
    localStorage.setItem('hargaSampah', JSON.stringify(dataHarga));
  }

  // ========== HELPER ==========
  function formatRupiah(angka) {
    return 'Rp ' + Number(angka).toLocaleString('id-ID');
  }

  function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function getKategoriClass(kat) {
    if (!kat) return 'lainnya';
    return kat.toLowerCase();
  }

  // ========== HITUNG STATISTIK ==========
  function hitungStatistik() {
    document.getElementById('statTotal').textContent = dataHarga.length;
    
    if (dataHarga.length > 0) {
      const hargas = dataHarga.map(h => h.harga);
      document.getElementById('statTertinggi').textContent = formatRupiah(Math.max(...hargas));
      document.getElementById('statTerendah').textContent = formatRupiah(Math.min(...hargas));
    } else {
      document.getElementById('statTertinggi').textContent = 'Rp 0';
      document.getElementById('statTerendah').textContent = 'Rp 0';
    }
  }

  // ========== RENDER TABEL ==========
  function renderTabel(filter = '') {
    const body = document.getElementById('bodyHarga');
    const empty = document.getElementById('emptyHarga');
    const tableWrapper = document.querySelector('.table-wrapper');

    let filtered = dataHarga;
    if (filter) {
      const kw = filter.toLowerCase();
      filtered = dataHarga.filter(h => 
        h.nama.toLowerCase().includes(kw) ||
        h.kategori.toLowerCase().includes(kw)
      );
    }

    if (filtered.length === 0) {
      body.innerHTML = '';
      empty.style.display = 'block';
      tableWrapper.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    tableWrapper.style.display = 'block';
    body.innerHTML = '';

    filtered.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = 
        '<td><strong>' + item.nama + '</strong>' +
          (item.keterangan ? '<div style="font-size:12px;color:#9e9e9e;margin-top:2px;">' + item.keterangan + '</div>' : '') +
        '</td>' +
        '<td><span class="badge-kategori ' + getKategoriClass(item.kategori) + '">' + item.kategori + '</span></td>' +
        '<td><span class="harga-text">' + formatRupiah(item.harga) + '</span><span style="font-size:12px;color:#9e9e9e;"> /kg</span></td>' +
        '<td><span class="tanggal-text">' + formatTanggal(item.tanggalUpdate) + '</span></td>' +
        '<td>' +
          '<div class="action-buttons">' +
            '<button class="btn-icon edit" data-id="' + item.id + '" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn-icon delete" data-id="' + item.id + '" title="Hapus"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';

      body.appendChild(row);
    });

    // Event listeners
    document.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', () => bukaModalEdit(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
      btn.addEventListener('click', () => bukaModalHapus(parseInt(btn.dataset.id)));
    });
  }

  // ========== MODAL TAMBAH/EDIT ==========
  const modal = document.getElementById('modalHarga');
  const modalTitle = document.getElementById('modalTitle');

  function bukaModalTambah() {
    editId = null;
    modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Harga Baru';
    document.getElementById('inputNama').value = '';
    document.getElementById('inputKategori').value = '';
    document.getElementById('inputHarga').value = '';
    document.getElementById('inputKeterangan').value = '';
    document.getElementById('error-nama').textContent = '';
    document.getElementById('error-kategori').textContent = '';
    document.getElementById('error-harga').textContent = '';
    modal.classList.add('active');
  }

  function bukaModalEdit(id) {
    const item = dataHarga.find(h => h.id === id);
    if (!item) return;

    editId = id;
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Harga';
    document.getElementById('inputNama').value = item.nama;
    document.getElementById('inputKategori').value = item.kategori;
    document.getElementById('inputHarga').value = item.harga;
    document.getElementById('inputKeterangan').value = item.keterangan || '';
    document.getElementById('error-nama').textContent = '';
    document.getElementById('error-kategori').textContent = '';
    document.getElementById('error-harga').textContent = '';
    modal.classList.add('active');
  }

  function tutupModal() {
    modal.classList.remove('active');
    editId = null;
  }

  document.getElementById('btnTambahHarga')?.addEventListener('click', bukaModalTambah);
  document.getElementById('modalClose')?.addEventListener('click', tutupModal);
  document.getElementById('btnBatal')?.addEventListener('click', tutupModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) tutupModal();
  });

  // ========== SIMPAN ==========
  document.getElementById('btnSimpan')?.addEventListener('click', () => {
    const nama = document.getElementById('inputNama').value.trim();
    const kategori = document.getElementById('inputKategori').value;
    const harga = parseInt(document.getElementById('inputHarga').value);
    const keterangan = document.getElementById('inputKeterangan').value.trim();

    let valid = true;

    if (!nama || nama.length < 3) {
      document.getElementById('error-nama').textContent = 'Nama minimal 3 karakter';
      valid = false;
    } else {
      document.getElementById('error-nama').textContent = '';
    }

    if (!kategori) {
      document.getElementById('error-kategori').textContent = 'Kategori wajib dipilih';
      valid = false;
    } else {
      document.getElementById('error-kategori').textContent = '';
    }

    if (!harga || harga < 100) {
      document.getElementById('error-harga').textContent = 'Harga minimal Rp 100';
      valid = false;
    } else {
      document.getElementById('error-harga').textContent = '';
    }

    if (!valid) return;

    if (editId) {
      // Edit
      const index = dataHarga.findIndex(h => h.id === editId);
      if (index !== -1) {
        dataHarga[index].nama = nama;
        dataHarga[index].kategori = kategori;
        dataHarga[index].harga = harga;
        dataHarga[index].keterangan = keterangan;
        dataHarga[index].tanggalUpdate = new Date().toISOString();
      }
    } else {
      // Tambah
      const newId = dataHarga.length > 0 ? Math.max(...dataHarga.map(h => h.id)) + 1 : 1;
      dataHarga.push({
        id: newId,
        nama: nama,
        kategori: kategori,
        harga: harga,
        keterangan: keterangan,
        tanggalUpdate: new Date().toISOString()
      });
    }

    saveData();
    tutupModal();
    hitungStatistik();
    renderTabel(document.getElementById('searchHarga').value);
  });

  // ========== MODAL HAPUS ==========
  const modalHapus = document.getElementById('modalHapus');

  function bukaModalHapus(id) {
    const item = dataHarga.find(h => h.id === id);
    if (!item) return;

    hapusId = id;
    document.getElementById('namaHapus').textContent = item.nama + ' (' + formatRupiah(item.harga) + '/kg)';
    modalHapus.classList.add('active');
  }

  function tutupModalHapus() {
    modalHapus.classList.remove('active');
    hapusId = null;
  }

  document.getElementById('modalCloseHapus')?.addEventListener('click', tutupModalHapus);
  document.getElementById('btnBatalHapus')?.addEventListener('click', tutupModalHapus);
  modalHapus?.addEventListener('click', (e) => {
    if (e.target === modalHapus) tutupModalHapus();
  });

  document.getElementById('btnKonfirmasiHapus')?.addEventListener('click', () => {
    if (!hapusId) return;
    dataHarga = dataHarga.filter(h => h.id !== hapusId);
    saveData();
    tutupModalHapus();
    hitungStatistik();
    renderTabel(document.getElementById('searchHarga').value);
  });

  // ========== SEARCH ==========
  document.getElementById('searchHarga')?.addEventListener('input', (e) => {
    renderTabel(e.target.value.trim());
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

  // ========== INIT ==========
  loadData();
  hitungStatistik();
  renderTabel();

});

function logoutUser() {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}