/* ============================================
   ADMIN MITRA JS
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
  let dataMitra = [];
  let editId = null;
  let hapusId = null;

  // ========== DEFAULT DATA ==========
  const defaultMitra = [
    { id: 1, nama: 'Bank Sampah Medan Barat', alamat: 'Jl. Gatot Subroto No. 123, Medan Barat', kecamatan: 'medan-barat', kontak: '0812-3456-7890', jamLayanan: 'Senin-Sabtu, 08.00-17.00', tanggalUpdate: new Date().toISOString() },
    { id: 2, nama: 'Bank Sampah Medan Timur', alamat: 'Jl. Williem Iskandar No. 45, Medan Timur', kecamatan: 'medan-timur', kontak: '0813-4567-8901', jamLayanan: 'Senin-Jumat, 09.00-16.00', tanggalUpdate: new Date().toISOString() },
    { id: 3, nama: 'Bank Sampah Medan Sunggal', alamat: 'Jl. Sunggal No. 88, Medan Sunggal', kecamatan: 'medan-sunggal', kontak: '0814-5678-9012', jamLayanan: 'Senin-Sabtu, 08.00-16.00', tanggalUpdate: new Date().toISOString() },
    { id: 4, nama: 'Bank Sampah Medan Petisah', alamat: 'Jl. Petisah Tengah No. 21, Medan Petisah', kecamatan: 'medan-petisah', kontak: '0815-6789-0123', jamLayanan: 'Senin-Sabtu, 08.30-17.30', tanggalUpdate: new Date().toISOString() },
    { id: 5, nama: 'Bank Sampah Medan Kota', alamat: 'Jl. Mesjid No. 56, Medan Kota', kecamatan: 'medan-kota', kontak: '0816-7890-1234', jamLayanan: 'Senin-Jumat, 08.00-16.00', tanggalUpdate: new Date().toISOString() },
    { id: 6, nama: 'Bank Sampah Medan Denai', alamat: 'Jl. Denai No. 100, Medan Denai', kecamatan: 'medan-denai', kontak: '0817-8901-2345', jamLayanan: 'Senin-Sabtu, 08.00-17.00', tanggalUpdate: new Date().toISOString() }
  ];

  // ========== LOAD/SAVE ==========
  function loadData() {
    const saved = localStorage.getItem('mitraBankSampah');
    if (saved) {
      try {
        dataMitra = JSON.parse(saved);
      } catch (e) {
        dataMitra = [...defaultMitra];
      }
    } else {
      dataMitra = [...defaultMitra];
      saveData();
    }
  }

  function saveData() {
    localStorage.setItem('mitraBankSampah', JSON.stringify(dataMitra));
  }

  // ========== HELPER ==========
  function formatKecamatan(kec) {
    if (!kec) return '-';
    return kec.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  // ========== STATISTIK ==========
  function hitungStatistik() {
    document.getElementById('statTotal').textContent = dataMitra.length;
    
    const kecamatanUnik = new Set(dataMitra.map(m => m.kecamatan));
    document.getElementById('statKecamatan').textContent = kecamatanUnik.size;
    
    document.getElementById('statAktif').textContent = dataMitra.length;
  }

  // ========== RENDER TABEL ==========
  function renderTabel(filter = '') {
    const body = document.getElementById('bodyMitra');
    const empty = document.getElementById('emptyMitra');
    const tableWrapper = document.querySelector('.table-wrapper');

    let filtered = dataMitra;
    if (filter) {
      const kw = filter.toLowerCase();
      filtered = dataMitra.filter(m => 
        m.nama.toLowerCase().includes(kw) ||
        m.alamat.toLowerCase().includes(kw) ||
        m.kecamatan.toLowerCase().includes(kw)
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
        '<td>' +
          '<strong>' + item.nama + '</strong>' +
          '<div style="font-size:12px;color:#9e9e9e;margin-top:2px;">' +
            '<i class="fas fa-map-marker-alt"></i> ' + formatKecamatan(item.kecamatan) +
          '</div>' +
        '</td>' +
        '<td style="max-width:280px;font-size:13px;color:#616161;">' + item.alamat + '</td>' +
        '<td>' +
          '<a href="https://wa.me/' + item.kontak.replace(/[^0-9]/g, '') + '" target="_blank" ' +
          'style="color:#2e7d32;font-weight:600;text-decoration:none;">' +
            '<i class="fab fa-whatsapp"></i> ' + item.kontak +
          '</a>' +
        '</td>' +
        '<td style="font-size:13px;color:#616161;">' +
          '<i class="fas fa-clock" style="color:#2e7d32;"></i> ' + item.jamLayanan +
        '</td>' +
        '<td>' +
          '<div class="action-buttons">' +
            '<button class="btn-icon edit" data-id="' + item.id + '" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn-icon delete" data-id="' + item.id + '" title="Hapus"><i class="fas fa-trash"></i></button>' +
          '</div>' +
        '</td>';

      body.appendChild(row);
    });

    document.querySelectorAll('.btn-icon.edit').forEach(btn => {
      btn.addEventListener('click', () => bukaModalEdit(parseInt(btn.dataset.id)));
    });

    document.querySelectorAll('.btn-icon.delete').forEach(btn => {
      btn.addEventListener('click', () => bukaModalHapus(parseInt(btn.dataset.id)));
    });
  }

  // ========== MODAL TAMBAH/EDIT ==========
  const modal = document.getElementById('modalMitra');
  const modalTitle = document.getElementById('modalTitle');

  function clearForm() {
    document.getElementById('inputNama').value = '';
    document.getElementById('inputKecamatan').value = '';
    document.getElementById('inputAlamat').value = '';
    document.getElementById('inputKontak').value = '';
    document.getElementById('inputJam').value = '';
    ['nama', 'kecamatan', 'alamat', 'kontak', 'jam'].forEach(f => {
      document.getElementById('error-' + f).textContent = '';
    });
  }

  function bukaModalTambah() {
    editId = null;
    modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Mitra Baru';
    clearForm();
    modal.classList.add('active');
  }

  function bukaModalEdit(id) {
    const item = dataMitra.find(m => m.id === id);
    if (!item) return;

    editId = id;
    modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Mitra';
    document.getElementById('inputNama').value = item.nama;
    document.getElementById('inputKecamatan').value = item.kecamatan;
    document.getElementById('inputAlamat').value = item.alamat;
    document.getElementById('inputKontak').value = item.kontak;
    document.getElementById('inputJam').value = item.jamLayanan;
    ['nama', 'kecamatan', 'alamat', 'kontak', 'jam'].forEach(f => {
      document.getElementById('error-' + f).textContent = '';
    });
    modal.classList.add('active');
  }

  function tutupModal() {
    modal.classList.remove('active');
    editId = null;
  }

  document.getElementById('btnTambahMitra')?.addEventListener('click', bukaModalTambah);
  document.getElementById('modalClose')?.addEventListener('click', tutupModal);
  document.getElementById('btnBatal')?.addEventListener('click', tutupModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) tutupModal();
  });

  // ========== SIMPAN ==========
  document.getElementById('btnSimpan')?.addEventListener('click', () => {
    const nama = document.getElementById('inputNama').value.trim();
    const kecamatan = document.getElementById('inputKecamatan').value;
    const alamat = document.getElementById('inputAlamat').value.trim();
    const kontak = document.getElementById('inputKontak').value.trim();
    const jam = document.getElementById('inputJam').value.trim();

    let valid = true;

    if (!nama || nama.length < 3) {
      document.getElementById('error-nama').textContent = 'Nama minimal 3 karakter';
      valid = false;
    } else {
      document.getElementById('error-nama').textContent = '';
    }

    if (!kecamatan) {
      document.getElementById('error-kecamatan').textContent = 'Kecamatan wajib dipilih';
      valid = false;
    } else {
      document.getElementById('error-kecamatan').textContent = '';
    }

    if (!alamat || alamat.length < 5) {
      document.getElementById('error-alamat').textContent = 'Alamat minimal 5 karakter';
      valid = false;
    } else {
      document.getElementById('error-alamat').textContent = '';
    }

    if (!kontak) {
      document.getElementById('error-kontak').textContent = 'Kontak wajib diisi';
      valid = false;
    } else {
      document.getElementById('error-kontak').textContent = '';
    }

    if (!jam) {
      document.getElementById('error-jam').textContent = 'Jam layanan wajib diisi';
      valid = false;
    } else {
      document.getElementById('error-jam').textContent = '';
    }

    if (!valid) return;

    if (editId) {
      const index = dataMitra.findIndex(m => m.id === editId);
      if (index !== -1) {
        dataMitra[index].nama = nama;
        dataMitra[index].kecamatan = kecamatan;
        dataMitra[index].alamat = alamat;
        dataMitra[index].kontak = kontak;
        dataMitra[index].jamLayanan = jam;
        dataMitra[index].tanggalUpdate = new Date().toISOString();
      }
    } else {
      const newId = dataMitra.length > 0 ? Math.max(...dataMitra.map(m => m.id)) + 1 : 1;
      dataMitra.push({
        id: newId,
        nama: nama,
        kecamatan: kecamatan,
        alamat: alamat,
        kontak: kontak,
        jamLayanan: jam,
        tanggalUpdate: new Date().toISOString()
      });
    }

    saveData();
    tutupModal();
    hitungStatistik();
    renderTabel(document.getElementById('searchMitra').value);
  });

  // ========== MODAL HAPUS ==========
  const modalHapus = document.getElementById('modalHapus');

  function bukaModalHapus(id) {
    const item = dataMitra.find(m => m.id === id);
    if (!item) return;

    hapusId = id;
    document.getElementById('namaHapus').textContent = item.nama;
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
    dataMitra = dataMitra.filter(m => m.id !== hapusId);
    saveData();
    tutupModalHapus();
    hitungStatistik();
    renderTabel(document.getElementById('searchMitra').value);
  });

  // ========== SEARCH ==========
  document.getElementById('searchMitra')?.addEventListener('input', (e) => {
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