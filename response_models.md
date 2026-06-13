# HealthPlate API Response Model Schema Reference

Dokumen ini mendokumentasikan skema properti model data respons aktual dari backend HealthPlate untuk membantu penulisan data-class/model di sisi frontend.

---

## 1. User Profile Model

Representasi objek data profil pengguna (`users` table).

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `user_id` | UUID (String) | No | Unique identifier dari Supabase Auth. |
| `email` | String | No | Alamat email terdaftar pengguna. |
| `name` | String | No | Nama lengkap pengguna. |
| `avatar_url` | String | Yes | URL gambar avatar profil di Supabase Storage bucket. |
| `calories_kcal` | Double (Number) | No | Batas target kalori harian (default: `2000.0`). |
| `protein_g` | Double (Number) | No | Target asupan protein harian (g) (default: `60.0`). |
| `carbohydrate_g`| Double (Number) | No | Target asupan karbohidrat harian (g) (default: `300.0`). |
| `fat_g` | Double (Number) | No | Target asupan lemak harian (g) (default: `65.0`). |
| `sugar_g` | Double (Number) | No | Batas konsumsi gula harian (g) (default: `50.0`). |
| `fcm_token` | String | Yes | Token untuk push notification perangkat seluler. |
| `created_at` | Timestamp (String)| No | Waktu pembuatan akun. |

---

## 2. Meal Package Model

Model untuk merepresentasikan paket program diet makan harian (`meal_packages` table).

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `package_id` | UUID (String) | No | ID Unik paket program makan. |
| `package_name` | String | No | Nama paket program makan (contoh: *Kaya Protein A*). |
| `description` | String | Yes | Penjelasan detail mengenai menu gizi paket program. |
| `estimated_calories` | Integer | No | Total perkiraan kalori program makan harian. |
| `image_url` | String | Yes | Gambar ilustrasi menu program diet. |
| `is_active` | Boolean | No | Penanda apakah paket aktif ditawarkan (default: `true`). |
| `focus_id` | UUID (String) | Yes | ID Fokus diet (`focus_categories`). |
| `created_at` | Timestamp (String)| No | Tanggal pembuatan record data paket. |

---

## 3. Recipe Model

Model detail resep makanan beserta sub-properti bahan dan langkah pembuatan (`recipes` table).

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `recipe_id` | UUID (String) | No | ID Unik resep masakan. |
| `recipe_name` | String | No | Nama menu masakan resep. |
| `description` | String | Yes | Deskripsi singkat mengenai menu resep. |
| `instructions` | String | No | Instruksi umum memasak. |
| `image_url` | String | Yes | URL foto hidangan masakan resep. |
| `cooking_time` | Integer | Yes | Estimasi durasi memasak dalam menit. |
| `difficulty` | String | Yes | Tingkat kesulitan (Easy, Medium, Hard). |
| `servings` | Integer | Yes | Jumlah porsi penyajian resep. |
| `calories_kcal` | Double (Number) | No | Nilai total kalori resep (g). |
| `protein_g` | Double (Number) | No | Nilai total protein resep (g). |
| `carbohydrate_g`| Double (Number) | No | Nilai total karbohidrat resep (g). |
| `fat_g` | Double (Number) | No | Nilai total lemak resep (g). |
| `sugar_g` | Double (Number) | No | Nilai total gula resep (g). |
| `package_id` | UUID (String) | Yes | Paket asal resep jika terikat ke meal package. |
| `user_id` | UUID (String) | Yes | ID pembuat resep. Jika `null`, resep milik sistem bawaan. |
| `steps` | Array (Object) | No | Langkah memasak (`recipe_steps` detail). |
| `ingredients` | Array (Object) | No | Komposisi bahan (`bahan_resep` detail). |

### Recipe Steps Sub-Object:
* `step_id`: UUID (String)
* `step_number`: Integer
* `instruction`: String

### Recipe Ingredients Sub-Object:
* `bahan_id`: UUID (String)
* `product_id`: UUID (String)
* `quantity`: Double (Number)
* `unit`: String
* `food_product`: Object (`{ "product_id": "UUID", "name": "String" }`)

---

## 4. Daily Log Model

Model pencatatan log asupan gizi harian pengguna (`daily_logs` table).

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `log_id` | UUID (String) | No | ID Unik log harian. |
| `user_id` | UUID (String) | No | ID pengguna pemilik log. |
| `log_date` | Date (String) | No | Tanggal log tercatat (Format: `YYYY-MM-DD`). |
| `total_calories`| Double (Number) | No | Total asupan kalori terkonsumsi (kcal) (default: `0.0`). |
| `total_sugar` | Double (Number) | No | Total asupan gula terkonsumsi (g) (default: `0.0`). |
| `total_carbs` | Double (Number) | No | Total asupan karbohidrat terkonsumsi (g) (default: `0.0`). |
| `total_protein` | Double (Number) | No | Total asupan protein terkonsumsi (g) (default: `0.0`). |
| `total_fat` | Double (Number) | No | Total asupan lemak terkonsumsi (g) (default: `0.0`). |
| `total_water_ml`| Integer | No | Total asupan air minum terkonsumsi (ml) (default: `0`). |

---

## 5. Dashboard Nutrition Model

Skema payload data statistik gizi yang dikembalikan oleh endpoint `GET /api/v1/dashboard/summary`.

| Property Path | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `date` | Date (String) | No | Tanggal hari ini (Format: `YYYY-MM-DD`). |
| `consumed` | Object | No | Total gizi terkonsumsi hari ini. Memuat sub-property: `calories`, `sugar`, `carbohydrate`, `protein`, `fat`, `water_ml`. |
| `target` | Object | No | Target batas gizi harian user. Memuat sub-property: `calories`, `sugar`, `carbohydrate`, `protein`, `fat`, `water_ml`. |
| `percentage` | Object | No | Persentase pencapaian asupan terhadap target gizi. Memuat sub-property: `calories`, `sugar`, `carbohydrate`, `protein`, `fat`, `water_ml`. |
| `entries` | Array (Object) | No | Daftar entri log makanan yang dikonsumsi hari ini. |

---

## 6. Notification Model

Model data untuk pesan notifikasi inbox pengguna (`notifications` table).

| Field Name | Data Type | Nullable | Description |
| :--- | :--- | :---: | :--- |
| `notification_id`| UUID (String) | No | ID Unik pesan notifikasi. |
| `user_id` | UUID (String) | No | ID pengguna penerima notifikasi. |
| `title` | String | No | Judul pesan notifikasi. |
| `message` | String | No | Isi penjelasan detail notifikasi. |
| `is_read` | Boolean | No | Status apakah notifikasi sudah dibaca (default: `false`). |
| `type` | String | No | Jenis notifikasi (contoh: `general`). |
| `created_at` | Timestamp (String)| No | Waktu notifikasi dibuat & masuk inbox. |
