/* ============================================
   EDUKASI JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== DATA ARTIKEL ==========
  const daftarArtikel = [
    {
      id: 1,
      judul: 'Mengapa Daur Ulang Penting untuk Bumi?',
      ringkasan: 'Daur ulang membantu mengurangi sampah di TPA dan menghemat sumber daya alam. Yuk pelajari manfaatnya!',
      kategori: 'Lingkungan',
      icon: 'fa-globe',
      tanggal: '10 Maret 2026',
      penulis: 'Admin Waste2Worth'
    },
    {
      id: 2,
      judul: 'Jenis Plastik yang Bisa Didaur Ulang',
      ringkasan: 'Tidak semua plastik bisa didaur ulang. Kenali jenis-jenisnya agar kamu tidak salah pilih.',
      kategori: 'Tips',
      icon: 'fa-recycle',
      tanggal: '8 Maret 2026',
      penulis: 'Admin Waste2Worth'
    },
    {
      id: 3,
      judul: '5 Cara Mudah Memilah Sampah di Rumah',
      ringkasan: 'Panduan praktis memilah sampah organik, anorganik, dan B3 dari rumahmu.',
      kategori: 'Panduan',
      icon: 'fa-home',
      tanggal: '5 Maret 2026',
      penulis: 'Admin Waste2Worth'
    },
    {
      id: 4,
      judul: 'Kisah Sukses: Dari Sampah Jadi Usaha',
      ringkasan: 'Inspirasi dari pelaku UMKM yang sukses mengubah sampah menjadi produk bernilai jual.',
      kategori: 'Inspirasi',
      icon: 'fa-lightbulb',
      tanggal: '2 Maret 2026',
      penulis: 'Admin Waste2Worth'
    },
    {
      id: 5,
      judul: 'Bahaya Sampah Plastik bagi Lautan',
      ringkasan: 'Setiap tahun, jutaan ton plastik berakhir di laut. Ini dampaknya bagi ekosistem.',
      kategori: 'Lingkungan',
      icon: 'fa-water',
      tanggal: '28 Februari 2026',
      penulis: 'Admin Waste2Worth'
    },
    {
      id: 6,
      judul: 'Cara Membuat Kompos dari Sampah Organik',
      ringkasan: 'Tutorial lengkap mengubah sampah dapur menjadi kompos yang bermanfaat untuk tanaman.',
      kategori: 'Tutorial',
      icon: 'fa-seedling',
      tanggal: '25 Februari 2026',
      penulis: 'Admin Waste2Worth'
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
    });
  });

  // ========== RENDER ARTIKEL ==========
  function renderArtikel() {
    const grid = document.getElementById('artikelGrid');
    if (!grid) return;

    grid.innerHTML = '';

    daftarArtikel.forEach(artikel => {
      const card = document.createElement('div');
      card.className = 'artikel-card';
      card.innerHTML = 
        '<div class="artikel-image">' +
          '<i class="fas ' + artikel.icon + '"></i>' +
          '<span class="artikel-kategori">' + artikel.kategori + '</span>' +
        '</div>' +
        '<div class="artikel-content">' +
          '<h3>' + artikel.judul + '</h3>' +
          '<p>' + artikel.ringkasan + '</p>' +
          '<div class="artikel-meta">' +
            '<span><i class="fas fa-calendar"></i> ' + artikel.tanggal + '</span>' +
            '<span class="artikel-link">Baca <i class="fas fa-arrow-right"></i></span>' +
          '</div>' +
        '</div>';

      card.addEventListener('click', () => {
        alert('Detail artikel "' + artikel.judul + '" akan segera hadir!');
      });

      grid.appendChild(card);
    });
  }

  renderArtikel();

});