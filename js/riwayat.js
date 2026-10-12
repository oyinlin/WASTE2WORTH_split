/* ============================================================
   WASTE2WORTH - JS HALAMAN RIWAYAT (riwayat.html)
   Isi: tabel riwayat, filter, CRUD edit & hapus pesanan.
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
   10. TABEL RIWAYAT (riwayat.html)
   Fungsi untuk menampilkan, memfilter, dan memperbarui data tabel
   ============================================================ */

/**
 * Ubah format tanggal dari YYYY-MM-DD ke DD/MM/YYYY
 * Contoh: "2026-03-15" → "15/03/2026"
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Buat HTML badge status berwarna
 * pending → oranye, proses → biru, selesai → hijau
 */
function getStatusBadge(status) {
    const statusMap = {
        'pending': '<span class="status-badge status-pending"><i class="fas fa-clock"></i> Menunggu</span>',
        'proses':  '<span class="status-badge status-proses"><i class="fas fa-spinner"></i> Diproses</span>',
        'selesai': '<span class="status-badge status-selesai"><i class="fas fa-check"></i> Selesai</span>'
    };
    return statusMap[status] || statusMap.pending;
}

/**
 * Update angka statistik di 3 kartu atas halaman riwayat
 * Dipanggil setiap kali data berubah (tampil, edit, hapus)
 */
function updateStatistics() {
    // Total pengiriman: jumlah semua pesanan
    const elTotal = document.getElementById('totalPengiriman');
    if (elTotal) elTotal.textContent = pickupData.length;

    // Total berat: sum semua item.berat
    const elBerat = document.getElementById('totalBerat');
    if (elBerat) {
        const totalBerat = pickupData.reduce((sum, item) => sum + (item.berat || 0), 0);
        elBerat.textContent = totalBerat.toLocaleString();
    }

    // Estimasi pendapatan: sum(berat × 5000)
    const elEstimasi = document.getElementById('totalEstimasi');
    if (elEstimasi) {
        const totalEstimasi = pickupData.reduce((sum, item) => sum + ((item.berat || 0) * 5000), 0);
        elEstimasi.textContent = `Rp ${totalEstimasi.toLocaleString('id-ID')}`;
    }
}

/**
 * Tampilkan data ke tabel (dengan filter pencarian dan status)
 * Dipanggil:
 * - Pertama kali saat halaman riwayat dimuat
 * - Setiap kali user mengetik di searchInput
 * - Setiap kali user memilih statusFilter
 * - Setiap kali data berubah (edit/hapus)
 */
function displayPickupData() {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return; // hanya jalan di riwayat.html

    // Refresh data dari localStorage (pastikan terbaru)
    pickupData = JSON.parse(localStorage.getItem('waste2worth_pickups')) || [];

    // Ambil nilai filter
    const searchTerm   = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    // Filter data berdasarkan pencarian dan status
    let filteredData = pickupData;

    if (searchTerm) {
        filteredData = filteredData.filter(item =>
            item.nama.toLowerCase().includes(searchTerm) ||
            item.id.toString().includes(searchTerm)
        );
    }

    if (statusFilter) {
        filteredData = filteredData.filter(item => item.status === statusFilter);
    }

    // Tampilkan empty state jika tidak ada data
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <i class="fas fa-recycle"></i>
                        <h3>${pickupData.length === 0 ? 'Belum ada data penjemputan' : 'Tidak ada hasil yang cocok'}</h3>
                        <p>${pickupData.length === 0 ? 'Silakan buat pesanan penjemputan di halaman Layanan' : 'Coba ubah kata kunci atau filter status'}</p>
                        ${pickupData.length === 0 ? `<a href="layanan.html" class="btn btn-primary" style="margin-top:15px;"><i class="fas fa-plus"></i> Buat Pesanan</a>` : ''}
                    </div>
                </td>
            </tr>
        `;
        updateStatistics(); // tetap update statistik (akan jadi 0)
        return;
    }

    // Buat baris HTML untuk setiap item
    tbody.innerHTML = filteredData.map(item => `
        <tr data-id="${item.id}">
            <td><small style="color:var(--text-light)">#${item.id.toString().slice(-6)}</small></td>
            <td>${formatDate(item.tanggal)}</td>
            <td>${item.nama}</td>
            <td>${item.kecamatan}</td>
            <td>${Array.isArray(item.jenisSampah) ? item.jenisSampah.join(', ') : item.jenisSampah}</td>
            <td>${item.berat} kg</td>
            <td>${getStatusBadge(item.status)}</td>
            <td>
                <!-- Tombol edit: buka modal edit dengan data terisi -->
                <button class="action-btn edit" onclick="editPickup(${item.id})" title="Edit pesanan">
                    <i class="fas fa-edit"></i>
                </button>
                <!-- Tombol hapus: konfirmasi lalu hapus dari localStorage -->
                <button class="action-btn delete" onclick="deletePickup(${item.id})" title="Hapus pesanan">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Perbarui statistik setelah data tampil
    updateStatistics();
}


/* ============================================================
   11. CRUD: EDIT PESANAN
   ============================================================ */

/** ID pesanan yang sedang dalam mode edit (null jika tidak ada) */
let editingId = null;

/**
 * editPickup(id): Buka modal edit dan isi dengan data pesanan yang dipilih
 * Dipanggil oleh tombol ✏️ pada setiap baris tabel
 */
function editPickup(id) {
    const item = pickupData.find(i => i.id === id);
    if (!item) {
        showNotification('Data tidak ditemukan!', 'error');
        return;
    }

    editingId = id; // simpan ID yang sedang diedit

    // Isi semua field modal edit dengan data lama
    const setVal = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    setVal('editNama',    item.nama);
    setVal('editPhone',   item.phone);
    setVal('editAlamat',  item.alamat);
    setVal('editBerat',   item.berat);
    setVal('editTanggal', item.tanggal);
    setVal('editWaktu',   item.waktu);
    setVal('editCatatan', item.catatan);

    // Set kecamatan: cocokkan teks pilihan
    const editKecamatan = document.getElementById('editKecamatan');
    if (editKecamatan && item.kecamatan) {
        Array.from(editKecamatan.options).forEach((opt, i) => {
            if (opt.text === item.kecamatan) editKecamatan.selectedIndex = i;
        });
    }

    // Set jenis sampah (multiple select): reset dulu, lalu pilih yang sesuai
    const editJenisSampah = document.getElementById('editJenisSampah');
    if (editJenisSampah && item.jenisSampah) {
        Array.from(editJenisSampah.options).forEach(opt => {
            opt.selected = item.jenisSampah.includes(opt.value) || item.jenisSampah.includes(opt.text);
        });
    }

    // Set status pesanan
    const editStatus = document.getElementById('editStatus');
    if (editStatus && item.status) {
        Array.from(editStatus.options).forEach((opt, i) => {
            if (opt.value === item.status) editStatus.selectedIndex = i;
        });
    }

    // Tampilkan modal edit
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.style.display = 'flex';
}

/**
 * Ambil pilihan dari select multiple di modal edit
 * Return: array teks pilihan yang dipilih
 */
function getSelectedEditJenisSampah() {
    const select = document.getElementById('editJenisSampah');
    if (!select) return [];
    return Array.from(select.options).filter(o => o.selected).map(o => o.value || o.text);
}

/**
 * saveEditPickup(): Simpan perubahan dari modal edit ke localStorage
 * Dipanggil oleh tombol "Simpan Perubahan" di modal edit
 */
function saveEditPickup() {
    if (!editingId) return;

    // Kumpulkan data baru dari form edit
    const updatedData = {
        nama:        document.getElementById('editNama')?.value    || '',
        phone:       document.getElementById('editPhone')?.value   || '',
        alamat:      document.getElementById('editAlamat')?.value  || '',
        kecamatan:   document.getElementById('editKecamatan')?.value || '',
        jenisSampah: getSelectedEditJenisSampah(),
        berat:       parseFloat(document.getElementById('editBerat')?.value) || 0,
        tanggal:     document.getElementById('editTanggal')?.value || '',
        waktu:       document.getElementById('editWaktu')?.value   || '',
        catatan:     document.getElementById('editCatatan')?.value || '',
        status:      document.getElementById('editStatus')?.value  || 'pending'
    };

    // Validasi dasar
    if (updatedData.nama.length < 3) {
        showNotification('Nama minimal 3 karakter!', 'error'); return;
    }
    const phoneRegex = /^[0-9]{10,13}$/;
    if (!phoneRegex.test(updatedData.phone.replace(/\D/g, ''))) {
        showNotification('Nomor HP tidak valid!', 'error'); return;
    }
    if (updatedData.alamat.length < 10) {
        showNotification('Alamat terlalu pendek!', 'error'); return;
    }
    if (updatedData.berat < 1) {
        showNotification('Berat sampah minimal 1 kg!', 'error'); return;
    }

    // Cari index data yang diedit dan update
    const index = pickupData.findIndex(i => i.id === editingId);
    if (index !== -1) {
        // Pertahankan id dan tanggalDibuat asli
        updatedData.id           = pickupData[index].id;
        updatedData.tanggalDibuat = pickupData[index].tanggalDibuat;

        pickupData[index] = updatedData;
        localStorage.setItem('waste2worth_pickups', JSON.stringify(pickupData));

        displayPickupData(); // refresh tabel
        closeEditModal();
        showNotification(`✅ Pesanan ID #${editingId.toString().slice(-6)} berhasil diupdate!`);
    }

    editingId = null;
}

/** Tutup modal edit tanpa menyimpan */
function closeEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.style.display = 'none';
    editingId = null;
}


/* ============================================================
   12. CRUD: HAPUS PESANAN
   Konfirmasi → hapus dari array → simpan ke localStorage → refresh tabel
   ============================================================ */
function deletePickup(id) {
    if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
        pickupData = pickupData.filter(item => item.id !== id);
        localStorage.setItem('waste2worth_pickups', JSON.stringify(pickupData));
        displayPickupData(); // refresh tabel
        showNotification(`🗑️ Pesanan berhasil dihapus!`);
    }
}


/* ============================================================
   INISIALISASI HALAMAN: DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

    /* ---- Inisialisasi tabel + filter (hanya di riwayat.html) ---- */
    if (document.getElementById('tableBody')) {
        displayPickupData(); // isi tabel saat pertama dimuat

        // Filter real-time saat mengetik di kotak pencarian
        document.getElementById('searchInput')?.addEventListener('input', displayPickupData);

        // Filter saat dropdown status berubah
        document.getElementById('statusFilter')?.addEventListener('change', displayPickupData);
    }

    /* ---- Tutup modal edit dengan tombol ESC ---- */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeEditModal();
        }
    });
});

/* Klik area overlay (di luar kotak modal edit) → tutup modal edit */
window.addEventListener('click', function (event) {
    if (event.target === document.getElementById('editModal')) closeEditModal();
});


/* ============================================================
   EKSPOR FUNGSI KE GLOBAL SCOPE (dipanggil via onclick="" di HTML)
   ============================================================ */
window.editPickup      = editPickup;
window.saveEditPickup  = saveEditPickup;
window.closeEditModal  = closeEditModal;
window.deletePickup    = deletePickup;
