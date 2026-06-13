# HealthPlate API Endpoint Inventory

Dokumen ini berisi daftar inventaris seluruh rute API yang terdaftar secara aktual di backend HealthPlate, termasuk status otentikasi, controller, dan service yang menanganinya.

---

## 1. Authentication

Semua endpoint otentikasi berada di bawah prefix `/api/v1/auth`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **POST** | `/register` | Public | `auth.controller.js` -> `register` | `auth.service.js` -> `register` |
| **POST** | `/login` | Public | `auth.controller.js` -> `login` | `auth.service.js` -> `login` |
| **POST** | `/logout` | Bearer Token | `auth.controller.js` -> `logout` | `auth.service.js` -> `logout` |

---

## 2. Profile

Mengelola profil pengguna yang sedang login di bawah prefix `/api/v1/auth/me` atau `/api/v1/upload`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/me` | Bearer Token | `auth.controller.js` -> `getMe` | `auth.service.js` -> `getMe` |
| **PUT** | `/me` | Bearer Token | `auth.controller.js` -> `updateMe` | `auth.service.js` -> `updateMe` |
| **POST** | `/upload/avatar` | Bearer Token | `upload.controller.js` -> `uploadAvatar` | `upload.service.js` -> `updateAvatar` |

---

## 3. Food Products

Pencarian produk makanan dan nutrisi di bawah prefix `/api/v1/nutrition`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/foods` | Public | `nutrition.controller.js` -> `getAllFoods` | `nutrition.service.js` -> `getAllFoods` |
| **GET** | `/foods/search` | Public | `nutrition.controller.js` -> `searchFoods` | `nutrition.service.js` -> `searchFoods` |
| **GET** | `/foods/barcode/:code` | Public | `nutrition.controller.js` -> `getFoodByBarcode` | `nutrition.service.js` -> `getFoodByBarcode` |
| **GET** | `/foods/:id` | Public | `nutrition.controller.js` -> `getFoodById` | `nutrition.service.js` -> `getFoodById` |

---

## 4. Barcode Scanner

Pencarian barcode dengan integrasi API Open Food Facts di bawah prefix `/api/v1/scan`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **POST** | `/barcode` | Bearer Token | `scan.controller.js` -> `scanBarcode` | `scan.service.js` -> `scanBarcode` |

> [!NOTE]
> File `barcode.routes.js` (dengan rute `GET /:barcode`) terdefinisi di repository namun belum didaftarkan di `src/routes/index.js`. Pengembang frontend disarankan menggunakan `POST /api/v1/scan/barcode` untuk pencarian barcode dengan caching Open Food Facts, atau `GET /api/v1/nutrition/foods/barcode/:code` untuk database lokal.

---

## 5. Recipes

Pengelolaan resep masakan oleh user di bawah prefix `/api/v1/recipe`. Resep sistem dilindungi dari modifikasi (Sprint 4D.1 BOLA fix).

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/categories` | Public | `recipe.controller.js` -> `getCategories` | `recipe.service.js` -> `getCategories` |
| **GET** | `/search` | Public | `recipe.controller.js` -> `searchRecipes` | `recipe.service.js` -> `searchRecipes` |
| **GET** | `/` | Public | `recipe.controller.js` -> `getAllRecipes` | `recipe.service.js` -> `getAllRecipes` |
| **GET** | `/:id` | Public | `recipe.controller.js` -> `getRecipeById` | `recipe.service.js` -> `getRecipeById` |
| **POST** | `/` | Bearer Token | `recipe.controller.js` -> `createRecipe` | `recipe.service.js` -> `createRecipe` |
| **PUT** | `/:id` | Bearer Token | `recipe.controller.js` -> `updateRecipe` | `recipe.service.js` -> `updateRecipe` |
| **DELETE** | `/:id` | Bearer Token | `recipe.controller.js` -> `deleteRecipe` | `recipe.service.js` -> `deleteRecipe` |
| **POST** | `/:id/ingredients` | Bearer Token | `recipe.controller.js` -> `addIngredient` | `recipe.service.js` -> `addIngredient` |
| **DELETE** | `/:id/ingredients/:bahanId` | Bearer Token | `recipe.controller.js` -> `deleteIngredient` | `recipe.service.js` -> `deleteIngredient` |
| **POST** | `/:id/steps` | Bearer Token | `recipe.controller.js` -> `addStep` | `recipe.service.js` -> `addStep` |
| **DELETE** | `/:id/steps/:stepId` | Bearer Token | `recipe.controller.js` -> `deleteStep` | `recipe.service.js` -> `deleteStep` |
| **POST** | `/upload/recipe/:id` | Bearer Token | `upload.controller.js` -> `uploadRecipeImage` | `upload.service.js` -> `updateRecipeImage` |

---

## 6. Meal Plan

Penerapan program makan harian pengguna di bawah prefix `/api/v1/mealplan`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/` | Bearer Token | `mealplan.controller.js` -> `getAllMealPlans` | `mealplan.service.js` -> `getAllMealPlans` |
| **POST** | `/` | Bearer Token | `mealplan.controller.js` -> `createMealPlan` | `mealplan.service.js` -> `createMealPlan` |
| **POST** | `/apply-package` | Bearer Token | `mealplan.controller.js` -> `applyPackage` | `mealplan.service.js` -> `applyPackage` |
| **GET** | `/date/:date` | Bearer Token | `mealplan.controller.js` -> `getMealPlanByDate` | `mealplan.service.js` -> `getMealPlanByDate` |
| **GET** | `/:id` | Bearer Token | `mealplan.controller.js` -> `getMealPlanById` | `mealplan.service.js` -> `getMealPlanById` |
| **PUT** | `/:id` | Bearer Token | `mealplan.controller.js` -> `updateMealPlan` | `mealplan.service.js` -> `updateMealPlan` |
| **DELETE** | `/:id` | Bearer Token | `mealplan.controller.js` -> `deleteMealPlan` | `mealplan.service.js` -> `deleteMealPlan` |
| **POST** | `/:id/items` | Bearer Token | `mealplan.controller.js` -> `addItem` | `mealplan.service.js` -> `addItem` |
| **DELETE** | `/:id/items/:itemId` | Bearer Token | `mealplan.controller.js` -> `deleteItem` | `mealplan.service.js` -> `deleteItem` |
| **DELETE** | `/:id/items/date/:date` | Bearer Token | `mealplan.controller.js` -> `deleteItemsByDate` | `mealplan.service.js` -> `deleteItemsByDate` |

---

## 7. Daily Log

Pencatatan konsumsi kalori, makronutrisi harian, dan air di bawah prefix `/api/v1/log`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/` | Bearer Token | `log.controller.js` -> `getAllLogs` | `log.service.js` -> `getAllLogs` |
| **GET** | `/:date` | Bearer Token | `log.controller.js` -> `getLogByDate` | `log.service.js` -> `getLogByDate` |
| **POST** | `/:date/entries` | Bearer Token | `log.controller.js` -> `addEntry` | `log.service.js` -> `addEntry` |
| **POST** | `/:date/entries/custom` | Bearer Token | `log.controller.js` -> `addCustomEntry` | `log.service.js` -> `addCustomEntry` |
| **DELETE** | `/:date/entries/:entryId` | Bearer Token | `log.controller.js` -> `deleteEntry` | `log.service.js` -> `deleteEntry` |
| **PUT** | `/:date/water` | Bearer Token | `log.controller.js` -> `updateWater` | `log.service.js` -> `updateWater` |
| **POST** | `/upload/consumption-photo` | Bearer Token | `upload.controller.js` -> `uploadConsumptionPhoto` | `upload.service.js` -> `updateConsumptionPhoto` |

---

## 8. Dashboard & History

Informasi ringkasan asupan hari ini serta grafik riwayat nutrisi di bawah prefix `/api/v1/dashboard`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/summary` | Bearer Token | `dashboard.controller.js` -> `getSummary` | `dashboard.service.js` -> `getSummary` |
| **GET** | `/history` | Bearer Token | `dashboard.controller.js` -> `getHistory` | `dashboard.service.js` -> `getHistory` |

---

## 9. Articles

Mengonsumsi konten edukasi artikel di bawah prefix `/api/v1/article`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/` | Public | `article.controller.js` -> `getAllArticles` | `article.service.js` -> `getAllArticles` |
| **GET** | `/:id` | Public | `article.controller.js` -> `getArticleById` | `article.service.js` -> `getArticleById` |
| **GET** | `/:id/engagement` | Public | `article.controller.js` -> `getEngagement` | `article.service.js` -> `getEngagement` |
| **POST** | `/` | Bearer Token | `article.controller.js` -> `createArticle` | `article.service.js` -> `createArticle` |
| **PUT** | `/:id` | Bearer Token | `article.controller.js` -> `updateArticle` | `article.service.js` -> `updateArticle` |
| **DELETE** | `/:id` | Bearer Token | `article.controller.js` -> `deleteArticle` | `article.service.js` -> `deleteArticle` |
| **POST** | `/:id/like` | Bearer Token | `article.controller.js` -> `likeArticle` | `article.service.js` -> `likeArticle` |
| **POST** | `/:id/bookmark` | Bearer Token | `article.controller.js` -> `bookmarkArticle` | `article.service.js` -> `bookmarkArticle` |
| **GET** | `/my/engagement` | Bearer Token | `article.controller.js` -> `getAllEngagementSummary` | `article.service.js` -> `getAllEngagementSummary` |

---

## 10. Tips

Tips kesehatan harian di bawah prefix `/api/v1/tips`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/` | Public | `tips.controller.js` -> `getAllTips` | `tips.service.js` -> `getAllTips` |
| **GET** | `/:id` | Public | `tips.controller.js` -> `getTipById` | `tips.service.js` -> `getTipById` |
| **POST** | `/` | Bearer Token | `tips.controller.js` -> `createTip` | `tips.service.js` -> `createTip` |
| **PUT** | `/:id` | Bearer Token | `tips.controller.js` -> `updateTip` | `tips.service.js` -> `updateTip` |
| **DELETE** | `/:id` | Bearer Token | `tips.controller.js` -> `deleteTip` | `tips.service.js` -> `deleteTip` |

---

## 11. Notifications

Pengaturan notifikasi push dan inbox pengguna di bawah prefix `/api/v1/notification`.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **POST** | `/token` | Bearer Token | `notification.controller.js` -> `saveFcmToken` | `notification.service.js` -> `saveFcmToken` |
| **POST** | `/fcm-token` | Bearer Token | `notification.controller.js` -> `saveFcmToken` | `notification.service.js` -> `saveFcmToken` |
| **GET** | `/` | Bearer Token | `notification.controller.js` -> `getNotifications` | `notification.service.js` -> `getNotifications` |
| **POST** | `/` | Bearer Token | `notification.controller.js` -> `createNotification` | `notification.service.js` -> `saveNotification` |
| **PATCH** | `/:id/read` | Bearer Token | `notification.controller.js` -> `markAsRead` | `notification.service.js` -> `markAsRead` |
| **PATCH** | `/read-all` | Bearer Token | `notification.controller.js` -> `markAllAsRead` | `notification.service.js` -> `markAllAsRead` |
| **GET** | `/settings` | Bearer Token | `notification.controller.js` -> `getSettings` | `notification.settings.service.js` -> `getSettings` |
| **PUT** | `/settings` | Bearer Token | `notification.controller.js` -> `putSettings` | `notification.settings.service.js` -> `updateSettings` |
| **PUT** | `/settings/:type` | Bearer Token | *(Inline router)* | `notification.settings.service.js` -> `updateSetting` |
| **POST** | `/settings/reset` | Bearer Token | *(Inline router)* | `notification.settings.service.js` -> `resetSettings` |

---

## 12. Admin CRUD & Monitoring

Akses kontrol admin di bawah prefix `/api/v1/admin`. Semua endpoint ini memerlukan level otentikasi admin.

| Method | Route | Auth Required | Controller | Service |
| :--- | :--- | :---: | :--- | :--- |
| **GET** | `/food-categories` | Admin Token | `adminFood.controller.js` -> `getAllCategories` | `adminFood.service.js` -> `getAllCategories` |
| **POST** | `/food-categories` | Admin Token | `adminFood.controller.js` -> `createCategory` | `adminFood.service.js` -> `createCategory` |
| **PUT** | `/food-categories/:id` | Admin Token | `adminFood.controller.js` -> `updateCategory` | `adminFood.service.js` -> `updateCategory` |
| **DELETE** | `/food-categories/:id` | Admin Token | `adminFood.controller.js` -> `deleteCategory` | `adminFood.service.js` -> `deleteCategory` |
| **GET** | `/foods` | Admin Token | `adminFood.controller.js` -> `getAllFoods` | `adminFood.service.js` -> `getAllFoods` |
| **POST** | `/foods` | Admin Token | `adminFood.controller.js` -> `createFood` | `adminFood.service.js` -> `createFood` |
| **PUT** | `/foods/:id` | Admin Token | `adminFood.controller.js` -> `updateFood` | `adminFood.service.js` -> `updateFood` |
| **DELETE** | `/foods/:id` | Admin Token | `adminFood.controller.js` -> `deleteFood` | `adminFood.service.js` -> `deleteFood` |
| **GET** | `/meal-categories` | Admin Token | `adminMeal.controller.js` -> `getAllMealCategories` | `adminMeal.service.js` -> `getAllMealCategories` |
| **GET** | `/meal-packages` | Admin Token | `adminMeal.controller.js` -> `getAllMealPackages` | `adminMeal.service.js` -> `getAllMealPackages` |
| **POST** | `/meal-packages` | Admin Token | `adminMeal.controller.js` -> `createMealPackage` | `adminMeal.service.js` -> `createMealPackage` |
| **PUT** | `/meal-packages/:id` | Admin Token | `adminMeal.controller.js` -> `updateMealPackage` | `adminMeal.service.js` -> `updateMealPackage` |
| **DELETE** | `/meal-packages/:id` | Admin Token | `adminMeal.controller.js` -> `deleteMealPackage` | `adminMeal.service.js` -> `deleteMealPackage` |
| **GET** | `/users` | Admin Token | `adminMonitoring.controller.js` -> `getUsers` | `adminMonitoring.service.js` -> `getUsers` |
| **GET** | `/logs` | Admin Token | `adminMonitoring.controller.js` -> `getLogs` | `adminMonitoring.service.js` -> `getLogs` |
