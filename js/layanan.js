/* ============================================
   LAYANAN JS - Peta + Katalog + Tab
   Dengan Integrasi Data dari Admin
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== LOAD DATA MITRA DARI ADMIN ==========
  function loadMitraDariAdmin() {
    const mitraAdmin = JSON.parse(localStorage.getItem('mitraBankSampah') || '[]');
    
    if (mitraAdmin.length > 0) {
      // Generate koordinat sekitar Medan biar tidak tumpuk
      return mitraAdmin.map((m, i) => {
        // Base koordinat Medan: 3.5952, 98.6722
        // Sebar di sekitar Medan dengan offset kecil
        const angle = (i / mitraAdmin.length) * Math.PI * 2;
        const radius = 0.03 + (i * 0.005);
        
        return {
          id: m.id,
          nama: m.nama,
          alamat: m.alamat,
          kecamatan: m.kecamatan,
          kontak: m.kontak,
          jamLayanan: m.jamLayanan,
          lat: 3.5952 + (Math.sin(angle) * radius),
          lng: 98.6722 + (Math.cos(angle) * radius)
        };
      });
    }
    
    return null;
  }

  // ========== DATA MITRA DEFAULT (FALLBACK) ==========
  const mitraDefault = [
    { id: 1, nama: 'Bank Sampah Medan Barat', alamat: 'Jl. Gatot Subroto No. 123, Medan Barat', kecamatan: 'medan-barat', kontak: '0812-3456-7890', jamLayanan: 'Senin-Sabtu, 08.00-17.00' },
    { id: 2, nama: 'Bank Sampah Medan Timur', alamat: 'Jl. Williem Iskandar No. 45, Medan Timur', kecamatan: 'medan-timur', kontak: '0813-4567-8901', jamLayanan: 'Senin-Jumat, 09.00-16.00' },
    { id: 3, nama: 'Bank Sampah Medan Sunggal', alamat: 'Jl. Sunggal No. 88, Medan Sunggal', kecamatan: 'medan-sunggal', kontak: '0814-5678-9012', jamLayanan: 'Senin-Sabtu, 08.00-16.00' },
    { id: 4, nama: 'Bank Sampah Medan Petisah', alamat: 'Jl. Petisah Tengah No. 21, Medan Petisah', kecamatan: 'medan-petisah', kontak: '0815-6789-0123', jamLayanan: 'Senin-Sabtu, 08.30-17.30' },
    { id: 5, nama: 'Bank Sampah Medan Kota', alamat: 'Jl. Mesjid No. 56, Medan Kota', kecamatan: 'medan-kota', kontak: '0816-7890-1234', jamLayanan: 'Senin-Jumat, 08.00-16.00' },
    { id: 6, nama: 'Bank Sampah Medan Denai', alamat: 'Jl. Denai No. 100, Medan Denai', kecamatan: 'medan-denai', kontak: '0817-8901-2345', jamLayanan: 'Senin-Sabtu, 08.00-17.00' }
  ];

  // Pakai data admin kalau ada, kalau tidak pakai default
  const mitraBankSampah = loadMitraDariAdmin() || mitraDefault;

  // ========== LOAD DATA KATALOG DARI ADMIN ==========
  function loadKatalogDariAdmin() {
    const katalogAdmin = JSON.parse(localStorage.getItem('katalogProduk') || '[]');
    
    if (katalogAdmin.length > 0) {
      return katalogAdmin.map(k => ({
        id: k.id,
        nama: k.nama,
        deskripsi: k.deskripsi,
        harga: k.harga,
        toko: k.toko,
        icon: k.icon || 'fa-shopping-bag',
        badge: k.badge || ''
      }));
    }
    
    return null;
  }

  // ========== DATA KATALOG DEFAULT (FALLBACK) ==========
  const katalogDefault = [
    { id: 1, nama: 'Tas dari Kain Perca', deskripsi: 'Tas cantik dari kain perca daur ulang', harga: 45000, toko: 'UMKM Medan Kreatif', icon: 'fa-shopping-bag', badge: 'Best Seller' },
    { id: 2, nama: 'Vas Bunga dari Botol Plastik', deskripsi: 'Vas unik dari botol plastik bekas', harga: 35000, toko: 'Bank Sampah Medan Barat', icon: 'fa-wine-bottle', badge: '' },
    { id: 3, nama: 'Dompet dari Kardus', deskripsi: 'Dompet ramah lingkungan dari kardus', harga: 25000, toko: 'UMKM Denai', icon: 'fa-wallet', badge: 'Baru' },
    { id: 4, nama: 'Lampu Hias dari Kaleng', deskripsi: 'Lampu hias cantik dari kaleng bekas', harga: 75000, toko: 'Medan Craft', icon: 'fa-lightbulb', badge: '' },
    { id: 5, nama: 'Pot Tanaman dari Plastik', deskripsi: 'Pot tanaman dari plastik daur ulang', harga: 20000, toko: 'Bank Sampah Medan Timur', icon: 'fa-seedling', badge: 'Best Seller' },
    { id: 6, nama: 'Buku Catatan dari Kertas Bekas', deskripsi: 'Buku catatan dari kertas daur ulang', harga: 30000, toko: 'UMKM Medan Pintar', icon: 'fa-book', badge: '' }
  ];

  const katalogProduk = loadKatalogDariAdmin() || katalogDefault;

  // ========== TAB SWITCHER ==========
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById('tab-' + targetTab)?.classList.add('active');
    });
  });

  // ========== RENDER LIST ==========
  function renderPetaList(data) {
    const list = document.getElementById('petaList');
    if (!list) return;

    const dataToRender = data || mitraBankSampah;
    list.innerHTML = '';

    if (dataToRender.length === 0) {
      list.innerHTML = 
        '<div style="text-align:center;padding:40px 20px;color:#9e9e9e;">' +
          '<i class="fas fa-search" style="font-size:36px;margin-bottom:12px;"></i>' +
          '<p>Lokasi tidak ditemukan</p>' +
        '</div>';
      return;
    }

    dataToRender.forEach(mitra => {
      const item = document.createElement('div');
      item.className = 'peta-item';
      item.dataset.id = mitra.id;
      item.innerHTML = 
        '<h3><i class="fas fa-recycle"></i> ' + mitra.nama + '</h3>' +
        '<p><i class="fas fa-map-marker-alt"></i> ' + mitra.alamat + '</p>' +
        '<p><i class="fas fa-phone"></i> ' + mitra.kontak + '</p>' +
        '<p><i class="fas fa-clock"></i> ' + mitra.jamLayanan + '</p>';

      item.addEventListener('click', () => {
        document.querySelectorAll('.peta-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });

      list.appendChild(item);
    });
  }

  // ========== SEARCH ==========
  const searchInput = document.getElementById('searchLokasi');
  searchInput?.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase().trim();

    if (!keyword) {
      renderPetaList(mitraBankSampah);
      return;
    }

    const hasil = mitraBankSampah.filter(m =>
      m.nama.toLowerCase().includes(keyword) ||
      m.alamat.toLowerCase().includes(keyword) ||
      m.kecamatan.toLowerCase().includes(keyword)
    );

    renderPetaList(hasil);
  });

  // ========== RENDER KATALOG ==========
  function renderKatalog() {
    const grid = document.getElementById('katalogGrid');
    if (!grid) return;

    grid.innerHTML = '';

    katalogProduk.forEach(produk => {
      const card = document.createElement('div');
      card.className = 'produk-card';
      card.innerHTML = 
        '<div class="produk-image">' +
          '<i class="fas ' + produk.icon + '"></i>' +
          (produk.badge ? '<span class="produk-badge">' + produk.badge + '</span>' : '') +
        '</div>' +
        '<div class="produk-content">' +
          '<h3>' + produk.nama + '</h3>' +
          '<p class="produk-desc">' + produk.deskripsi + '</p>' +
          '<div class="produk-footer">' +
            '<div>' +
              '<div class="produk-harga">Rp ' + produk.harga.toLocaleString('id-ID') + '</div>' +
              '<div class="produk-toko">' + produk.toko + '</div>' +
            '</div>' +
            '<button class="btn btn-primary btn-sm" onclick="alert(\'Fitur pembelian akan segera hadir!\')">' +
              '<i class="fas fa-shopping-cart"></i>' +
            '</button>' +
          '</div>' +
        '</div>';
      grid.appendChild(card);
    });
  }

  // ========== INIT ==========
  renderPetaList();
  renderKatalog();

});