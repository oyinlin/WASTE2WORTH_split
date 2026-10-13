/* ============================================
   KATALOG JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const katalogProduk = [
    { id: 1, nama: 'Tas dari Kain Perca', deskripsi: 'Tas cantik dari kain perca daur ulang', harga: 45000, toko: 'UMKM Medan Kreatif', kategori: 'Tas', icon: 'fa-shopping-bag', badge: 'Best Seller' },
    { id: 2, nama: 'Vas Bunga dari Botol Plastik', deskripsi: 'Vas unik dari botol plastik bekas', harga: 35000, toko: 'Bank Sampah Medan Barat', kategori: 'Dekorasi', icon: 'fa-wine-bottle', badge: '' },
    { id: 3, nama: 'Dompet dari Kardus', deskripsi: 'Dompet ramah lingkungan dari kardus', harga: 25000, toko: 'UMKM Denai', kategori: 'Aksesoris', icon: 'fa-wallet', badge: 'Baru' },
    { id: 4, nama: 'Lampu Hias dari Kaleng', deskripsi: 'Lampu hias cantik dari kaleng bekas', harga: 75000, toko: 'Medan Craft', kategori: 'Dekorasi', icon: 'fa-lightbulb', badge: '' },
    { id: 5, nama: 'Pot Tanaman dari Plastik', deskripsi: 'Pot tanaman dari plastik daur ulang', harga: 20000, toko: 'Bank Sampah Medan Timur', kategori: 'Tanaman', icon: 'fa-seedling', badge: 'Best Seller' },
    { id: 6, nama: 'Buku Catatan dari Kertas Bekas', deskripsi: 'Buku catatan dari kertas daur ulang', harga: 30000, toko: 'UMKM Medan Pintar', kategori: 'Alat Tulis', icon: 'fa-book', badge: '' },
    { id: 7, nama: 'Gantungan Kunci dari Plastik', deskripsi: 'Gantungan kunci unik dari plastik daur ulang', harga: 15000, toko: 'Bank Sampah Medan Kota', kategori: 'Aksesoris', icon: 'fa-key', badge: '' },
    { id: 8, nama: 'Toples dari Kaca Bekas', deskripsi: 'Toples cantik dari kaca bekas', harga: 40000, toko: 'UMKM Medan Kreatif', kategori: 'Dekorasi', icon: 'fa-jar', badge: '' }
  ];

  let filterKategori = 'all';

  function renderKatalog() {
    const grid = document.getElementById('katalogGrid');
    const empty = document.getElementById('emptyKatalog');
    if (!grid) return;

    let filtered = katalogProduk;
    if (filterKategori !== 'all') {
      filtered = katalogProduk.filter(p => p.kategori === filterKategori);
    }

    if (filtered.length === 0) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    empty.style.display = 'none';
    grid.innerHTML = '';

    filtered.forEach(produk => {
      const card = document.createElement('div');
      card.className = 'produk-card';
      card.innerHTML = 
        '<div class="produk-image">' +
          '<i class="fas ' + produk.icon + '"></i>' +
          (produk.badge ? '<span class="produk-badge">' + produk.badge + '</span>' : '') +
        '</div>' +
        '<div class="produk-content">' +
          '<span class="produk-kategori">' + produk.kategori + '</span>' +
          '<h3>' + produk.nama + '</h3>' +
          '<p class="produk-desc">' + produk.deskripsi + '</p>' +
          '<div class="produk-footer">' +
            '<div>' +
              '<div class="produk-harga">Rp ' + produk.harga.toLocaleString('id-ID') + '</div>' +
              '<div class="produk-toko">' + produk.toko + '</div>' +
            '</div>' +
            '<button class="btn-beli" title="Beli">' +
              '<i class="fas fa-shopping-cart"></i>' +
            '</button>' +
          '</div>' +
        '</div>';

      card.querySelector('.btn-beli').addEventListener('click', (e) => {
        e.stopPropagation();
        alert('Fitur pembelian "' + produk.nama + '" akan segera hadir!');
      });

      card.addEventListener('click', () => {
        alert('Detail produk "' + produk.nama + '" akan segera hadir!');
      });

      grid.appendChild(card);
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterKategori = btn.dataset.kategori;
      renderKatalog();
    });
  });

  renderKatalog();
});