# Media & Storage Gap Analysis — HealthPlate

Laporan ini menyajikan analisis celah (gap analysis) antara kemampuan backend saat ini dalam mengelola media/file dengan kebutuhan fungsional antarmuka frontend HealthPlate.

---

## 1. Status Kesiapan Fitur (Feature Status Matrix)

Berikut klasifikasi tingkat kesiapan fitur media berdasarkan ketersediaan endpoint, logika service, dan validasi:

### A. Avatar Upload
* **Status**: **READY**
* **Analisis**: Fitur upload foto profil pengguna sudah lengkap. Endpoint `POST /api/v1/upload/avatar` terproteksi token auth, file difilter khusus gambar, ukuran dibatasi 5MB, diunggah langsung ke folder `avatars/` di Supabase Storage, dan database `users.avatar_url` diperbarui otomatis.

### B. Recipe Image Upload
* **Status**: **PARTIAL**
* **Analisis**: Pengguna dapat mengunggah gambar untuk resep kreasi mereka sendiri (`POST /api/v1/upload/recipe/:id`). Namun, terdapat celah besar di mana administrator tidak dapat memperbarui gambar resep bawaan sistem (resep bawaan seeder dengan `user_id = NULL`) karena query database secara ketat memeriksa kecocokan pemilik: `.eq('user_id', userId)`.

### C. Barcode Product Image
* **Status**: **READY**
* **Analisis**: Saat pencarian barcode dilakukan (`GET /barcode/:barcode` / `POST /log/:date/consume-barcode`), jika produk dicari dari API Open Food Facts eksternal, URL gambar produk (`image_front_url`/`image_url`) otomatis ditarik dan disimpan di kolom `food_products.image_url`. Gambar ini siap ditampilkan di frontend tanpa perlu proses unggah manual dari client.

### D. Food Image Upload (Manual Food Logging)
* **Status**: **MISSING**
* **Analisis**: Kolom database `food_products.image_url` ada, tetapi tidak ada endpoint API di backend untuk mengizinkan pengguna atau admin mengunggah file gambar secara manual untuk produk makanan baru.

### E. Meal Log Image Upload (Foto Piring Makanan Konsumsi)
* **Status**: **MISSING**
* **Analisis**: Meskipun kolom `log_entries.image_url` tersedia di skema database (untuk mendukung fitur pengguna mengambil foto piring makanannya yang dikonsumsi hari ini), backend belum menyediakan endpoint upload atau logika service untuk mengaitkan file unggahan ke entri log konsumsi spesifik.

### F. Storage Security & Public URL Handling
* **Status**: **READY**
* **Analisis**: Penggunaan bucket publik `healthplate-images` sangat mempermudah rendering di frontend. Frontend cukup memuat tautan URL publik gambar secara langsung tanpa perlu melakukan request token presigned atau otorisasi tambahan.

---

## 2. Penilaian Akhir (Final Assessment)

### **Media & Storage Readiness Status**: **PARTIALLY READY**

#### A. Daftar Fitur yang Sudah Siap Dipakai Frontend:
1. Unggah, ubah, dan hapus foto profil pengguna (`avatar_url`).
2. Unggah foto resep makanan kreasi mandiri pengguna.
3. Menampilkan gambar produk makanan hasil pencarian barcode / Open Food Facts API secara otomatis.
4. Akses cepat (direct display) gambar dari Supabase Storage CDN karena konfigurasi bucket yang bersifat publik.

#### B. Daftar Fitur yang Masih Membutuhkan Sprint Tambahan (Pekerjaan Rumah):
1. **Admin Recipe Upload Override**: Mengizinkan administrator (role `admin`) untuk mengabaikan cek kepemilikan resep sehingga dapat memperbarui/mengunggah gambar resep sistem (`user_id = NULL`).
2. **Meal Log Image Upload**: Membuat endpoint `POST /api/v1/upload/log-entry/:entryId` agar user dapat mengunggah foto makanan real-time yang mereka konsumsi harian dan menyimpannya di `log_entries.image_url`.
3. **Food Product Image Upload**: Membuat endpoint upload gambar produk makanan bagi admin untuk memperbarui gambar produk manual yang tidak memiliki barcode.

#### C. Estimasi Effort Penyelesaian:
* **Total Estimasi Waktu**: **1-2 Hari Kerja** (setara dengan **0.5 Sprint**).
* **Kompleksitas**: **Rendah**. Hanya perlu menambahkan 2 endpoint upload baru di `upload.routes.js`, menyesuaikan validasi kepemilikan di `upload.service.js` agar mendukung bypass role `admin`, dan menyambungkannya ke controller.
