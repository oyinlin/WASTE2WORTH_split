/* ============================================
   BERITA JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  const daftarBerita = [
    {
      id: 1,
      judul: 'Pemko Medan Resmikan 10 Bank Sampah Baru',
      ringkasan: 'Pemerintah Kota Medan meresmikan 10 bank sampah baru di berbagai kecamatan untuk mendukung pengelolaan sampah yang lebih baik.',
      kategori: 'Pemerintahan',
      tanggal: '10 Maret 2026',
      icon: 'fa-city'
    },
    {
      id: 2,
      judul: 'Harga Sampah Plastik Naik 15% di Maret 2026',
      ringkasan: 'Bank Sampah Medan menaikkan harga beli sampah plastik jenis PET hingga 15% seiring meningkatnya permintaan industri daur ulang.',
      kategori: 'Ekonomi',
      tanggal: '5 Maret 2026',
      icon: 'fa-chart-line'
    },
    {
      id: 3,
      judul: 'Waste2Worth Raih Penghargaan Inovasi Digital',
      ringkasan: 'Platform bank sampah digital Waste2Worth mendapatkan penghargaan inovasi terbaik kategori lingkungan dari Pemko Medan.',
      kategori: 'Prestasi',
      tanggal: '28 Februari 2026',
      icon: 'fa-trophy'
    },
    {
      id: 4,
      judul: 'Program Bank Sampah Sekolah Dimulai',
      ringkasan: 'Dinas Lingkungan Hidup Medan meluncurkan program bank sampah di 50 sekolah dasar untuk edukasi sejak dini.',
      kategori: 'Edukasi',
      tanggal: '20 Februari 2026',
      icon: 'fa-school'
    },
    {
      id: 5,
      judul: 'Medan Targetkan 30% Pengurangan Sampah Plastik',
      ringkasan: 'Pemko Medan menargetkan pengurangan sampah plastik sebesar 30% pada tahun 2027 melalui berbagai program.',
      kategori: 'Lingkungan',
      tanggal: '15 Februari 2026',
      icon: 'fa-leaf'
    },
    {
      id: 6,
      judul: 'Kerja Sama Waste2Worth dengan 20 UMKM Daur Ulang',
      ringkasan: 'Waste2Worth menjalin kerja sama dengan 20 UMKM daur ulang untuk memperluas pemasaran produk kreatif dari sampah.',
      kategori: 'Bisnis',
      tanggal: '10 Februari 2026',
      icon: 'fa-handshake'
    }
  ];

  const grid = document.getElementById('beritaGrid');
  if (!grid) return;

  daftarBerita.forEach(berita => {
    const card = document.createElement('div');
    card.className = 'berita-card';
    card.innerHTML = 
      '<div class="berita-image">' +
        '<i class="fas ' + berita.icon + '"></i>' +
        '<span class="berita-kategori">' + berita.kategori + '</span>' +
      '</div>' +
      '<div class="berita-content">' +
        '<div class="berita-meta">' +
          '<span><i class="fas fa-calendar"></i> ' + berita.tanggal + '</span>' +
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