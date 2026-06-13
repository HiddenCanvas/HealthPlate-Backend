# HealthPlate Backend Architecture Documentation

Dokumen ini menjelaskan arsitektur sistem, tumpukan teknologi (technology stack), struktur folder, dan gambaran umum basis data (database overview) dari HealthPlate Backend.

---

## 1. Technology Stack

HealthPlate Backend dirancang sebagai API RESTful berkinerja tinggi, aman, dan mudah diintegrasikan oleh frontend. Teknologi utama yang digunakan meliputi:

* **Node.js**: Environment runtime JavaScript di sisi server.
* **Express.js**: Framework web minimalis untuk mengelola routing, middleware, dan request/response HTTP.
* **Supabase**: Backend-as-a-Service (BaaS) berbasis PostgreSQL untuk autentikasi, database, real-time subscriptions, dan penyimpanan file.
* **PostgreSQL**: Database relasional objek utama untuk penyimpanan data transaksional, master resep, log nutrisi, dan notifikasi.
* **Supabase Storage**: Bucket penyimpanan berbasis cloud (`healthplate-images`) untuk mengunggah file media seperti avatar pengguna, foto resep, dan foto makanan yang dikonsumsi.
* **Firebase FCM (Cloud Messaging)**: Digunakan oleh Firebase Admin SDK untuk mengirimkan notifikasi push real-time ke perangkat mobile (Android/iOS) menggunakan FCM token.
* **Open Food Facts API**: API eksternal yang diintegrasikan secara asinkron untuk melakukan pencarian barcode produk makanan global secara real-time apabila data produk belum terdaftar di database lokal.

---

## 2. Folder Structure

Berikut adalah struktur direktori dalam direktori `src/` beserta kegunaan masing-masing komponen:

```text
src/
├── config/         # Konfigurasi koneksi database, firebase admin, dan env
├── controllers/    # Handler HTTP Request & Response (Controller Layer)
├── middleware/     # Otentikasi JWT, validasi admin, dan parsing file upload
├── routes/         # Pemetaan endpoint HTTP ke controller (Routing Layer)
├── services/       # Logika bisnis inti dan kueri database (Service Layer)
└── scheduler.js    # Cron job scheduler untuk pengecekan notifikasi berkala
```

### Penjelasan Folder & Komponen:

* **`src/config`**
  * `env.js`: Memuat variabel lingkungan (`.env`) seperti `PORT` dan konfigurasi API key.
  * `supabase.js`: Menginisialisasi client Supabase dengan hak akses admin (`supabaseAdmin`) dan publik (`supabaseAnon`).
  * `firebase.js`: Menginisialisasi Firebase Admin SDK dengan credentials untuk memicu notifikasi push FCM.

* **`src/controllers`**
  * Mengambil input dari HTTP Request (`req.params`, `req.query`, `req.body`, `req.file`).
  * Memanggil logika bisnis di layer service yang sesuai.
  * Mengembalikan respons HTTP dengan format JSON standar serta kode status yang sesuai (`200`, `201`, `400`, `403`, `404`, `500`).

* **`src/services`**
  * Layer yang memproses logika bisnis utama aplikasi.
  * Berinteraksi langsung dengan Supabase PostgreSQL melalui client SDK.
  * Menghitung nilai nutrisi, mengolah data log harian, memanggil Open Food Facts API, dan mengelola media storage.

* **`src/routes`**
  * Mendaftarkan rute Express, menentukan method HTTP (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), memetakan URL, serta menyematkan middleware perlindungan sebelum memanggil controller.

* **`src/middleware`**
  * `auth.js`: Middleware verifikasi Bearer Token JWT dari Supabase Auth untuk rute pengguna.
  * `adminAuth.js`: Middleware verifikasi level hak akses admin untuk modul CRUD master data.
  * `upload.js`: Menggunakan library `multer` untuk mengurai file gambar multipart/form-data sebelum diunggah.
  * `errorHandler.js`: Penanganan error terpusat yang menangkap exception dan mengembalikan format respons error yang seragam.

---

## 3. Database Overview (Schema & Tables)

Database HealthPlate menggunakan PostgreSQL yang dihosting di Supabase. Terdiri atas 18 tabel utama berikut:

### Tabel Autentikasi & Pengguna (User Management)
1. **`users`**
   * **Fungsi**: Menyimpan data profil dasar pengguna, target asupan kalori/makronutrisi harian, avatar URL, dan token registrasi FCM push notification.
2. **`notification_settings`**
   * **Fungsi**: Preferensi notifikasi pengguna harian (jam & menit untuk sarapan, makan siang, makan malam, air) serta opsi preferensi tipe (mealplan, reminder, artikel, push).

### Tabel Program & Perencanaan Makan (Meal Plan System)
3. **`focus_categories`**
   * **Fungsi**: Kategori fokus diet (misalnya: *Kaya Protein*, *Rendah Kalori*, *Rendah Gula*, *Seimbang*).
4. **`meal_packages`**
   * **Fungsi**: Paket program makan yang dibuat oleh admin berisi estimasi kalori dan terkait ke fokus diet tertentu.
5. **`meal_package_items`**
   * **Fungsi**: Pemetaan resep mana saja yang tergolong dalam sebuah paket makan beserta waktu makannya (Breakfast, Lunch, Dinner, atau Snack).
6. **`meal_plans`**
   * **Fungsi**: Program makan yang diaktifkan oleh pengguna untuk rentang tanggal tertentu.
7. **`meal_plan_items`**
   * **Fungsi**: Kalender daftar resep harian dari paket makan yang aktif untuk disajikan pada hari dan tanggal tertentu.

### Tabel Data Master Makanan (Foods & Recipes)
8. **`food_products`**
   * **Fungsi**: Master data produk makanan beserta rincian gizi per porsi (serving size, kalori, protein, karbohidrat, lemak, gula). Berfungsi juga sebagai cache lokal dari hasil pencarian Open Food Facts.
9. **`recipes`**
   * **Fungsi**: Master resep makanan beserta data agregat nutrisinya. Kolom `user_id` bernilai `NULL` menandakan resep bawaan sistem (resep bawaan program makan).
10. **`recipe_steps`**
   * **Fungsi**: Daftar langkah demi langkah cara memasak suatu resep beserta nomor urut instruksi.
11. **`bahan_resep`**
   * **Fungsi**: Tabel relasi untuk mencatat bahan-bahan pendukung resep yang terikat ke tabel `food_products` beserta kuantitas gram/mililiternya.

### Tabel Pencatatan Harian (Daily Logging & Tracking)
12. **`daily_logs`**
    * **Fungsi**: Log rekapitulasi harian pengguna untuk tanggal tertentu yang mencatat total akumulasi konsumsi kalori, protein, karbohidrat, lemak, gula, dan total konsumsi air minum (ml).
13. **`log_entries`**
    * **Fungsi**: Rincian setiap makanan yang dikonsumsi per hari, terhubung ke `daily_logs` dan `food_products` (atau menyimpan `custom_name` untuk makanan custom), disertai porsi (gram) dan URL foto makanan.

### Tabel Edukasi (Education Content)
14. **`articles`**
    * **Fungsi**: Konten artikel kesehatan dan gizi yang diterbitkan.
15. **`article_likes`**
    * **Fungsi**: Menyimpan daftar pengguna yang menyukai artikel tertentu.
16. **`article_bookmarks`**
    * **Fungsi**: Menyimpan artikel yang disimpan/dibookmark oleh pengguna.
17. **`tips`**
    * **Fungsi**: Tips kesehatan harian berukuran singkat.

### Tabel Notifikasi (Notification History)
18. **`notifications`**
    * **Fungsi**: Riwayat pesan notifikasi inbox pengguna beserta penanda status sudah dibaca (`is_read`).
