# HealthPlate User Feature Mapping Reference

Dokumen ini memetakan seluruh fitur antarmuka pengguna (user features) pada frontend HealthPlate dengan modul endpoint backend yang siap digunakan beserta relasi tabel database terkait.

---

## Tabel Pemetaan Fitur & Endpoint (Feature Mapping)

| Feature Area | Sub-Feature / Halaman | Backend Ready | Endpoint Rute | Tabel Database Terlibat |
| :--- | :--- | :---: | :--- | :--- |
| **Authentication** | Register User Baru | **YES** | `POST /auth/register` | `users`, `notification_settings` |
| | Login Akun | **YES** | `POST /auth/login` | `users` (Supabase Auth) |
| | Logout Akun | **YES** | `POST /auth/logout` | `users` (Supabase Auth) |
| **Profile** | Detail Profil & Target | **YES** | `GET /auth/me` | `users` |
| | Update Nama/Target Gizi | **YES** | `PUT /auth/me` | `users` |
| | Ganti Foto Avatar | **YES** | `POST /upload/avatar` | `users` (Storage: `avatars/`) |
| **Meal Plan** | Dapatkan Fokus Diet | **YES** | `GET /recipe/categories` | `focus_categories` |
| | Daftar Paket Program | **YES** | `GET /mealplan/` | `meal_packages` |
| | Detail Hari & Menu Paket | **YES** | `GET /mealplan/:id` | `meal_packages`, `meal_package_items`, `recipes` |
| | Terapkan Paket Diet | **YES** | `POST /mealplan/apply-package` | `meal_plans`, `meal_plan_items` |
| | Menu Makan Tanggal Tertentu| **YES** | `GET /mealplan/date/:date` | `meal_plans`, `meal_plan_items` |
| **Daily Log** | Ringkasan Kalori Hari Ini | **YES** | `GET /dashboard/summary` | `users`, `daily_logs` |
| | Tampilkan Log Makan | **YES** | `GET /log/:date` | `daily_logs`, `log_entries`, `food_products` |
| | Catat Makanan Produk | **YES** | `POST /log/:date/entries` | `log_entries`, `daily_logs` |
| | Catat Makanan Kustom | **YES** | `POST /log/:date/entries/custom` | `log_entries`, `daily_logs` |
| | Catat Air Minum (ml) | **YES** | `PUT /log/:date/water` | `daily_logs` |
| | Hapus Entri Makanan | **YES** | `DELETE /log/:date/entries/:entryId` | `log_entries`, `daily_logs` |
| | Upload Foto Makanan | **YES** | `POST /upload/consumption-photo` | `log_entries` (Storage: `consumption/`) |
| **Barcode Scan** | Scan & Pencarian OFF | **YES** | `POST /scan/barcode` | `food_products` (OFF API Caching) |
| | Cek Barcode Lokal | **YES** | `GET /nutrition/foods/barcode/:code` | `food_products` |
| **Recipe Detail**| Tampilkan Resep & Langkah | **YES** | `GET /recipe/:id` | `recipes`, `recipe_steps`, `bahan_resep` |
| | Cari Resep Masakan | **YES** | `GET /recipe/search` | `recipes` |
| | Buat Resep Baru Sendiri | **YES** | `POST /recipe/` | `recipes`, `recipe_steps` |
| | Update/Hapus Resep Sendiri | **YES** | `PUT /recipe/:id`<br>`DELETE /recipe/:id` | `recipes` (BOLA Protected) |
| **History** | Grafik & Riwayat Nutrisi | **YES** | `GET /dashboard/history`<br>`GET /log` | `daily_logs` |
| **Notification** | Simpan FCM Token | **YES** | `POST /notification/token` | `users` (`fcm_token`) |
| | Kotak Masuk Inbox | **YES** | `GET /notification/` | `notifications` |
| | Tandai Dibaca | **YES** | `PATCH /notification/:id/read` | `notifications` |
| | Jadwal Alarm Harian | **YES** | `GET /notification/settings` | `notification_settings` |
| | Update Alarm Harian | **YES** | `PUT /notification/settings` | `notification_settings` |
| **Education** | Baca Artikel | **YES** | `GET /article/` | `articles` |
| | Like/Bookmark Artikel | **YES** | `POST /article/:id/like`<br>`POST /article/:id/bookmark`| `article_likes`, `article_bookmarks` |
| | Membaca Tips Kesehatan | **YES** | `GET /tips/` | `tips` |
