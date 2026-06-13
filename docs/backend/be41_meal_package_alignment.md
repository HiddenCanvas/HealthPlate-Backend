# BE-4.1 Architecture Alignment Report — Meal Package Service Alignment & Preview API Normalization

Dokumen ini menjelaskan perubahan arsitektur, pemetaan data, dan kontrak API baru yang diperkenalkan pada Sprint BE-4.1. Informasi ini berfungsi sebagai referensi resmi untuk integrasi frontend mulai dari Sprint FE-3.5 dan seterusnya.

---

## 1. Background

Sebelum Sprint BE-4.1, arsitektur penyajian paket makanan (*meal packages*) memiliki beberapa keterbatasan:
* **Local Meal Mapping di Frontend:** Aplikasi frontend melakukan hardcoding menu makanan berdasarkan pencocokan nama paket (misalnya, jika nama mengandung `"Protein A"`, maka diasumsikan menu tertentu untuk waktu makan tertentu).
* **Hardcoded Package Name:** Pemetaan pratinjau paket didasarkan pada nama teks paket, bukan dari relasi database resmi.
* **Absennya API Preview Resmi:** Backend belum menyediakan properti pratinjau menu makanan terintegrasi untuk mempermudah render kartu/preview paket di sisi klien.
* **Generator Rencana Makan Terbatas:** Generator rencana makan (`POST /api/v1/mealplan/apply-package`) belum sepenuhnya membaca relasi pemetaan resep dari tabel junction database, melainkan melakukan pencarian acak atau menggunakan fallback `meal_time` bawaan.

Penyelarasan pada Sprint BE-4.1 dilakukan pada service layer JavaScript untuk membaca relasi `meal_package_items` sebagai satu-satunya sumber data resmi (*single source of truth*) tanpa mengubah skema database production.

---

## 2. Architecture Before

Alur pemetaan data sebelum dilakukannya penyelarasan:

```text
Meal Package (Metadata saja)
     ↓
Nama Paket (String Match: "Kaya Protein A")
     ↓
Frontend Mapping (Hardcoded Dart/Flutter)
     ↓
Preview Meals (Render UI & Detail Waktu Makan)
```

**Kelemahan Pendekatan Lama:**
* **Duplikasi Logika:** Perubahan menu makanan di database mengharuskan developer memperbarui kode aplikasi di frontend secara manual.
* **Perawatan Sulit:** Penambahan paket baru atau modifikasi waktu makan resep rentan menyebabkan error jika frontend belum diperbarui.
* **Inkonsistensi Data:** Data yang disajikan ke pengguna berpotensi tidak sinkron dengan data aktual yang tersimpan di database.

---

## 3. Architecture After

Alur pemetaan data terintegrasi setelah penyelarasan Sprint BE-4.1:

```text
focus_categories (Kategori Utama)
        ↓
meal_packages (Paket Program Makan)
        ↓
meal_package_items (Junction Table Many-to-Many)
        ↓
recipes (Resep Makanan & Detail Nutrisi)
```

Tabel `meal_package_items` kini berfungsi sebagai **Source of Truth** resmi di layer database. Layer service backend membaca tabel junction ini secara langsung untuk menyusun data pratinjau resep beserta waktu makannya secara dinamis sebelum dikirim ke frontend.

---

## 4. New API Contract

### Endpoint
```http
GET /api/v1/recipe/categories
```

Endpoint kategori resep kini mengembalikan data kategori fokus (`focus_categories`) dan menyematkan dua properti baru di dalam setiap objek di bawah array `meal_packages`:

### A. Properti `preview_meals`
Menyediakan objek pemetaan langsung dari waktu makan (*meal time*) ke data resep pratinjau. Properti ini ditujukan untuk merender kartu paket (*package card*) dan pratinjau singkat (*package preview*).

```json
{
  "preview_meals": {
    "breakfast": {
      "recipe_id": "460a155d-7ffb-489a-8b71-8f573761254c",
      "recipe_name": "Protein Oatmeal",
      "image_url": "https://images.unsplash.com/..."
    },
    "Breakfast": {
      "recipe_id": "460a155d-7ffb-489a-8b71-8f573761254c",
      "recipe_name": "Protein Oatmeal",
      "image_url": "https://images.unsplash.com/..."
    },
    "lunch": {
      "recipe_id": "65fe7f64-7195-4ec6-8bb7-384d01802f2a",
      "recipe_name": "Chicken Breast Salad",
      "image_url": "https://images.unsplash.com/..."
    },
    "Lunch": {
      "recipe_id": "65fe7f64-7195-4ec6-8bb7-384d01802f2a",
      "recipe_name": "Chicken Breast Salad",
      "image_url": "https://images.unsplash.com/..."
    },
    "dinner": { ... },
    "Dinner": { ... },
    "snack": { ... },
    "Snack": { ... }
  }
}
```
*Catatan: Kunci waktu makan disediakan dalam format huruf kecil (lowercase) dan huruf besar di awal (Capitalized) untuk menjamin kompatibilitas pemetaan di frontend.*

### B. Properti `meal_slots`
Menyediakan array terurut berisi data resep untuk seluruh slot waktu makan (`Breakfast` -> `Lunch` -> `Dinner` -> `Snack`). Properti ini ditujukan untuk halaman detail paket (*detail package screen*), modal paket, maupun halaman detail program makan di masa mendatang.

```json
{
  "meal_slots": [
    {
      "meal_time": "Breakfast",
      "recipe": {
        "recipe_id": "460a155d-7ffb-489a-8b71-8f573761254c",
        "recipe_name": "Protein Oatmeal",
        "image_url": "https://images.unsplash.com/..."
      }
    },
    {
      "meal_time": "Lunch",
      "recipe": {
        "recipe_id": "65fe7f64-7195-4ec6-8bb7-384d01802f2a",
        "recipe_name": "Chicken Breast Salad",
        "image_url": "https://images.unsplash.com/..."
      }
    },
    {
      "meal_time": "Dinner",
      "recipe": { ... }
    },
    {
      "meal_time": "Snack",
      "recipe": { ... }
    }
  ]
}
```

---

## 5. Apply Package Alignment

### Endpoint
```http
POST /api/v1/mealplan/apply-package
```

Generator penyusun meal plan sekarang sepenuhnya diarahkan untuk membaca relasi aktif dari tabel `meal_package_items` untuk mendapatkan data `recipe_id` dan `meal_time`. 

Proses pembuatan item rencana makan (`meal_plan_items`) kini:
* Mengambil data waktu makan (`meal_time`) secara dinamis sesuai slot yang terdaftar di database (tidak ada lagi hardcoding waktu makan menjadi `"Lunch"` atau switch-case nama paket).
* Mendistribusikan item ke `Breakfast`, `Lunch`, `Dinner`, atau `Snack` secara otomatis dari tabel database.

---

## 6. Admin Package Alignment

### Endpoints
```http
GET /api/v1/admin/meal-packages
GET /api/v1/admin/meal-packages/:id
```

Pada panel pengelolaan admin, penyajian daftar resep di dalam paket juga diselaraskan menggunakan relasi tabel junction `meal_package_items`. Metadata `recipes` lama digantikan dengan struktur properti `meals` terurut:

```json
{
  "meals": [
    {
      "meal_time": "Breakfast",
      "recipe_name": "Protein Oatmeal"
    },
    {
      "meal_time": "Lunch",
      "recipe_name": "Chicken Breast Salad"
    },
    {
      "meal_time": "Dinner",
      "recipe_name": "Grilled Salmon with Asparagus"
    },
    {
      "meal_time": "Snack",
      "recipe_name": "Whey Protein Shake"
    }
  ]
}
```

---

## 7. Frontend Migration Notes

> [!IMPORTANT]
> Mulai Sprint **FE-3.5**, tim frontend diwajibkan melakukan migrasi dengan ketentuan sebagai berikut:
> 1. **Hapus Seluruh Local Mapping:** Hapus logika switch-case lokal atau pemeriksaan string nama paket untuk memetakan menu makan di aplikasi Flutter/Dart.
> 2. **Gunakan Properti `preview_meals`:** Gunakan data di dalam properti `preview_meals` untuk menampilkan menu pratinjau resep beserta waktu makannya pada kartu program diet.
> 3. **Gunakan Properti `meal_slots`:** Gunakan data di dalam properti `meal_slots` untuk menampilkan detail menu pada layar rincian paket diet secara dinamis.
> 4. **Hapus Fallback:** Jangan membuat fallback gambar atau teks resep secara statis di sisi frontend. Semua data harus bersumber langsung dari response API categories.

---

## 8. Official Source of Truth

Dengan selesainya Sprint BE-4.1, dideklarasikan secara resmi bahwa:

> [!NOTE]
> Tabel **`meal_package_items`** adalah satu-satunya **Official Source of Truth** untuk:
> * Data pratinjau paket makan di klien (`preview_meals`).
> * Rincian slot resep program diet (`meal_slots`).
> * Proses generasi item rencana makan (`applyPackage`).
> * Pengelolaan paket pada modul Admin Package Management.

---

## 9. Verification Summary

Seluruh pengujian integrasi telah dijalankan menggunakan suite test E2E lokal dan menghasilkan status kelulusan penuh:

| Skenario Pengujian | Hasil Audit / Uji | Status |
| :--- | :--- | :--- |
| Audit Duplikasi Slot Database | Tidak ada duplikasi data `(package_id, meal_time)` | **PASS** |
| Categories API Response Contract | `preview_meals` (object) & `meal_slots` (array) terbentuk | **PASS** |
| Apply Package Generator | Menghasilkan entri meal plan dinamis sesuai slot DB | **PASS** |
| Admin Package Endpoint | Menyajikan field `meals` terurut relasional | **PASS** |
| Keamanan Data Produksi | Bebas dari skema migrasi DDL/DML merusak | **PASS** |
| **Status Akhir** | **Production Ready** | **YES** |
