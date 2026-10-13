/* ============================================
   BERITA JS - Dengan Integrasi Admin
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== DEFAULT DATA ==========
  const beritaDefault = [
    { id: 1, judul: 'Pemko Medan Resmikan 10 Bank Sampah Baru', ringkasan: 'Pemerintah Kota Medan meresmikan 10 bank sampah baru di berbagai kecamatan untuk mendukung pengelolaan sampah yang lebih baik.', kategori: 'Pemerintahan', icon: 'fa-city', tanggal: '10 Maret 2026' },
    { id: 2, judul: 'Harga Sampah Plastik Naik 15% di Maret 2026', ringkasan: 'Bank Sampah Medan menaikkan harga beli sampah plastik jenis PET hingga 15% seiring meningkatnya permintaan industri daur ulang.', kategori: 'Ekonomi', icon: 'fa-chart-line', tanggal: '5 Maret 2026' },
    { id: 3, judul: 'Waste2Worth Raih Penghargaan Inovasi Digital', ringkasan: 'Platform bank sampah digital Waste2Worth mendapatkan penghargaan inovasi terbaik kategori lingkungan dari Pemko Medan.', kategori: 'Prestasi', icon: 'fa-trophy', tanggal: '28 Februari 2026' },
    { id: 4, judul: 'Program Bank Sampah Sekolah Dimulai', ringkasan: 'Dinas Lingkungan Hidup Medan meluncurkan program bank sampah di 50 sekolah dasar untuk edukasi sejak dini.', kategori: 'Edukasi', icon: 'fa-school', tanggal: '20 Februari 2026' },
    { id: 5, judul: 'Medan Targetkan 30% Pengurangan Sampah Plastik', ringkasan: 'Pemko Medan menargetkan pengurangan sampah plastik sebesar 30% pada tahun 2027 melalui berbagai program.', kategori: 'Lingkungan', icon: 'fa-leaf', tanggal: '15 Februari 2026' },
    { id: 6, judul: 'Kerja Sama Waste2Worth dengan 20 UMKM Daur Ulang', ringkasan: 'Waste2Worth menjalin kerja sama dengan 20 UMKM daur ulang untuk memperluas pemasaran produk kreatif dari sampah.', kategori: 'Bisnis', icon: 'fa-handshake', tanggal: '10 Februari 2026' }
  ];

  // ========== LOAD DARI ADMIN ==========
  const beritaAdmin = JSON.parse(localStorage.getItem('beritaList') || 'null');
  const daftarBerita = beritaAdmin && beritaAdmin.length > 0 ? beritaAdmin : beritaDefault;

  // ========== RENDER ==========
  const grid = document.getElementById('beritaGrid');
  if (!grid) return;

  // Sort: terbaru dulu (kalau ada data tanggal)
  const sorted = [...daftarBerita].sort((a, b) => {
    if (a.id && b.id) return b.id - a.id;
    return 0;
  });

  sorted.forEach(berita => {
    const card = document.createElement('div');
    card.className = 'berita-card';
    card.innerHTML = 
      '<div class="berita-image">' +
        '<i class="fas ' + (berita.icon || 'fa-newspaper') + '"></i>' +
        '<span class="berita-kategori">' + (berita.kategori || 'Umum') + '</span>' +
      '</div>' +
      '<div class="berita-content">' +
        '<div class="berita-meta">' +
          '<span><i class="fas fa-calendar"></i> ' + (berita.tanggal || '-') + '</span>' +
        '</div>' +
        '<h3>' + berita.judul + '</h3>' +
        '<p>' + berita.ringkasan + '</p>' +
        '<span class="berita-link">Baca Selengkapnya <i class="fas fa-arrow-right"></i></span>' +
      '</div>';

    card.addEventListener('click', () => {
      alert('Detail berita "' + berita.judul + '" akan segera hadir!');
    });

    grid.appendChild(card);
  });

});