/* ============================================================
   WASTE2WORTH - JS HALAMAN LAYANAN (layanan.html)
   Isi: kalkulator nilai sampah, form penjemputan, FAQ accordion.
   Butuh common.js (showNotification).
   ============================================================ */

/* ============================================================
   1. INISIALISASI DATA
   Baca data pesanan dari localStorage browser
   Jika belum ada (pertama kali buka), buat array kosong
   Format penyimpanan: JSON string di key 'waste2worth_pickups'
   ============================================================ */
let pickupData = JSON.parse(localStorage.getItem('waste2worth_pickups')) || [];


/* ============================================================
   8. KALKULATOR NILAI SAMPAH (layanan.html)
   
   Data harga (Rp/kg) per kecamatan × jenis sampah
   Key kecamatan: nilai dari select#locationSelect
   Key jenis: nilai dari select#wasteType
   ============================================================ */
const priceData = {
    'medan-barat':      { plastik: 5000,  kardus: 3000,  aluminium: 12000, kaca: 1500,  besi: 3500,  elektronik: 8000  },
    'medan-timur':      { plastik: 4800,  kardus: 2800,  aluminium: 11500, kaca: 1400,  besi: 3300,  elektronik: 7500  },
    'medan-sunggal':    { plastik: 5200,  kardus: 3200,  aluminium: 12500, kaca: 1600,  besi: 3700,  elektronik: 8500  },
    'medan-helvetia':   { plastik: 4900,  kardus: 2900,  aluminium: 11800, kaca: 1450,  besi: 3400,  elektronik: 7800  },
    'medan-tembung':    { plastik: 4700,  kardus: 2700,  aluminium: 11000, kaca: 1350,  besi: 3200,  elektronik: 7200  },
    'medan-perjuangan': { plastik: 5100,  kardus: 3100,  aluminium: 12200, kaca: 1550,  besi: 3600,  elektronik: 8200  },
    'medan-area':       { plastik: 4850,  kardus: 2850,  aluminium: 11600, kaca: 1420,  besi: 3350,  elektronik: 7600  },
    'medan-kota':       { plastik: 5050,  kardus: 3050,  aluminium: 12100, kaca: 1520,  besi: 3550,  elektronik: 8100  },
    'medan-marelan':    { plastik: 4600,  kardus: 2600,  aluminium: 10800, kaca: 1300,  besi: 3100,  elektronik: 7000  },
    'medan-labuhan':    { plastik: 4550,  kardus: 2550,  aluminium: 10500, kaca: 1250,  besi: 3000,  elektronik: 6800  }
};

/** Rekomendasi bank sampah berdasarkan lokasi */
const bankNames = {
    'medan-barat':      '🏦 Bank Sampah Medan Barat - Jl. Gajah Mada No.123 (500m dari Anda)',
    'medan-timur':      '🏦 Bank Sampah Medan Timur - Jl. Krakatau No.45 (700m dari Anda)',
    'medan-sunggal':    '🏦 Bank Sampah Medan Sunggal - Jl. Kapten Muslim No.78 (300m dari Anda)',
    'medan-helvetia':   '🏦 Bank Sampah Medan Helvetia - Jl. Cemara No.90 (1km dari Anda)',
    'medan-tembung':    '🏦 Bank Sampah Medan Tembung - Jl. Pancing No.12 (800m dari Anda)',
    'medan-perjuangan': '🏦 Bank Sampah Medan Perjuangan - Jl. Bunga Raya No.34 (600m dari Anda)'
};

/**
 * hitungNilai(): Dipanggil saat tombol "HITUNG NILAI" diklik
 * Rumus: total = priceData[lokasi][jenis] × berat
 * Hasil ditampilkan di div#calcResult
 */
function hitungNilai() {
    const location  = document.getElementById('locationSelect')?.value;
    const wasteType = document.getElementById('wasteType')?.value;
    const weight    = parseFloat(document.getElementById('weight')?.value);

    if (!location || !wasteType) return;

    if (!weight || weight <= 0) {
        alert('⚠️ Masukkan berat sampah terlebih dahulu!');
        return;
    }

    const price = priceData[location]?.[wasteType];
    if (!price) return;

    const total = price * weight;

    // Tampilkan hasil ke DOM
    const resultDiv   = document.getElementById('calcResult');
    const resultValue = document.getElementById('resultValue');
    const pricePerKg    = document.getElementById('pricePerKg');
    const weightDisplay = document.getElementById('weightDisplay');
    const bankSpan      = document.getElementById('bankName');

    if (resultValue)   resultValue.textContent   = total.toLocaleString('id-ID');
    if (pricePerKg)    pricePerKg.textContent    = price.toLocaleString();
    if (weightDisplay) weightDisplay.textContent = weight;
    if (bankSpan && bankNames[location]) bankSpan.innerHTML = bankNames[location];

    // Tampilkan kotak hasil (dari display:none → display:block)
    if (resultDiv) {
        resultDiv.style.display   = 'block';
        resultDiv.style.animation = 'fadeInUp 0.5s ease';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}


/* ============================================================
   9. FORM PICKUP (layanan.html)
   Mengumpulkan data form, memvalidasi, dan menyimpan ke localStorage
   ============================================================ */

/**
 * Ambil semua pilihan yang dipilih dari select multiple
 * Return: array nilai yang dipilih (misal: ["Botol Plastik PET", "Kardus / Kertas"])
 */
function getSelectedJenisSampah() {
    const select = document.getElementById('pickupJenisSampah');
    if (!select) return [];
    return Array.from(select.options).filter(o => o.selected).map(o => o.value);
}

/**
 * Validasi data form sebelum disimpan
 * Return: true jika valid, false jika ada error
 */
function validatePickupForm(formData) {
    if (formData.nama.length < 3) {
        showNotification('Nama lengkap minimal 3 karakter!', 'error');
        return false;
    }

    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
        showNotification('Nomor HP tidak valid! (10-13 digit)', 'error');
        return false;
    }

    if (formData.alamat.length < 10) {
        showNotification('Alamat terlalu pendek! Minimal 10 karakter.', 'error');
        return false;
    }

    if (formData.berat < 5) {
        showNotification('Minimal berat sampah 5 kg untuk penjemputan gratis!', 'error');
        return false;
    }

    // Validasi tanggal: harus hari ini atau setelahnya
    const today = new Date().toISOString().split('T')[0];
    if (formData.tanggal < today) {
        showNotification('Tanggal penjemputan tidak boleh kurang dari hari ini!', 'error');
        return false;
    }

    return true;
}

/**
 * Simpan data pesanan baru ke localStorage
 * Menambahkan: id (timestamp), tanggalDibuat, status awal 'pending'
 */
function savePickupData(data) {
    const newData = {
        id: Date.now(),   // ID unik berdasarkan timestamp millisecond
        ...data,
        tanggalDibuat: new Date().toLocaleDateString('id-ID'),
        status: 'pending'
    };

    pickupData.push(newData);
    localStorage.setItem('waste2worth_pickups', JSON.stringify(pickupData));
    return newData;
}

/**
 * Handler submit form penjemputan
 * Dipasang sebagai event listener pada pickupForm di DOMContentLoaded
 */
function handlePickupSubmit(event) {
    event.preventDefault();

    const formData = {
        nama:        document.getElementById('pickupNama')?.value        || '',
        phone:       document.getElementById('pickupPhone')?.value       || '',
        alamat:      document.getElementById('pickupAlamat')?.value      || '',
        kecamatan:   document.getElementById('pickupKecamatan')?.value   || '',
        jenisSampah: getSelectedJenisSampah(),
        berat:       parseFloat(document.getElementById('pickupBerat')?.value)   || 0,
        tanggal:     document.getElementById('pickupTanggal')?.value     || '',
        waktu:       document.getElementById('pickupWaktu')?.value       || '',
        catatan:     document.getElementById('pickupCatatan')?.value     || ''
    };

    if (!validatePickupForm(formData)) return;

    const savedData = savePickupData(formData);
    showNotification(`✅ Pesanan berhasil dibuat! ID: ${savedData.id}`);
    event.target.reset(); // kosongkan form

    // Setelah 1.5 detik, tawarkan redirect ke riwayat
    setTimeout(() => {
        if (confirm('Lihat riwayat penjemputan Anda sekarang?')) {
            window.location.href = 'riwayat.html';
        }
    }, 1500);
}


/* ============================================================
   13. FAQ ACCORDION (layanan.html)
   Buka/tutup jawaban FAQ dengan animasi max-height
   Dipanggil via onclick="toggleFaq(this)" di HTML
   ============================================================ */
function toggleFaq(element) {
    const faqItem = element.parentElement;
    const answer  = faqItem.querySelector('.faq-answer');
    const icon    = element.querySelector('i');

    faqItem.classList.toggle('active');

    if (faqItem.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + 'px'; // buka (animasi CSS)
        if (icon) icon.style.transform = 'rotate(180deg)';
    } else {
        answer.style.maxHeight = '0'; // tutup
        if (icon) icon.style.transform = 'rotate(0deg)';
    }
}


/* ============================================================
   INISIALISASI HALAMAN: DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

    /* ---- Handler form penjemputan (hanya di layanan.html) ---- */
    document.getElementById('pickupForm')?.addEventListener('submit', handlePickupSubmit);
});


/* ============================================================
   EKSPOR FUNGSI KE GLOBAL SCOPE (dipanggil via onclick="" di HTML)
   ============================================================ */
window.hitungNilai     = hitungNilai;
window.toggleFaq       = toggleFaq;
