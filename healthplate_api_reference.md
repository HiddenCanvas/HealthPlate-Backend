# HealthPlate API Reference — Contracts & Payload Models

Dokumen ini memuat detail kontrak REST API lengkap untuk frontend HealthPlate. Semua request mengembalikan respons dalam format JSON. Rute dilindungi menggunakan JWT Bearer Token.

---

## 1. Authentication & Profile

### **POST /api/v1/auth/register**
* **Deskripsi**: Melakukan pendaftaran pengguna baru.
* **Otentikasi**: Public (Tidak butuh token)
* **Request Body**:
  ```json
  {
    "name": "Budi Santoso",
    "email": "budi@healthplate.com",
    "password": "password123"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Registrasi berhasil. Cek email untuk verifikasi."
  }
  ```
* **Error Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Email sudah terdaftar."
  }
  ```
* **Database Tables**: `users`, `notification_settings` (otomatis reset default).

---

### **POST /api/v1/auth/login**
* **Deskripsi**: Masuk ke aplikasi menggunakan email dan sandi untuk mendapatkan access token.
* **Otentikasi**: Public
* **Request Body**:
  ```json
  {
    "email": "budi@healthplate.com",
    "password": "password123"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "e83b4fa8-7ffb-4ab8-9a8c-2bd966f3128b",
        "email": "budi@healthplate.com",
        "name": "Budi Santoso"
      },
      "session": {
        "access_token": "eyJhbGciOi...",
        "token_type": "bearer",
        "expires_in": 3600
      }
    }
  }
  ```
* **Database Tables**: `users` (via Supabase Auth).

---

### **GET /api/v1/auth/me**
* **Deskripsi**: Mengambil data detail profil pengguna yang sedang masuk, termasuk target gizi harian.
* **Otentikasi**: Bearer Token
* **Request Headers**:
  * `Authorization: Bearer <token>`
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user_id": "e83b4fa8-7ffb-4ab8-9a8c-2bd966f3128b",
      "email": "budi@healthplate.com",
      "name": "Budi Santoso",
      "avatar_url": "https://supabase.co/storage/.../avatars/1781.png",
      "calories_kcal": 2000,
      "protein_g": 60.0,
      "carbohydrate_g": 300.0,
      "fat_g": 65.0,
      "sugar_g": 50.0,
      "created_at": "2026-06-12T10:00:00Z"
    }
  }
  ```
* **Database Tables**: `users`.

---

### **PUT /api/v1/auth/me**
* **Deskripsi**: Memperbarui informasi profil pengguna dan mengubah target gizi harian.
* **Otentikasi**: Bearer Token
* **Request Body** (Semua opsional):
  ```json
  {
    "name": "Budi S.",
    "calories_kcal": 1950,
    "protein_g": 65,
    "carbohydrate_g": 280,
    "fat_g": 60,
    "sugar_g": 45
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profil berhasil diperbarui.",
    "data": {
      "user_id": "e83b4fa8-7ffb-4ab8-9a8c-2bd966f3128b",
      "name": "Budi S.",
      "calories_kcal": 1950,
      "protein_g": 65.0,
      "carbohydrate_g": 280.0,
      "fat_g": 60.0,
      "sugar_g": 45.0
    }
  }
  ```
* **Database Tables**: `users`.

---

## 2. Food & Barcode Logging

### **POST /api/v1/scan/barcode**
* **Deskripsi**: Mencari data nutrisi makanan berdasarkan barcode. Mengambil data dari cache lokal terlebih dahulu; jika tidak ada, mencari ke Open Food Facts API global lalu memasukkannya ke database lokal.
* **Otentikasi**: Bearer Token
* **Request Body**:
  ```json
  {
    "barcode": "5449000000996"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "source": "openfoodfacts",
    "data": {
      "product_id": "8354a5b4-ab92-4e90-8ca5-d903a7113437",
      "barcode_code": "5449000000996",
      "product_name": "Coca-Cola Original",
      "brand_name": "The Coca-Cola Company",
      "serving_size_g": 250,
      "calories_kcal": 105,
      "protein_g": 0,
      "carbohydrate_g": 27,
      "fat_g": 0,
      "sugar_g": 27,
      "image_url": "https://images.openfoodfacts.org/images/products/...jpg"
    }
  }
  ```
* **Database Tables**: `food_products` (Write/Read).

---

### **POST /api/v1/log/:date/entries**
* **Deskripsi**: Mencatat asupan makanan dari database makanan (berdasarkan `product_id`) pada tanggal tertentu.
* **Otentikasi**: Bearer Token
* **Path Parameters**:
  * `date`: Tanggal log (Format: `YYYY-MM-DD`, contoh: `2026-06-13`)
* **Request Body**:
  ```json
  {
    "product_id": "8354a5b4-ab92-4e90-8ca5-d903a7113437",
    "meal_time": "Breakfast",
    "portion": 150
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Entry berhasil ditambahkan.",
    "data": {
      "entry_id": "911a0119-a03f-410a-a6a5-61130ea2e71f",
      "log_id": "e301ab92-7ffb-4ab8-bb8d-2917f39ca1a3",
      "product_id": "8354a5b4-ab92-4e90-8ca5-d903a7113437",
      "custom_name": null,
      "meal_time": "Breakfast",
      "portion": 150,
      "consumed_calories": 63,
      "consumed_sugar": 16.2,
      "consumed_carbs": 16.2,
      "consumed_protein": 0,
      "consumed_fat": 0
    }
  }
  ```
* **Database Tables**: `daily_logs` (Get/Create), `log_entries` (Insert), `food_products` (Read).

---

### **POST /api/v1/log/:date/entries/custom**
* **Deskripsi**: Mencatat asupan makanan kustom (manual input tanpa `product_id`).
* **Otentikasi**: Bearer Token
* **Path Parameters**:
  * `date`: Format `YYYY-MM-DD`
* **Request Body**:
  ```json
  {
    "custom_name": "Nasi Goreng Rumah",
    "meal_time": "Dinner",
    "portion": 200,
    "consumed_calories": 350,
    "consumed_protein": 12.5,
    "consumed_carbs": 45,
    "consumed_fat": 14,
    "consumed_sugar": 2.5
  }
  ```
* **Success Response (201 Created)**: Same structure as above with `"custom_name": "Nasi Goreng Rumah"` and `"product_id": null`.
* **Database Tables**: `daily_logs`, `log_entries`.

---

### **DELETE /api/v1/log/:date/entries/:entryId**
* **Deskripsi**: Menghapus entri log makanan tertentu dan memperbarui rekapitulasi harian.
* **Otentikasi**: Bearer Token
* **Path Parameters**:
  * `date`: Format `YYYY-MM-DD`
  * `entryId`: UUID entri log yang akan dihapus.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Entry berhasil dihapus."
  }
  ```
* **Database Tables**: `log_entries`, `daily_logs` (recalculation).

---

### **PUT /api/v1/log/:date/water**
* **Deskripsi**: Mencatat atau memperbarui asupan air minum dalam mililiter (ml).
* **Otentikasi**: Bearer Token
* **Request Body**:
  ```json
  {
    "total_water_ml": 1800
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Air minum berhasil diupdate.",
    "data": {
      "log_id": "e301ab92-7ffb-4ab8-bb8d-2917f39ca1a3",
      "log_date": "2026-06-13",
      "total_water_ml": 1800
    }
  }
  ```
* **Database Tables**: `daily_logs`.

---

### **GET /api/v1/log/:date**
* **Deskripsi**: Mengambil log makanan beserta semua daftar entri makanan dan air pada tanggal tertentu.
* **Otentikasi**: Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "log_id": "e301ab92-7ffb-4ab8-bb8d-2917f39ca1a3",
      "log_date": "2026-06-13",
      "total_calories": 413.0,
      "total_protein": 12.5,
      "total_carbs": 61.2,
      "total_fat": 14.0,
      "total_sugar": 18.7,
      "total_water_ml": 1800,
      "log_entries": [
        {
          "entry_id": "911a0119-a03f-410a-a6a5-61130ea2e71f",
          "meal_time": "Breakfast",
          "portion": 150,
          "consumed_calories": 63,
          "image_url": null,
          "food_products": {
            "product_name": "Coca-Cola Original",
            "brand_name": "The Coca-Cola Company",
            "serving_size_g": 250
          }
        }
      ]
    }
  }
  ```
* **Database Tables**: `daily_logs`, `log_entries`, `food_products`.

---

## 3. Recipes

### **GET /api/v1/recipe**
* **Deskripsi**: Mengambil semua daftar resep bawaan sistem dan resep buatan user.
* **Otentikasi**: Public
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "recipe_id": "460a155d-7ffb-489a-8b71-8f573761254c",
        "recipe_name": "Protein Oatmeal",
        "description": "Oatmeal tinggi protein dengan selai kacang.",
        "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        "cooking_time": 10,
        "difficulty": "Easy",
        "servings": 1,
        "calories_kcal": 350.0,
        "protein_g": 25.0,
        "carbohydrate_g": 45.0,
        "fat_g": 5.0,
        "sugar_g": 2.0,
        "user_id": null,
        "users": null,
        "steps": [
          {
            "step_id": "a183-bc89...",
            "step_number": 1,
            "instruction": "Masak oat dengan susu low-fat."
          }
        ],
        "ingredients": [
          {
            "bahan_id": "b103-91...",
            "product_id": "33b821-ab90...",
            "quantity": 100,
            "unit": "g",
            "food_product": {
              "product_id": "33b821-ab90...",
              "name": "Oatmeal Gandum"
            }
          }
        ]
      }
    ]
  }
  ```
* **Database Tables**: `recipes`, `users`, `recipe_steps`, `bahan_resep`, `food_products`.

---

### **POST /api/v1/recipe**
* **Deskripsi**: Membuat resep makanan baru milik pengguna.
* **Otentikasi**: Bearer Token
* **Request Body**:
  ```json
  {
    "recipe_name": "Oat Chocolate Shake",
    "description": "Smoothie pisang cokelat gandum sehat.",
    "instructions": "Blender pisang dengan oat dan susu cokelat.",
    "cooking_time": 5,
    "difficulty": "Easy",
    "servings": 1,
    "steps": [
      "Siapkan blender.",
      "Blender pisang dan oatmeal sampai halus."
    ]
  }
  ```
* **Success Response (200 OK)**: Returns the newly created recipe object with steps.
* **Database Tables**: `recipes`, `recipe_steps`.

---

### **PUT /api/v1/recipe/:id**
* **Deskripsi**: Memperbarui informasi resep buatan sendiri.
* **Otentikasi**: Bearer Token
* **Database Tables**: `recipes`
* **Catatan Penting**: Mengembalikan `403 Forbidden` jika pengguna mencoba mengedit resep sistem (`user_id = null`) atau resep buatan user lain.

---

### **POST /api/v1/recipe/:id/ingredients**
* **Deskripsi**: Menambahkan item bahan makanan ke resep.
* **Otentikasi**: Bearer Token
* **Request Body**:
  ```json
  {
    "product_id": "8354a5b4-ab92-4e90-8ca5-d903a7113437",
    "quantity": 50,
    "unit": "ml"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "bahan_id": "67b931-a08c-bb9e-1102f90a98f1",
      "recipe_id": "b3198bc6-6cc3-4e7f-813e-88e14dbed1b7",
      "product_id": "8354a5b4-ab92-4e90-8ca5-d903a7113437",
      "quantity": 50,
      "unit": "ml"
    }
  }
  ```
* **Database Tables**: `bahan_resep`, `recipes` (nutrition auto-recalculation).

---

## 4. Meal Plan System

### **POST /api/v1/mealplan/apply-package**
* **Deskripsi**: Mengaktifkan paket makan program diet (meal package) ke kalender menu makan harian user dari tanggal yang dipilih.
* **Otentikasi**: Bearer Token
* **Request Body**:
  ```json
  {
    "package_id": "f5b8c93a-8b9a-4db8-bb9e-2917f3ca102b",
    "date": "2026-06-15"
  }
  ```
* **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Paket makan berhasil diterapkan ke rencana makan harian.",
    "data": {
      "plan_id": "21338423-ae92-4478-9f25-a966fb073791",
      "plan_name": "Kaya Protein Program A",
      "status": "Active",
      "activated_at": "2026-06-15",
      "expires_at": "2026-06-21"
    }
  }
  ```
* **Database Tables**: `meal_packages`, `meal_package_items`, `recipes`, `meal_plans`, `meal_plan_items`.

---

### **GET /api/v1/mealplan/date/:date**
* **Deskripsi**: Mendapatkan daftar rencana menu makanan untuk sarapan, makan siang, makan malam, dan snack pada tanggal tertentu.
* **Otentikasi**: Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-06-15",
      "plans": [
        {
          "plan_id": "21338423-ae92-4478-9f25-a966fb073791",
          "plan_name": "Kaya Protein Program A"
        }
      ],
      "items": [
        {
          "item_id": "de83a09b-bb9e-4db8-11ea-ca919f81a7d1",
          "meal_time": "Breakfast",
          "meal_day": "Monday",
          "portion": 1.0,
          "recipe": {
            "recipe_id": "460a155d-7ffb-489a-8b71-8f573761254c",
            "recipe_name": "Protein Oatmeal",
            "image_url": "https://images.unsplash.com/...jpg",
            "calories_kcal": 350,
            "protein_g": 25
          }
        }
      ]
    }
  }
  ```
* **Database Tables**: `meal_plans`, `meal_plan_items`, `recipes`.

---

## 5. Dashboard & Analytics

### **GET /api/v1/dashboard/summary**
* **Deskripsi**: Mengambil data utama ringkasan asupan nutrisi hari ini beserta perbandingannya dengan target batas gizi harian user (dalam persentase).
* **Otentikasi**: Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "date": "2026-06-13",
      "consumed": {
        "calories": 413.0,
        "sugar": 18.7,
        "carbohydrate": 61.2,
        "protein": 12.5,
        "fat": 14.0,
        "water_ml": 1800
      },
      "target": {
        "calories": 1950,
        "sugar": 45,
        "carbohydrate": 280,
        "protein": 65,
        "fat": 60,
        "water_ml": 2000
      },
      "percentage": {
        "calories": 21.2,
        "sugar": 41.6,
        "carbohydrate": 21.9,
        "protein": 19.2,
        "fat": 23.3,
        "water_ml": 90.0
      },
      "entries": [
        {
          "entry_id": "911a0119-a03f-410a-a6a5-61130ea2e71f",
          "meal_time": "Breakfast",
          "portion": 150,
          "consumed_calories": 63
        }
      ]
    }
  }
  ```
* **Database Tables**: `users`, `daily_logs`, `log_entries`.

---

## 6. Upload Media

### **POST /api/v1/upload/consumption-photo**
* **Deskripsi**: Mengunggah foto makanan dan menyimpannya di entri harian makanan terkait.
* **Otentikasi**: Bearer Token
* **Request Content-Type**: `multipart/form-data`
* **Request Body**:
  * `image`: File Gambar (Binary)
  * `entry_id` (di body atau query string): UUID entri log makanan.
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Foto konsumsi berhasil diupload.",
    "data": {
      "entry_id": "911a0119-a03f-410a-a6a5-61130ea2e71f",
      "image_url": "https://jopxbgesybjqteziskgl.supabase.co/storage/v1/object/public/healthplate-images/consumption/1781340151-abc.png"
    }
  }
  ```
* **Database Tables**: `log_entries` (update `image_url` jika ownership valid).

---

## 7. Notifications

### **GET /api/v1/notification/settings**
* **Deskripsi**: Mengambil konfigurasi setting waktu pengingat makan/minum dan switch notifikasi aktif.
* **Otentikasi**: Bearer Token
* **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "setting_id": "e813-f9a8-db...",
        "type": "breakfast",
        "is_enabled": true,
        "hour": 7,
        "minute": 0,
        "custom_message": "Ayo sarapan pagi ini!",
        "push_enabled": true
      }
    ]
  }
  ```
* **Database Tables**: `notification_settings`.
