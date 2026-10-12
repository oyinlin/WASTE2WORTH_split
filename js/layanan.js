/* ============================================
   LAYANAN JS - Peta + Katalog + Tab
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== DATA MITRA BANK SAMPAH ==========
  const mitraBankSampah = [
    {
      id: 1,
      nama: 'Bank Sampah Medan Barat',
      alamat: 'Jl. Gatot Subroto No. 123, Medan Barat',
      kecamatan: 'medan-barat',
      kontak: '0812-3456-7890',
      jamLayanan: 'Senin-Sabtu, 08.00-17.00',
      lat: 3.5952,
      lng: 98.6722,
      icon: 'fa-recycle'
    },
    {
      id: 2,
      nama: 'Bank Sampah Medan Timur',
      alamat: 'Jl. Williem Iskandar No. 45, Medan Timur',
      kecamatan: 'medan-timur',
      kontak: '0813-4567-8901',
      jamLayanan: 'Senin-Jumat, 09.00-16.00',
      lat: 3.6105,
      lng: 98.6903,
      icon: 'fa-recycle'
    },
    {
      id: 3,
      nama: 'Bank Sampah Medan Sunggal',
      alamat: 'Jl. Sunggal No. 88, Medan Sunggal',
      kecamatan: 'medan-sunggal',
      kontak: '0814-5678-9012',
      jamLayanan: 'Senin-Sabtu, 08.00-16.00',
      lat: 3.5822,
      lng: 98.6421,
      icon: 'fa-recycle'
    },
    {
      id: 4,
      nama: 'Bank Sampah Medan Petisah',
      alamat: 'Jl. Petisah Tengah No. 21, Medan Petisah',
      kecamatan: 'medan-petisah',
      kontak: '0815-6789-0123',
      jamLayanan: 'Senin-Sabtu, 08.30-17.30',
      lat: 3.5915,
      lng: 98.6614,
      icon: 'fa-recycle'
    },
    {
      id: 5,
      nama: 'Bank Sampah Medan Kota',
      alamat: 'Jl. Mesjid No. 56, Medan Kota',
      kecamatan: 'medan-kota',
      kontak: '0816-7890-1234',
      jamLayanan: 'Senin-Jumat, 08.00-16.00',
      lat: 3.5855,
      lng: 98.6789,
      icon: 'fa-recycle'
    },
    {
      id: 6,
      nama: 'Bank Sampah Medan Denai',
      alamat: 'Jl. Denai No. 100, Medan Denai',
      kecamatan: 'medan-denai',
      kontak: '0817-8901-2345',
      jamLayanan: 'Senin-Sabtu, 08.00-17.00',
      lat: 3.5789,
      lng: 98.7012,
      icon: 'fa-recycle'
    }
  ];

  // ========== DATA KATALOG PRODUK ==========
  const katalogProduk = [
    {
      id: 1,
      nama: 'Tas dari Kain Perca',
      deskripsi: 'Tas cantik dari kain perca daur ulang',
      harga: 45000,
      toko: 'UMKM Medan Kreatif',
      kategori: 'Tas',
      icon: 'fa-shopping-bag',
      badge: 'Best Seller'
    },
    {
      id: 2,
      nama: 'Vas Bunga dari Botol Plastik',
      deskripsi: 'Vas unik dari botol plastik bekas',
      harga: 35000,
      toko: 'Bank Sampah Medan Barat',
      kategori: 'Dekorasi',
      icon: 'fa-wine-bottle',
      badge: ''
    },
    {
      id: 3,
      nama: 'Dompet dari Kardus',
      deskripsi: 'Dompet ramah lingkungan dari kardus',
      harga: 25000,
      toko: 'UMKM Denai',
      kategori: 'Aksesoris',
      icon: 'fa-wallet',
      badge: 'Baru'
    },
    {
      id: 4,
      nama: 'Lampu Hias dari Kaleng',
      deskripsi: 'Lampu hias cantik dari kaleng bekas',
      harga: 75000,
      toko: 'Medan Craft',
      kategori: 'Dekorasi',
      icon: 'fa-lightbulb',
      badge: ''
    },
    {
      id: 5,
      nama: 'Pot Tanaman dari Plastik',
      deskripsi: 'Pot tanaman dari plastik daur ulang',
      harga: 20000,
      toko: 'Bank Sampah Medan Timur',
      kategori: 'Tanaman',
      icon: 'fa-seedling',
      badge: 'Best Seller'
    },
    {
      id: 6,
      nama: 'Buku Catatan dari Kertas Bekas',
      deskripsi: 'Buku catatan dari kertas daur ulang',
      harga: 30000,
      toko: 'UMKM Medan Pintar',
      kategori: 'Alat Tulis',
      icon: 'fa-book',
      badge: ''
    }
  ];

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

      // Kalau peta, refresh ukuran leaflet
      if (targetTab === 'peta' && window.map) {
        setTimeout(() => window.map.invalidateSize(), 100);
      }
    });
  });

  // ========== PETA - LEAFLET ==========
  let map = null;
  let markers = [];

  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || typeof L === 'undefined') return;

    // Pusat peta di Medan
    map = L.map('map').setView([3.5952, 98.6722], 12);
    window.map = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Tambahkan marker untuk setiap mitra
    mitraBankSampah.forEach(mitra => {
      const marker = L.marker([mitra.lat, mitra.lng]).addTo(map);
      
      const popupContent = `
        <div class="popup-title">${mitra.nama}</div>
        <div class="popup-row">
          <i class="fas fa-map-marker-alt"></i>
          <span>${mitra.alamat}</span>
        </div>
        <div class="popup-row">
          <i class="fas fa-phone"></i>
          <span>${mitra.kontak}</span>
        </div>
        <div class="popup-row">
          <i class="fas fa-clock"></i>
          <span>${mitra.jamLayanan}</span>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.mitraId = mitra.id;
      markers.push(marker);
    });
  }

  // ========== RENDER DAFTAR PETA ==========
  function renderPetaList(data = mitraBankSampah) {
    const list = document.getElementById('petaList');
    if (!list) return;

    list.innerHTML = '';

    if (data.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:40px 20px;color:#9e9e9e;">
          <i class="fas fa-search" style="font-size:36px;margin-bottom:12px;"></i>
          <p>Lokasi tidak ditemukan</p>
        </div>
      `;
      return;
    }

    data.forEach(mitra => {
      const item = document.createElement('div');
      item.className = 'peta-item';
      item.dataset.id = mitra.id;
      item.innerHTML = `
        <h3><i class="fas fa-recycle"></i> ${mitra.nama}</h3>
        <p><i class="fas fa-map-marker-alt"></i> ${mitra.alamat}</p>
        <p><i class="fas fa-phone"></i> ${mitra.kontak}</p>
        <p><i class="fas fa-clock"></i> ${mitra.jamLayanan}</p>
      `;

      item.addEventListener('click', () => {
        // Highlight item
        document.querySelectorAll('.peta-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Zoom ke marker
        if (map) {
          map.setView([mitra.lat, mitra.lng], 15);
          const marker = markers.find(m => m.mitraId === mitra.id);
          if (marker) marker.openPopup();
        }
      });

      list.appendChild(item);
    });
  }

  // ========== SEARCH PETA ==========
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
      card.innerHTML = `
        <div class="produk-image">
          <i class="fas ${produk.icon}"></i>
          ${produk.badge ? '<span class="produk-badge">' + produk.badge + '</span>' : ''}
        </div>
        <div class="produk-content">
          <h3>${produk.nama}</h3>
          <p class="produk-desc">${produk.deskripsi}</p>
          <div class="produk-footer">
            <div>
              <div class="produk-harga">Rp ${produk.harga.toLocaleString('id-ID')}</div>
              <div class="produk-toko">${produk.toko}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="alert('Fitur pembelian akan segera hadir!')">
              <i class="fas fa-shopping-cart"></i>
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ========== INIT ==========
  initMap();
  renderPetaList();
  renderKatalog();

});