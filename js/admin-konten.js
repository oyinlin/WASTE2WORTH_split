/* ============================================
   ADMIN KONTEN JS
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
  let dataKatalog = [];
  let dataBerita = [];
  let dataEdukasi = [];
  let editId = { katalog: null, berita: null, edukasi: null };
  let hapusData = { tipe: null, id: null };

  // ========== DEFAULT DATA ==========
  const defaultKatalog = [
    { id: 1, nama: 'Tas dari Kain Perca', deskripsi: 'Tas cantik dari kain perca daur ulang', harga: 45000, toko: 'UMKM Medan Kreatif', kategori: 'Tas', icon: 'fa-shopping-bag', badge: 'Best Seller' },
    { id: 2, nama: 'Vas Bunga dari Botol Plastik', deskripsi: 'Vas unik dari botol plastik bekas', harga: 35000, toko: 'Bank Sampah Medan Barat', kategori: 'Dekorasi', icon: 'fa-wine-bottle', badge: '' },
    { id: 3, nama: 'Dompet dari Kardus', deskripsi: 'Dompet ramah lingkungan dari kardus', harga: 25000, toko: 'UMKM Denai', kategori: 'Aksesoris', icon: 'fa-wallet', badge: 'Baru' },
    { id: 4, nama: 'Lampu Hias dari Kaleng', deskripsi: 'Lampu hias cantik dari kaleng bekas', harga: 75000, toko: 'Medan Craft', kategori: 'Dekorasi', icon: 'fa-lightbulb', badge: '' },
    { id: 5, nama: 'Pot Tanaman dari Plastik', deskripsi: 'Pot tanaman dari plastik daur ulang', harga: 20000, toko: 'Bank Sampah Medan Timur', kategori: 'Tanaman', icon: 'fa-seedling', badge: 'Best Seller' },
    { id: 6, nama: 'Buku Catatan dari Kertas Bekas', deskripsi: 'Buku catatan dari kertas daur ulang', harga: 30000, toko: 'UMKM Medan Pintar', kategori: 'Alat Tulis', icon: 'fa-book', badge: '' }
  ];

  const defaultBerita = [
    { id: 1, judul: 'Pemko Medan Resmikan 10 Bank Sampah Baru', ringkasan: 'Pemerintah Kota Medan meresmikan 10 bank sampah baru di berbagai kecamatan untuk mendukung pengelolaan sampah yang lebih baik.', kategori: 'Pemerintahan', icon: 'fa-city', tanggal: '10 Maret 2026' },
    { id: 2, judul: 'Harga Sampah Plastik Naik 15% di Maret 2026', ringkasan: 'Bank Sampah Medan menaikkan harga beli sampah plastik jenis PET hingga 15% seiring meningkatnya permintaan industri daur ulang.', kategori: 'Ekonomi', icon: 'fa-chart-line', tanggal: '5 Maret 2026' },
    { id: 3, judul: 'Waste2Worth Raih Penghargaan Inovasi Digital', ringkasan: 'Platform bank sampah digital Waste2Worth mendapatkan penghargaan inovasi terbaik kategori lingkungan dari Pemko Medan.', kategori: 'Prestasi', icon: 'fa-trophy', tanggal: '28 Februari 2026' }
  ];

  const defaultEdukasi = [
    { id: 1, judul: 'Mengapa Daur Ulang Penting untuk Bumi?', ringkasan: 'Daur ulang membantu mengurangi sampah di TPA dan menghemat sumber daya alam. Yuk pelajari manfaatnya!', kategori: 'Lingkungan', icon: 'fa-globe', tanggal: '10 Maret 2026' },
    { id: 2, judul: 'Jenis Plastik yang Bisa Didaur Ulang', ringkasan: 'Tidak semua plastik bisa didaur ulang. Kenali jenis-jenisnya agar kamu tidak salah pilih.', kategori: 'Tips', icon: 'fa-recycle', tanggal: '8 Maret 2026' },
    { id: 3, judul: '5 Cara Mudah Memilah Sampah di Rumah', ringkasan: 'Panduan praktis memilah sampah organik, anorganik, dan B3 dari rumahmu.', kategori: 'Panduan', icon: 'fa-home', tanggal: '5 Maret 2026' }
  ];

  // ========== LOAD DATA ==========
  function loadAll() {
    dataKatalog = JSON.parse(localStorage.getItem('katalogProduk') || 'null') || [...defaultKatalog];
    dataBerita = JSON.parse(localStorage.getItem('beritaList') || 'null') || [...defaultBerita];
    dataEdukasi = JSON.parse(localStorage.getItem('edukasiList') || 'null') || [...defaultEdukasi];
  }

  function saveAll() {
    localStorage.setItem('katalogProduk', JSON.stringify(dataKatalog));
    localStorage.setItem('beritaList', JSON.stringify(dataBerita));
    localStorage.setItem('edukasiList', JSON.stringify(dataEdukasi));
  }

  function getKategoriClass(kat) {
    if (!kat) return 'lainnya';
    return kat.toLowerCase().replace(/\s+/g, '-');
  }

  // ========== TAB ==========
  document.querySelectorAll('.tab-btn-konten').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn-konten').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-konten').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });

  // ========== RENDER KATALOG ==========
  function renderKatalog(filter = '') {
    const body = document.getElementById('bodyKatalog');
    const empty = document.getElementById('emptyKatalog');
    const wrapper = document.querySelector('#tab-katalog .table-wrapper');

    let filtered = dataKatalog;
    if (filter) {
      const kw = filter.toLowerCase();
      filtered = dataKatalog.filter(k => 
        k.nama.toLowerCase().includes(kw) ||
        k.kategori.toLowerCase().includes(kw) ||
        k.toko.toLowerCase().includes(kw)
      );
    }

    if (filtered.length === 0) {
      body.innerHTML = '';
      empty.style.display = 'block';
      wrapper.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    wrapper.style.display = 'block';
    body.innerHTML = '';

    filtered.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = 
        '<td>' +
          '<strong>' + item.nama + '</strong>' +
          '<div style="font-size:12px;color:#9e9e9e;margin-top:2px;">' + item.deskripsi + '</div>' +
        '</td>' +
        '<td><span class="badge-kategori ' + getKategoriClass(item.kategori) + '">' + item.kategori + '</span></td>' +
        '<td><span class="harga-text">Rp ' + item.harga.toLocaleString('id-ID') + '</span></td>' +
        '<td style="font-size:13px;color:#616161;">' + item.toko + '</td>' +
        '<td>' +
          '<div class="action-buttons">' +
            '<button class="btn-icon edit" data-id="' + item.id + '" data-tipe="katalog" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn-icon delete" data-id="' + item.id + '" data-tipe="katalog" title="Hapus"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';
      body.appendChild(row);
    });

    attachActionButtons();
  }

  // ========== RENDER BERITA ==========
  function renderBerita(filter = '') {
    const body = document.getElementById('bodyBerita');
    const empty = document.getElementById('emptyBerita');
    const wrapper = document.querySelector('#tab-berita .table-wrapper');

    let filtered = dataBerita;
    if (filter) {
      const kw = filter.toLowerCase();
      filtered = dataBerita.filter(b => 
        b.judul.toLowerCase().includes(kw) ||
        b.kategori.toLowerCase().includes(kw)
      );
    }

    if (filtered.length === 0) {
      body.innerHTML = '';
      empty.style.display = 'block';
      wrapper.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    wrapper.style.display = 'block';
    body.innerHTML = '';

    filtered.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = 
        '<td><strong>' + item.judul + '</strong>' +
          '<div style="font-size:12px;color:#9e9e9e;margin-top:2px;">' + item.ringkasan.substring(0, 80) + '...</div>' +
        '</td>' +
        '<td><span class="badge-kategori ' + getKategoriClass(item.kategori) + '">' + item.kategori + '</span></td>' +
        '<td style="font-size:12px;color:#9e9e9e;">' + item.tanggal + '</td>' +
        '<td>' +
          '<div class="action-buttons">' +
            '<button class="btn-icon edit" data-id="' + item.id + '" data-tipe="berita" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn-icon delete" data-id="' + item.id + '" data-tipe="berita" title="Hapus"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';
      body.appendChild(row);
    });

    attachActionButtons();
  }

  // ========== RENDER EDUKASI ==========
  function renderEdukasi(filter = '') {
    const body = document.getElementById('bodyEdukasi');
    const empty = document.getElementById('emptyEdukasi');
    const wrapper = document.querySelector('#tab-edukasi .table-wrapper');

    let filtered = dataEdukasi;
    if (filter) {
      const kw = filter.toLowerCase();
      filtered = dataEdukasi.filter(e => 
        e.judul.toLowerCase().includes(kw) ||
        e.kategori.toLowerCase().includes(kw)
      );
    }

    if (filtered.length === 0) {
      body.innerHTML = '';
      empty.style.display = 'block';
      wrapper.style.display = 'none';
      return;
    }

    empty.style.display = 'none';
    wrapper.style.display = 'block';
    body.innerHTML = '';

    filtered.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = 
        '<td><strong>' + item.judul + '</strong>' +
          '<div style="font-size:12px;color:#9e9e9e;margin-top:2px;">' + item.ringkasan.substring(0, 80) + '...</div>' +
        '</td>' +
        '<td><span class="badge-kategori ' + getKategoriClass(item.kategori) + '">' + item.kategori + '</span></td>' +
        '<td style="font-size:12px;color:#9e9e9e;">' + item.tanggal + '</td>' +
        '<td>' +
          '<div class="action-buttons">' +
            '<button class="btn-icon edit" data-id="' + item.id + '" data-tipe="edukasi" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn-icon delete" data-id="' + item.id + '" data-tipe="edukasi" title="Hapus"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';
      body.appendChild(row);
    });

    attachActionButtons();
  }

  // ========== ATTACH BUTTONS ==========
  function attachActionButtons() {
    document.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const tipe = btn.dataset.tipe;
        const id = parseInt(btn.dataset.id);
        if (tipe === 'katalog') bukaModalEditKatalog(id);
        if (tipe === 'berita') bukaModalEditBerita(id);
        if (tipe === 'edukasi') bukaModalEditEdukasi(id);
      });
    });

    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const tipe = btn.dataset.tipe;
        const id = parseInt(btn.dataset.id);
        bukaModalHapus(tipe, id);
      });
    });
  }

  // ========== MODAL HELPERS ==========
  function openModal(id) {
    document.getElementById(id).classList.add('active');
  }

  function closeModal(id) {
    document.getElementById(id).classList.remove('active');
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipe = btn.dataset.close;
      if (tipe === 'katalog') closeModal('modalKatalog');
      if (tipe === 'berita') closeModal('modalBerita');
      if (tipe === 'edukasi') closeModal('modalEdukasi');
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // ========== TAMBAH KATALOG ==========
  document.querySelector('[data-tambah="katalog"]')?.addEventListener('click', () => {
    editId.katalog = null;
    document.getElementById('modalTitleKatalog').innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Produk';
    document.getElementById('katalogNama').value = '';
    document.getElementById('katalogKategori').value = '';
    document.getElementById('katalogHarga').value = '';
    document.getElementById('katalogToko').value = '';
    document.getElementById('katalogDeskripsi').value = '';
    document.getElementById('katalogIcon').value = 'fa-shopping-bag';
    document.getElementById('katalogBadge').value = '';
    openModal('modalKatalog');
  });

  function bukaModalEditKatalog(id) {
    const item = dataKatalog.find(k => k.id === id);
    if (!item) return;
    editId.katalog = id;
    document.getElementById('modalTitleKatalog').innerHTML = '<i class="fas fa-edit"></i> Edit Produk';
    document.getElementById('katalogNama').value = item.nama;
    document.getElementById('katalogKategori').value = item.kategori;
    document.getElementById('katalogHarga').value = item.harga;
    document.getElementById('katalogToko').value = item.toko;
    document.getElementById('katalogDeskripsi').value = item.deskripsi;
    document.getElementById('katalogIcon').value = item.icon;
    document.getElementById('katalogBadge').value = item.badge || '';
    openModal('modalKatalog');
  }

  document.getElementById('btnSimpanKatalog')?.addEventListener('click', () => {
    const nama = document.getElementById('katalogNama').value.trim();
    const kategori = document.getElementById('katalogKategori').value;
    const harga = parseInt(document.getElementById('katalogHarga').value);
    const toko = document.getElementById('katalogToko').value.trim();
    const deskripsi = document.getElementById('katalogDeskripsi').value.trim();
    const icon = document.getElementById('katalogIcon').value;
    const badge = document.getElementById('katalogBadge').value;

    if (!nama || !kategori || !harga || !toko || !deskripsi) {
      alert('Lengkapi semua data yang wajib diisi');
      return;
    }

    if (editId.katalog) {
      const index = dataKatalog.findIndex(k => k.id === editId.katalog);
      if (index !== -1) {
        dataKatalog[index] = { ...dataKatalog[index], nama, kategori, harga, toko, deskripsi, icon, badge };
      }
    } else {
      const newId = dataKatalog.length > 0 ? Math.max(...dataKatalog.map(k => k.id)) + 1 : 1;
      dataKatalog.push({ id: newId, nama, kategori, harga, toko, deskripsi, icon, badge });
    }

    saveAll();
    closeModal('modalKatalog');
    renderKatalog();
  });

  // ========== TAMBAH BERITA ==========
  document.querySelector('[data-tambah="berita"]')?.addEventListener('click', () => {
    editId.berita = null;
    document.getElementById('modalTitleBerita').innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Berita';
    document.getElementById('beritaJudul').value = '';
    document.getElementById('beritaKategori').value = '';
    document.getElementById('beritaRingkasan').value = '';
    document.getElementById('beritaIcon').value = 'fa-city';
    openModal('modalBerita');
  });

  function bukaModalEditBerita(id) {
    const item = dataBerita.find(b => b.id === id);
    if (!item) return;
    editId.berita = id;
    document.getElementById('modalTitleBerita').innerHTML = '<i class="fas fa-edit"></i> Edit Berita';
    document.getElementById('beritaJudul').value = item.judul;
    document.getElementById('beritaKategori').value = item.kategori;
    document.getElementById('beritaRingkasan').value = item.ringkasan;
    document.getElementById('beritaIcon').value = item.icon;
    openModal('modalBerita');
  }

  document.getElementById('btnSimpanBerita')?.addEventListener('click', () => {
    const judul = document.getElementById('beritaJudul').value.trim();
    const kategori = document.getElementById('beritaKategori').value;
    const ringkasan = document.getElementById('beritaRingkasan').value.trim();
    const icon = document.getElementById('beritaIcon').value;

    if (!judul || !kategori || !ringkasan) {
      alert('Lengkapi semua data yang wajib diisi');
      return;
    }

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editId.berita) {
      const index = dataBerita.findIndex(b => b.id === editId.berita);
      if (index !== -1) {
        dataBerita[index] = { ...dataBerita[index], judul, kategori, ringkasan, icon };
      }
    } else {
      const newId = dataBerita.length > 0 ? Math.max(...dataBerita.map(b => b.id)) + 1 : 1;
      dataBerita.push({ id: newId, judul, kategori, ringkasan, icon, tanggal: today });
    }

    saveAll();
    closeModal('modalBerita');
    renderBerita();
  });

  // ========== TAMBAH EDUKASI ==========
  document.querySelector('[data-tambah="edukasi"]')?.addEventListener('click', () => {
    editId.edukasi = null;
    document.getElementById('modalTitleEdukasi').innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Artikel';
    document.getElementById('edukasiJudul').value = '';
    document.getElementById('edukasiKategori').value = '';
    document.getElementById('edukasiRingkasan').value = '';
    document.getElementById('edukasiIcon').value = 'fa-globe';
    openModal('modalEdukasi');
  });

  function bukaModalEditEdukasi(id) {
    const item = dataEdukasi.find(e => e.id === id);
    if (!item) return;
    editId.edukasi = id;
    document.getElementById('modalTitleEdukasi').innerHTML = '<i class="fas fa-edit"></i> Edit Artikel';
    document.getElementById('edukasiJudul').value = item.judul;
    document.getElementById('edukasiKategori').value = item.kategori;
    document.getElementById('edukasiRingkasan').value = item.ringkasan;
    document.getElementById('edukasiIcon').value = item.icon;
    openModal('modalEdukasi');
  }

  document.getElementById('btnSimpanEdukasi')?.addEventListener('click', () => {
    const judul = document.getElementById('edukasiJudul').value.trim();
    const kategori = document.getElementById('edukasiKategori').value;
    const ringkasan = document.getElementById('edukasiRingkasan').value.trim();
    const icon = document.getElementById('edukasiIcon').value;

    if (!judul || !kategori || !ringkasan) {
      alert('Lengkapi semua data yang wajib diisi');
      return;
    }

    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    if (editId.edukasi) {
      const index = dataEdukasi.findIndex(e => e.id === editId.edukasi);
      if (index !== -1) {
        dataEdukasi[index] = { ...dataEdukasi[index], judul, kategori, ringkasan, icon };
      }
    } else {
      const newId = dataEdukasi.length > 0 ? Math.max(...dataEdukasi.map(e => e.id)) + 1 : 1;
      dataEdukasi.push({ id: newId, judul, kategori, ringkasan, icon, tanggal: today });
    }

    saveAll();
    closeModal('modalEdukasi');
    renderEdukasi();
  });

  // ========== MODAL HAPUS ==========
  const modalHapus = document.getElementById('modalHapus');

  function bukaModalHapus(tipe, id) {
    let nama = '-';
    if (tipe === 'katalog') {
      const item = dataKatalog.find(k => k.id === id);
      if (item) nama = item.nama;
    } else if (tipe === 'berita') {
      const item = dataBerita.find(b => b.id === id);
      if (item) nama = item.judul;
    } else if (tipe === 'edukasi') {
      const item = dataEdukasi.find(e => e.id === id);
      if (item) nama = item.judul;
    }

    hapusData = { tipe, id };
    document.getElementById('namaHapus').textContent = nama;
    modalHapus.classList.add('active');
  }

  document.getElementById('modalCloseHapus')?.addEventListener('click', () => modalHapus.classList.remove('active'));
  document.getElementById('btnBatalHapus')?.addEventListener('click', () => modalHapus.classList.remove('active'));

  document.getElementById('btnKonfirmasiHapus')?.addEventListener('click', () => {
    const { tipe, id } = hapusData;
    
    if (tipe === 'katalog') {
      dataKatalog = dataKatalog.filter(k => k.id !== id);
    } else if (tipe === 'berita') {
      dataBerita = dataBerita.filter(b => b.id !== id);
    } else if (tipe === 'edukasi') {
      dataEdukasi = dataEdukasi.filter(e => e.id !== id);
    }

    saveAll();
    modalHapus.classList.remove('active');
    
    renderKatalog();
    renderBerita();
    renderEdukasi();
  });

  // ========== SEARCH ==========
  document.getElementById('searchKatalog')?.addEventListener('input', (e) => renderKatalog(e.target.value.trim()));
  document.getElementById('searchBerita')?.addEventListener('input', (e) => renderBerita(e.target.value.trim()));
  document.getElementById('searchEdukasi')?.addEventListener('input', (e) => renderEdukasi(e.target.value.trim()));

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
  loadAll();
  renderKatalog();
  renderBerita();
  renderEdukasi();

});

function logoutUser() {
  if (confirm('Yakin ingin keluar?')) {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  }
}