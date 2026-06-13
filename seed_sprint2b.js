const { supabaseAdmin } = require('./src/config/supabase');
const { calculateNutrition } = require('./src/services/recipe.service');

const focusData = [
  { focus_name: 'Kaya Protein', description: 'Fokus makanan tinggi protein untuk mendukung perkembangan otot dan pemulihan tubuh.' },
  { focus_name: 'Rendah Kalori', description: 'Fokus makanan rendah kalori untuk mendukung program penurunan berat badan secara sehat.' },
  { focus_name: 'Rendah Gula', description: 'Fokus makanan rendah gula untuk menjaga kadar gula darah.' },
  { focus_name: 'Seimbang', description: 'Fokus gizi seimbang harian untuk mencukupi AKG.' }
];

const packageNames = [
  { name: 'Kaya Protein A', focus: 'Kaya Protein', description: 'Paket makan tinggi protein berbasis dada ayam dan telur.', estimated_calories: 1430, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', is_active: true },
  { name: 'Kaya Protein B', focus: 'Kaya Protein', description: 'Paket gizi tinggi protein variasi ikan dan tahu tempe.', estimated_calories: 1440, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd', is_active: true },
  { name: 'Rendah Kalori A', focus: 'Rendah Kalori', description: 'Paket rendah kalori dengan sayuran hijau dan buah segar.', estimated_calories: 745, image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999', is_active: true },
  { name: 'Rendah Kalori B', focus: 'Rendah Kalori', description: 'Menu defisit kalori dengan oatmeal dan smoothies.', estimated_calories: 760, image_url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af', is_active: true },
  { name: 'Rendah Gula A', focus: 'Rendah Gula', description: 'Paket gizi rendah gula untuk menjaga insulin tetap stabil.', estimated_calories: 1600, image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468', is_active: true },
  { name: 'Rendah Gula B', focus: 'Rendah Gula', description: 'Menu rendah karbohidrat dan bebas pemanis buatan.', estimated_calories: 1350, image_url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601', is_active: true },
  { name: 'Seimbang A', focus: 'Seimbang', description: 'Paket makanan gizi seimbang harian untuk mencukupi AKG.', estimated_calories: 1340, image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061', is_active: true },
  { name: 'Seimbang B', focus: 'Seimbang', description: 'Variasi gizi seimbang mingguan dengan gizi makro lengkap.', estimated_calories: 1260, image_url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759', is_active: true }
];

// 32 Resep Realistis (4 resep per paket, paket A & B berbeda sepenuhnya)
const defaultRecipes = [
  // Kaya Protein A
  { recipe_name: 'Protein Oatmeal', description: 'Oatmeal tinggi protein dengan selai kacang dan susu low-fat.', instructions: 'Masak oat dengan susu low-fat. Tambahkan protein powder dan selai kacang.', cooking_time: 10, difficulty: 'Easy', servings: 1, calories_kcal: 350, protein_g: 25.0, carbohydrate_g: 45.0, fat_g: 5.0, sugar_g: 2.0 },
  { recipe_name: 'Chicken Breast Salad', description: 'Dada ayam panggang dengan selada segar dan minyak zaitun.', instructions: 'Panggang dada ayam. Potong-potong lalu campur dengan selada dan zaitun.', cooking_time: 20, difficulty: 'Medium', servings: 1, calories_kcal: 420, protein_g: 40.0, carbohydrate_g: 10.0, fat_g: 15.0, sugar_g: 1.0 },
  { recipe_name: 'Grilled Salmon with Asparagus', description: 'Salmon panggang kaya omega-3 dan protein tinggi.', instructions: 'Panggang salmon and asparagus di atas pan dengan mentega tipis.', cooking_time: 25, difficulty: 'Medium', servings: 1, calories_kcal: 480, protein_g: 38.0, carbohydrate_g: 8.0, fat_g: 22.0, sugar_g: 0.0 },
  { recipe_name: 'Whey Protein Shake', description: 'Minuman protein praktis setelah olahraga.', instructions: 'Kocok whey protein powder dengan air es menggunakan shaker.', cooking_time: 2, difficulty: 'Easy', servings: 1, calories_kcal: 180, protein_g: 30.0, carbohydrate_g: 5.0, fat_g: 2.0, sugar_g: 1.0 },

  // Kaya Protein B
  { recipe_name: 'Scrambled Egg Whites & Avocado Toast', description: 'Putih telur orak-arik rendah kolesterol dengan roti gandum alpukat.', instructions: 'Masak putih telur. Oleskan alpukat di roti panggang gandum, sajikan bersama.', cooking_time: 12, difficulty: 'Easy', servings: 1, calories_kcal: 380, protein_g: 22.0, carbohydrate_g: 35.0, fat_g: 12.0, sugar_g: 1.0 },
  { recipe_name: 'Tuna Salad Wrap', description: 'Tuna kaleng low-fat dibungkus tortila gandum.', instructions: 'Campur tuna dengan mayones light. Bungkus dalam tortila gandum.', cooking_time: 15, difficulty: 'Easy', servings: 1, calories_kcal: 450, protein_g: 35.0, carbohydrate_g: 30.0, fat_g: 10.0, sugar_g: 2.0 },
  { recipe_name: 'Turkey Meatballs with Zucchini Noodles', description: 'Bakso daging kalkun sehat dengan mie zuchini.', instructions: 'Panggang bakso kalkun. Sajikan di atas zucchini serut kukus dengan saus tomat.', cooking_time: 35, difficulty: 'Medium', servings: 1, calories_kcal: 410, protein_g: 36.0, carbohydrate_g: 15.0, fat_g: 14.0, sugar_g: 3.0 },
  { recipe_name: 'Greek Yogurt with Almonds', description: 'Yogurt yunani murni dengan taburan kacang almond.', instructions: 'Tuang greek yogurt ke mangkok, taburi dengan almond cincang.', cooking_time: 3, difficulty: 'Easy', servings: 1, calories_kcal: 200, protein_g: 18.0, carbohydrate_g: 12.0, fat_g: 8.0, sugar_g: 4.0 },

  // Rendah Kalori A
  { recipe_name: 'Veggie Omelette', description: 'Dadar telur putih dengan bayam, jamur, dan tomat.', instructions: 'Kocok telur putih dengan sayuran cincang. Masak di pan anti lengket.', cooking_time: 10, difficulty: 'Easy', servings: 1, calories_kcal: 180, protein_g: 14.0, carbohydrate_g: 5.0, fat_g: 10.0, sugar_g: 1.0 },
  { recipe_name: 'Low Calorie Tofu Soup', description: 'Sup tahu sutra dengan kaldu jamur bening.', instructions: 'Rebus kaldu jamur, masukkan potongan tahu sutra dan daun bawang.', cooking_time: 15, difficulty: 'Easy', servings: 1, calories_kcal: 220, protein_g: 15.0, carbohydrate_g: 20.0, fat_g: 6.0, sugar_g: 2.0 },
  { recipe_name: 'Baked Cod with Steamed Broccoli', description: 'Ikan kod panggang rendah lemak dengan brokoli kukus.', instructions: 'Panggang kod berbumbu lemon. Kukus brokoli segar sebagai pendamping.', cooking_time: 25, difficulty: 'Medium', servings: 1, calories_kcal: 250, protein_g: 28.0, carbohydrate_g: 10.0, fat_g: 3.0, sugar_g: 1.0 },
  { recipe_name: 'Apple Slices with Cinnamon', description: 'Camilan apel segar dengan aroma kayu manis.', instructions: 'Iris apel tipis-tipis, taburi dengan bubuk kayu manis.', cooking_time: 5, difficulty: 'Easy', servings: 1, calories_kcal: 95, protein_g: 0.5, carbohydrate_g: 25.0, fat_g: 0.3, sugar_g: 19.0 },

  // Rendah Kalori B
  { recipe_name: 'Berry Chia Seed Pudding', description: 'Puding biji chia dengan susu almond dan buah beri.', instructions: 'Rendam biji chia dalam susu almond semalaman. Sajikan dengan stroberi.', cooking_time: 5, difficulty: 'Easy', servings: 1, calories_kcal: 160, protein_g: 4.0, carbohydrate_g: 22.0, fat_g: 5.0, sugar_g: 8.0 },
  { recipe_name: 'Shredded Chicken Veggie Bowl', description: 'Mangkuk sayur dengan suwiran dada ayam rebus.', instructions: 'Kukus kembang kol dan wortel. Sajikan dengan dada ayam suwir bening.', cooking_time: 25, difficulty: 'Easy', servings: 1, calories_kcal: 280, protein_g: 25.0, carbohydrate_g: 18.0, fat_g: 8.0, sugar_g: 2.0 },
  { recipe_name: 'Stir-Fry Garlic Shrimp and Mushrooms', description: 'Tumis udang dan jamur kuping dengan minyak wijen sedikit.', instructions: 'Tumis cepat udang dan jamur dengan bawang putih cincang.', cooking_time: 15, difficulty: 'Medium', servings: 1, calories_kcal: 210, protein_g: 24.0, carbohydrate_g: 12.0, fat_g: 4.0, sugar_g: 1.0 },
  { recipe_name: 'Cucumber Slices with Hummus', description: 'Cemilan mentimun segar renyah dengan cocolan saus hummus.', instructions: 'Iris mentimun, sajikan bersama 2 sendok makan hummus siap saji.', cooking_time: 5, difficulty: 'Easy', servings: 1, calories_kcal: 110, protein_g: 3.0, carbohydrate_g: 15.0, fat_g: 4.0, sugar_g: 2.0 },

  // Rendah Gula A
  { recipe_name: 'Avocado and Bacon Salad', description: 'Salad alpukat gurih dengan bacon sapi renyah tanpa karbohidrat.', instructions: 'Campur potongan alpukat dengan beef bacon panggang garing di atas selada.', cooking_time: 15, difficulty: 'Easy', servings: 1, calories_kcal: 400, protein_g: 12.0, carbohydrate_g: 6.0, fat_g: 35.0, sugar_g: 0.5 },
  { recipe_name: 'Beef Ribeye with Spinach', description: 'Steak sapi bagian ribeye dipanggang mentega disajikan dengan bayam tumis.', instructions: 'Panggang steak sesuai kematangan. Tumis bayam dengan bawang putih.', cooking_time: 20, difficulty: 'Medium', servings: 1, calories_kcal: 550, protein_g: 42.0, carbohydrate_g: 2.0, fat_g: 42.0, sugar_g: 0.1 },
  { recipe_name: 'Baked Mackerel with Cauliflower Rice', description: 'Ikan kembung panggang bumbu ketumbar dengan nasi kembang kol.', instructions: 'Panggang ikan kembung. Parut dan tumis kembang kol sebagai pengganti nasi.', cooking_time: 30, difficulty: 'Medium', servings: 1, calories_kcal: 460, protein_g: 30.0, carbohydrate_g: 8.0, fat_g: 32.0, sugar_g: 0.5 },
  { recipe_name: 'Mixed Roasted Nuts', description: 'Campuran kacang almond, mete, dan walnut panggang tanpa gula tambahan.', instructions: 'Panggang kacang-kacangan di oven suhu 150C selama 10 menit.', cooking_time: 10, difficulty: 'Easy', servings: 1, calories_kcal: 190, protein_g: 6.0, carbohydrate_g: 5.0, fat_g: 16.0, sugar_g: 0.8 },

  // Rendah Gula B
  { recipe_name: 'Keto Egg Muffins', description: 'Muffin telur panggang isi keju cheddar dan jamur kancing.', instructions: 'Kocok telur, tuang ke cetakan muffin berisi jamur dan keju, panggang.', cooking_time: 25, difficulty: 'Easy', servings: 1, calories_kcal: 280, protein_g: 18.0, carbohydrate_g: 3.0, fat_g: 20.0, sugar_g: 0.2 },
  { recipe_name: 'Grilled Chicken Thighs with Cabbage Salad', description: 'Paha ayam panggang juicy dengan salad kubis ungu cuka apel.', instructions: 'Panggang paha ayam tanpa kulit. Sajikan dengan serutan kubis ungu.', cooking_time: 25, difficulty: 'Easy', servings: 1, calories_kcal: 490, protein_g: 35.0, carbohydrate_g: 5.0, fat_g: 35.0, sugar_g: 0.4 },
  { recipe_name: 'Stir-fried Beef with Broccoli (No Sugar)', description: 'Tumis sapi brokoli dengan saus tiram gurih bebas gula.', instructions: 'Tumis irisan daging sapi dan brokoli dengan sedikit kecap asin keto.', cooking_time: 18, difficulty: 'Medium', servings: 1, calories_kcal: 430, protein_g: 32.0, carbohydrate_g: 7.0, fat_g: 28.0, sugar_g: 0.3 },
  { recipe_name: 'Celery Sticks with Peanut Butter', description: 'Batang seledri besar renyah diisi dengan mentega kacang unsweetened.', instructions: 'Besihkan seledri, oleskan selai kacang murni di bagian tengahnya.', cooking_time: 5, difficulty: 'Easy', servings: 1, calories_kcal: 150, protein_g: 5.0, carbohydrate_g: 7.0, fat_g: 12.0, sugar_g: 1.0 },

  // Seimbang A
  { recipe_name: 'Whole Wheat Pancakes with Honey', description: 'Pancake gandum utuh lembut disajikan dengan madu murni.', instructions: 'Buat adonan pancake dari tepung gandum. Masak di pan, siram madu.', cooking_time: 15, difficulty: 'Easy', servings: 1, calories_kcal: 320, protein_g: 8.0, carbohydrate_g: 58.0, fat_g: 4.0, sugar_g: 10.0 },
  { recipe_name: 'Brown Rice with Tempe and Vegetables', description: 'Nasi merah sehat lengkap dengan tempe bacem dan tumis kangkung.', instructions: 'Sajikan nasi merah hangat dengan tempe panggang bacem dan kangkung.', cooking_time: 30, difficulty: 'Easy', servings: 1, calories_kcal: 410, protein_g: 18.0, carbohydrate_g: 55.0, fat_g: 12.0, sugar_g: 3.0 },
  { recipe_name: 'Chicken and Vegetable Pasta', description: 'Pasta gandum saus tomat marinara isi dada ayam dan wortel.', instructions: 'Rebus pasta. Tumis dada ayam dengan saus tomat lalu siram di atas pasta.', cooking_time: 25, difficulty: 'Medium', servings: 1, calories_kcal: 490, protein_g: 28.0, carbohydrate_g: 62.0, fat_g: 11.0, sugar_g: 4.0 },
  { recipe_name: 'Mixed Fruit Salad', description: 'Salad buah sehat (melon, pepaya, semangka) siram yogurt plain.', instructions: 'Potong dadu buah-buahan segar, siram dengan yogurt plain dingin.', cooking_time: 8, difficulty: 'Easy', servings: 1, calories_kcal: 120, protein_g: 1.0, carbohydrate_g: 28.0, fat_g: 0.5, sugar_g: 20.0 },

  // Seimbang B
  { recipe_name: 'Banana Oatmeal Smoothie', description: 'Smoothie pisang manis alami dipadukan dengan oat mengenyangkan.', instructions: 'Blender pisang, rolled oats, dan susu UHT full cream hingga halus.', cooking_time: 5, difficulty: 'Easy', servings: 1, calories_kcal: 290, protein_g: 10.0, carbohydrate_g: 48.0, fat_g: 5.0, sugar_g: 12.0 },
  { recipe_name: 'Quinoa Salad with Roasted Chickpeas', description: 'Salad biji quinoa sehat dengan kacang arab panggang gurih.', instructions: 'Campur quinoa matang dengan kacang arab panggang, tomat ceri, cuka lemon.', cooking_time: 25, difficulty: 'Medium', servings: 1, calories_kcal: 380, protein_g: 14.0, carbohydrate_g: 5.0, fat_g: 10.0, sugar_g: 2.0 },
  { recipe_name: 'Baked Potato with Tuna and Sweetcorn', description: 'Kentang panggang mentega isi tuna suwir gurih dan jagung manis pipil.', instructions: 'Panggang kentang utuh, belah tengah, masukkan adonan tuna jagung.', cooking_time: 40, difficulty: 'Medium', servings: 1, calories_kcal: 430, protein_g: 26.0, carbohydrate_g: 58.0, fat_g: 8.0, sugar_g: 5.0 },
  { recipe_name: 'Dark Chocolate and Strawberries', description: 'Camilan manis sehat cokelat hitam leleh dengan stroberi segar.', instructions: 'Celupkan buah stroberi ke dalam cokelat hitam leleh 70%. Dinginkan.', cooking_time: 10, difficulty: 'Easy', servings: 1, calories_kcal: 160, protein_g: 2.0, carbohydrate_g: 20.0, fat_g: 9.0, sugar_g: 11.0 }
];

const packagesWithRecipes = [
  {
    packageName: 'Kaya Protein A',
    meals: [
      { recipe_name: 'Protein Oatmeal', meal_time: 'Breakfast' },
      { recipe_name: 'Chicken Breast Salad', meal_time: 'Lunch' },
      { recipe_name: 'Grilled Salmon with Asparagus', meal_time: 'Dinner' },
      { recipe_name: 'Whey Protein Shake', meal_time: 'Snack' }
    ]
  },
  {
    packageName: 'Kaya Protein B',
    meals: [
      { recipe_name: 'Scrambled Egg Whites & Avocado Toast', meal_time: 'Breakfast' },
      { recipe_name: 'Tuna Salad Wrap', meal_time: 'Lunch' },
      { recipe_name: 'Turkey Meatballs with Zucchini Noodles', meal_time: 'Dinner' },
      { recipe_name: 'Greek Yogurt with Almonds', meal_time: 'Snack' }
    ]
  },
  {
    packageName: 'Rendah Kalori A',
    meals: [
      { recipe_name: 'Veggie Omelette', meal_time: 'Breakfast' },
      { recipe_name: 'Low Calorie Tofu Soup', meal_time: 'Lunch' },
      { recipe_name: 'Baked Cod with Steamed Broccoli', meal_time: 'Dinner' },
      { recipe_name: 'Apple Slices with Cinnamon', meal_time: 'Snack' }
    ]
  },
  {
    packageName: 'Rendah Kalori B',
    meals: [
      { recipe_name: 'Berry Chia Seed Pudding', meal_time: 'Breakfast' },
      { recipe_name: 'Shredded Chicken Veggie Bowl', meal_time: 'Lunch' },
      { recipe_name: 'Stir-Fry Garlic Shrimp and Mushrooms', meal_time: 'Dinner' },
      { recipe_name: 'Cucumber Slices with Hummus', meal_time: 'Snack' }
    ]
  },
  {
    packageName: 'Rendah Gula A',
    meals: [
      { recipe_name: 'Avocado and Bacon Salad', meal_time: 'Breakfast' },
      { recipe_name: 'Beef Ribeye with Spinach', meal_time: 'Lunch' },
      { recipe_name: 'Baked Mackerel with Cauliflower Rice', meal_time: 'Dinner' },
      { recipe_name: 'Mixed Roasted Nuts', meal_time: 'Snack' }
    ]
  },
  {
    packageName: 'Rendah Gula B',
    meals: [
      { recipe_name: 'Keto Egg Muffins', meal_time: 'Breakfast' },
      { recipe_name: 'Grilled Chicken Thighs with Cabbage Salad', meal_time: 'Lunch' },
      { recipe_name: 'Stir-fried Beef with Broccoli (No Sugar)', meal_time: 'Dinner' },
      { recipe_name: 'Celery Sticks with Peanut Butter', meal_time: 'Snack' }
    ]
  },
  {
    packageName: 'Seimbang A',
    meals: [
      { recipe_name: 'Whole Wheat Pancakes with Honey', meal_time: 'Breakfast' },
      { recipe_name: 'Brown Rice with Tempe and Vegetables', meal_time: 'Lunch' },
      { recipe_name: 'Chicken and Vegetable Pasta', meal_time: 'Dinner' },
      { recipe_name: 'Mixed Fruit Salad', meal_time: 'Snack' }
    ]
  },
  {
    packageName: 'Seimbang B',
    meals: [
      { recipe_name: 'Banana Oatmeal Smoothie', meal_time: 'Breakfast' },
      { recipe_name: 'Quinoa Salad with Roasted Chickpeas', meal_time: 'Lunch' },
      { recipe_name: 'Baked Potato with Tuna and Sweetcorn', meal_time: 'Dinner' },
      { recipe_name: 'Dark Chocolate and Strawberries', meal_time: 'Snack' }
    ]
  }
];

// Details of Unsplash Image, Ingredients and Steps for all 32 recipes
const recipeDetails = {
  'Protein Oatmeal': {
    image_url: 'https://images.unsplash.com/photo-1517881917430-e70dfb3610aa?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Rolled Oats', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 389, protein_g: 16.9, carbohydrate_g: 66.3, fat_g: 6.9, sugar_g: 0 },
      { product_name: 'Whey Protein Powder', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 380, protein_g: 80, carbohydrate_g: 5, fat_g: 3, sugar_g: 2 },
      { product_name: 'Pisang', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 89, protein_g: 1.1, carbohydrate_g: 22.8, fat_g: 0.3, sugar_g: 12.2 }
    ],
    steps: [
      'Didihkan 200ml air atau susu rendah lemak di panci.',
      'Masukkan rolled oats, masak dengan api kecil selama 5 menit hingga lunak.',
      'Matikan api, masukkan whey protein powder dan potongan pisang segar di atasnya.'
    ]
  },
  'Chicken Breast Salad': {
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Dada Ayam', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 165, protein_g: 31, carbohydrate_g: 0, fat_g: 3.6, sugar_g: 0 },
      { product_name: 'Selada', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 15, protein_g: 1.36, carbohydrate_g: 2.87, fat_g: 0.15, sugar_g: 0.78 },
      { product_name: 'Minyak Zaitun', quantity: 10, unit: 'gram', serving_size_g: 100, calories_kcal: 884, protein_g: 0, carbohydrate_g: 0, fat_g: 100, sugar_g: 0 }
    ],
    steps: [
      'Bumbui dada ayam dengan garam, merica, dan bawang putih bubuk.',
      'Panggang dada ayam di pan dengan sedikit minyak zaitun hingga matang.',
      'Iris dada ayam dan sajikan di atas mangkuk berisi selada segar.'
    ]
  },
  'Grilled Salmon with Asparagus': {
    image_url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Ikan Salmon', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 208, protein_g: 20, carbohydrate_g: 0, fat_g: 13, sugar_g: 0 },
      { product_name: 'Asparagus', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 20, protein_g: 2.2, carbohydrate_g: 3.88, fat_g: 0.12, sugar_g: 1.88 },
      { product_name: 'Mentega', quantity: 10, unit: 'gram', serving_size_g: 100, calories_kcal: 717, protein_g: 0.85, carbohydrate_g: 0.06, fat_g: 81, sugar_g: 0.06 }
    ],
    steps: [
      'Panaskan pan, lelehkan mentega dengan api sedang.',
      'Panggang salmon (sisi kulit terlebih dahulu) dan asparagus di sisinya selama 4-5 menit tiap sisi.',
      'Bumbui dengan perasan lemon, garam, dan lada hitam sebelum disajikan.'
    ]
  },
  'Whey Protein Shake': {
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Whey Protein Powder', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 380, protein_g: 80, carbohydrate_g: 5, fat_g: 3, sugar_g: 2 },
      { product_name: 'Susu Low Fat', quantity: 250, unit: 'ml', serving_size_g: 100, calories_kcal: 42, protein_g: 3.4, carbohydrate_g: 5, fat_g: 1, sugar_g: 5 },
      { product_name: 'Air Es', quantity: 100, unit: 'ml', serving_size_g: 100, calories_kcal: 0, protein_g: 0, carbohydrate_g: 0, fat_g: 0, sugar_g: 0 }
    ],
    steps: [
      'Siapkan shaker bersih, tuangkan air es dan susu low fat.',
      'Masukkan 1 scoop whey protein powder.',
      'Kocok dengan kuat selama 30 detik hingga larut rata tanpa gumpalan.'
    ]
  },
  'Scrambled Egg Whites & Avocado Toast': {
    image_url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Telur Ayam', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 155, protein_g: 12.6, carbohydrate_g: 1.1, fat_g: 10.6, sugar_g: 1.1 },
      { product_name: 'Roti Gandum', quantity: 60, unit: 'gram', serving_size_g: 100, calories_kcal: 247, protein_g: 13, carbohydrate_g: 41, fat_g: 3.4, sugar_g: 5.6 },
      { product_name: 'Alpukat', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 160, protein_g: 2, carbohydrate_g: 8.5, fat_g: 14.7, sugar_g: 0.7 }
    ],
    steps: [
      'Kocok putih telur, masak orak-arik (scrambled) di pan anti lengket.',
      'Panggang roti gandum hingga renyah kecokelatan.',
      'Haluskan alpukat, oleskan di atas roti panggang, dan sajikan dengan telur orak-arik.'
    ]
  },
  'Tuna Salad Wrap': {
    image_url: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Tuna Kaleng', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 116, protein_g: 26, carbohydrate_g: 0, fat_g: 1, sugar_g: 0 },
      { product_name: 'Tortila Gandum', quantity: 60, unit: 'gram', serving_size_g: 100, calories_kcal: 290, protein_g: 8, carbohydrate_g: 48, fat_g: 7, sugar_g: 2 },
      { product_name: 'Mayones Light', quantity: 15, unit: 'gram', serving_size_g: 100, calories_kcal: 300, protein_g: 0.5, carbohydrate_g: 10, fat_g: 30, sugar_g: 4 }
    ],
    steps: [
      'Tiriskan air dari tuna kaleng, lalu campur dengan mayones light di mangkuk.',
      'Hamparkan tortila gandum, letakkan campuran tuna di bagian tengah.',
      'Lipat kedua sisi tortila gandum dan gulung dengan rapat.'
    ]
  },
  'Turkey Meatballs with Zucchini Noodles': {
    image_url: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Daging Kalkun Giling', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 189, protein_g: 26, carbohydrate_g: 0, fat_g: 9, sugar_g: 0 },
      { product_name: 'Zucchini', quantity: 200, unit: 'gram', serving_size_g: 100, calories_kcal: 17, protein_g: 1.21, carbohydrate_g: 3.11, fat_g: 0.32, sugar_g: 2.5 },
      { product_name: 'Saus Tomat', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 40, protein_g: 1.5, carbohydrate_g: 8, fat_g: 0.5, sugar_g: 5 }
    ],
    steps: [
      'Bentuk daging kalkun giling menjadi bola-bola kecil, lalu panggang hingga matang.',
      'Serut zucchini menggunakan spiralizer menjadi bentuk mie (zoodles), kukus sebentar.',
      'Sajikan bakso kalkun di atas mie zucchini dan siram dengan saus tomat hangat.'
    ]
  },
  'Greek Yogurt with Almonds': {
    image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Greek Yogurt', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 97, protein_g: 9, carbohydrate_g: 3.6, fat_g: 5, sugar_g: 3.2 },
      { product_name: 'Kacang Almond', quantity: 20, unit: 'gram', serving_size_g: 100, calories_kcal: 579, protein_g: 21, carbohydrate_g: 22, fat_g: 49, sugar_g: 4.3 },
      { product_name: 'Madu', quantity: 10, unit: 'gram', serving_size_g: 100, calories_kcal: 304, protein_g: 0.3, carbohydrate_g: 82, fat_g: 0, sugar_g: 82 }
    ],
    steps: [
      'Tuangkan greek yogurt murni ke dalam mangkuk saji.',
      'Taburkan kacang almond panggang cincang di atasnya.',
      'Gerimiskan sedikit madu murni sebagai pemanis alami.'
    ]
  },
  'Veggie Omelette': {
    image_url: 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Telur Ayam', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 155, protein_g: 12.6, carbohydrate_g: 1.1, fat_g: 10.6, sugar_g: 1.1 },
      { product_name: 'Bayam', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 23, protein_g: 2.9, carbohydrate_g: 3.6, fat_g: 0.4, sugar_g: 0.4 },
      { product_name: 'Tomat', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 18, protein_g: 0.9, carbohydrate_g: 3.9, fat_g: 0.2, sugar_g: 2.6 }
    ],
    steps: [
      'Kocok telur ayam dengan sedikit garam dan merica hingga rata.',
      'Tumis irisan tomat dan bayam sebentar di pan anti lengket.',
      'Tuang kocokan telur, masak dengan api kecil hingga omelet matang di kedua sisi.'
    ]
  },
  'Low Calorie Tofu Soup': {
    image_url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Tahu Sutra', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 61, protein_g: 6.5, carbohydrate_g: 1.8, fat_g: 3.2, sugar_g: 0.5 },
      { product_name: 'Kaldu Jamur', quantity: 5, unit: 'gram', serving_size_g: 100, calories_kcal: 200, protein_g: 10, carbohydrate_g: 40, fat_g: 0, sugar_g: 5 },
      { product_name: 'Daun Bawang', quantity: 10, unit: 'gram', serving_size_g: 100, calories_kcal: 32, protein_g: 1.8, carbohydrate_g: 7.3, fat_g: 0.2, sugar_g: 2.3 }
    ],
    steps: [
      'Didihkan 300ml air, masukkan kaldu jamur bubuk bumbu sup.',
      'Potong dadu tahu sutra secara perlahan, lalu masukkan ke dalam kuah mendidih.',
      'Masak selama 5 menit, taburkan irisan daun bawang segar sebelum disajikan.'
    ]
  },
  'Baked Cod with Steamed Broccoli': {
    image_url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Ikan Kod', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 82, protein_g: 18, carbohydrate_g: 0, fat_g: 0.7, sugar_g: 0 },
      { product_name: 'Brokoli', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 34, protein_g: 2.8, carbohydrate_g: 6.6, fat_g: 0.4, sugar_g: 1.7 },
      { product_name: 'Lemon', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 29, protein_g: 1.1, carbohydrate_g: 9.3, fat_g: 0.3, sugar_g: 2.5 }
    ],
    steps: [
      'Bumbui fillet ikan kod dengan garam, lada, dan perasan air lemon.',
      'Panggang ikan kod dalam oven bersuhu 180 derajat Celsius selama 15-20 menit.',
      'Sajikan ikan kod panggang hangat bersama brokoli kukus.'
    ]
  },
  'Apple Slices with Cinnamon': {
    image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Apel', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 52, protein_g: 0.3, carbohydrate_g: 14, fat_g: 0.2, sugar_g: 10.4 },
      { product_name: 'Kayu Manis Bubuk', quantity: 2, unit: 'gram', serving_size_g: 100, calories_kcal: 247, protein_g: 4, carbohydrate_g: 81, fat_g: 1.2, sugar_g: 2.2 },
      { product_name: 'Madu', quantity: 5, unit: 'gram', serving_size_g: 100, calories_kcal: 304, protein_g: 0.3, carbohydrate_g: 82, fat_g: 0, sugar_g: 82 }
    ],
    steps: [
      'Cuci bersih apel, belah dan buang bijinya.',
      'Iris tipis buah apel secara merata.',
      'Susun irisan apel di piring, taburkan bubuk kayu manis dan sedikit madu.'
    ]
  },
  'Berry Chia Seed Pudding': {
    image_url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Biji Chia', quantity: 20, unit: 'gram', serving_size_g: 100, calories_kcal: 486, protein_g: 16.5, carbohydrate_g: 42.1, fat_g: 30.7, sugar_g: 0 },
      { product_name: 'Susu Almond', quantity: 150, unit: 'ml', serving_size_g: 100, calories_kcal: 15, protein_g: 0.6, carbohydrate_g: 0.6, fat_g: 1.1, sugar_g: 0 },
      { product_name: 'Stroberi', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 32, protein_g: 0.7, carbohydrate_g: 7.7, fat_g: 0.3, sugar_g: 4.9 }
    ],
    steps: [
      'Campur biji chia dengan susu almond dalam wadah tertutup.',
      'Aduk rata dan simpan di lemari es minimal 4 jam atau semalaman.',
      'Sajikan puding chia dingin dengan topping irisan buah beri segar.'
    ]
  },
  'Shredded Chicken Veggie Bowl': {
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Dada Ayam', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 165, protein_g: 31, carbohydrate_g: 0, fat_g: 3.6, sugar_g: 0 },
      { product_name: 'Kembang Kol', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 25, protein_g: 1.9, carbohydrate_g: 5, fat_g: 0.3, sugar_g: 1.9 },
      { product_name: 'Wortel', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 41, protein_g: 0.9, carbohydrate_g: 9.6, fat_g: 0.2, sugar_g: 4.7 }
    ],
    steps: [
      'Rebus dada ayam hingga matang lalu suwir-suwir tipis.',
      'Kukus kembang kol dan wortel yang sudah dipotong kecil.',
      'Susun kembang kol, wortel, dan dada ayam suwir di dalam mangkuk saji.'
    ]
  },
  'Stir-Fry Garlic Shrimp and Mushrooms': {
    image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Udang', quantity: 120, unit: 'gram', serving_size_g: 100, calories_kcal: 99, protein_g: 24, carbohydrate_g: 0.2, fat_g: 0.3, sugar_g: 0 },
      { product_name: 'Jamur Kuping', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 25, protein_g: 2, carbohydrate_g: 7, fat_g: 0.2, sugar_g: 0 },
      { product_name: 'Minyak Wijen', quantity: 5, unit: 'gram', serving_size_g: 100, calories_kcal: 884, protein_g: 0, carbohydrate_g: 0, fat_g: 100, sugar_g: 0 }
    ],
    steps: [
      'Tumis bawang putih cincang dengan sedikit minyak wijen hingga harum.',
      'Masukkan udang kupas dan jamur kuping, tumis cepat dengan api besar.',
      'Tambahkan sedikit kecap asin rendah natrium, angkat setelah udang berubah warna merah muda.'
    ]
  },
  'Cucumber Slices with Hummus': {
    image_url: 'https://images.unsplash.com/photo-1538068324048-776343f497a9?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Timun', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 15, protein_g: 0.65, carbohydrate_g: 3.63, fat_g: 0.11, sugar_g: 1.67 },
      { product_name: 'Hummus', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 166, protein_g: 7.9, carbohydrate_g: 14.3, fat_g: 9.6, sugar_g: 0.3 },
      { product_name: 'Minyak Zaitun', quantity: 5, unit: 'gram', serving_size_g: 100, calories_kcal: 884, protein_g: 0, carbohydrate_g: 0, fat_g: 100, sugar_g: 0 }
    ],
    steps: [
      'Cuci bersih mentimun segar, lalu iris bulat tipis-tipis.',
      'Tuang hummus siap saji ke piring saji kecil.',
      'Gerimiskan sedikit minyak zaitun di atas hummus, sajikan sebagai cocolan mentimun.'
    ]
  },
  'Avocado and Bacon Salad': {
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Alpukat', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 160, protein_g: 2, carbohydrate_g: 8.5, fat_g: 14.7, sugar_g: 0.7 },
      { product_name: 'Beef Bacon', quantity: 40, unit: 'gram', serving_size_g: 100, calories_kcal: 541, protein_g: 37, carbohydrate_g: 1.4, fat_g: 42, sugar_g: 0 },
      { product_name: 'Selada', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 15, protein_g: 1.36, carbohydrate_g: 2.87, fat_g: 0.15, sugar_g: 0.78 }
    ],
    steps: [
      'Panggang bacon sapi di wajan hingga garing kecokelatan tanpa tambahan minyak.',
      'Potong dadu alpukat matang.',
      'Campur alpukat and bacon garing di atas piring selada segar.'
    ]
  },
  'Beef Ribeye with Spinach': {
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Daging Sapi Ribeye', quantity: 180, unit: 'gram', serving_size_g: 100, calories_kcal: 291, protein_g: 24, carbohydrate_g: 0, fat_g: 22, sugar_g: 0 },
      { product_name: 'Bayam', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 23, protein_g: 2.9, carbohydrate_g: 3.6, fat_g: 0.4, sugar_g: 0.4 },
      { product_name: 'Mentega', quantity: 10, unit: 'gram', serving_size_g: 100, calories_kcal: 717, protein_g: 0.85, carbohydrate_g: 0.06, fat_g: 81, sugar_g: 0.06 }
    ],
    steps: [
      'Bumbui steak ribeye dengan garam kasar and lada hitam tumbuk.',
      'Panggang steak di wajan panas dengan mentega selama 3 menit tiap sisi (medium-rare).',
      'Tiriskan steak, gunakan sisa lemak daging untuk menumis cepat daun bayam.'
    ]
  },
  'Baked Mackerel with Cauliflower Rice': {
    image_url: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Ikan Kembung', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 205, protein_g: 19, carbohydrate_g: 0, fat_g: 14, sugar_g: 0 },
      { product_name: 'Kembang Kol', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 25, protein_g: 1.9, carbohydrate_g: 5, fat_g: 0.3, sugar_g: 1.9 },
      { product_name: 'Minyak Kelapa', quantity: 5, unit: 'gram', serving_size_g: 100, calories_kcal: 862, protein_g: 0, carbohydrate_g: 0, fat_g: 100, sugar_g: 0 }
    ],
    steps: [
      'Bumbui ikan kembung dengan ketumbar dan kunyit bubuk, lalu panggang hingga matang.',
      'Parut kembang kol kasar menggunakan parutan keju hingga berbentuk seperti bulir nasi.',
      'Tumis nasi kembang kol di wajan dengan minyak kelapa selama 5 menit hingga layu.'
    ]
  },
  'Mixed Roasted Nuts': {
    image_url: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Kacang Mete', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 553, protein_g: 18, carbohydrate_g: 30, fat_g: 44, sugar_g: 5.9 },
      { product_name: 'Kacang Almond', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 579, protein_g: 21, carbohydrate_g: 22, fat_g: 49, sugar_g: 4.3 },
      { product_name: 'Kacang Walnut', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 654, protein_g: 15, carbohydrate_g: 14, fat_g: 65, sugar_g: 2.6 }
    ],
    steps: [
      'Campurkan kacang almond, mete, dan walnut di atas loyang panggang.',
      'Panggang dalam oven pada suhu 160 derajat Celsius selama 10 menit.',
      'Angkat, dinginkan sejenak hingga renyah sebelum dikonsumsi.'
    ]
  },
  'Keto Egg Muffins': {
    image_url: 'https://images.unsplash.com/photo-1524351199679-46cddf530c04?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Telur Ayam', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 155, protein_g: 12.6, carbohydrate_g: 1.1, fat_g: 10.6, sugar_g: 1.1 },
      { product_name: 'Keju Cheddar', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 403, protein_g: 25, carbohydrate_g: 1.3, fat_g: 33, sugar_g: 0.5 },
      { product_name: 'Jamur Kancing', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 22, protein_g: 3.1, carbohydrate_g: 3.3, fat_g: 0.3, sugar_g: 1.2 }
    ],
    steps: [
      'Kocok telur ayam dengan garam dan merica bubuk.',
      'Siapkan cetakan muffin, isi dengan irisan jamur dan parutan keju cheddar.',
      'Tuang kocokan telur ke cetakan, panggang selama 20 menit hingga mengembang.'
    ]
  },
  'Grilled Chicken Thighs with Cabbage Salad': {
    image_url: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Paha Ayam', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 232, protein_g: 26, carbohydrate_g: 0, fat_g: 15, sugar_g: 0 },
      { product_name: 'Kubis Ungu', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 31, protein_g: 1.4, carbohydrate_g: 7, fat_g: 0.2, sugar_g: 3.8 },
      { product_name: 'Cuka Apel', quantity: 10, unit: 'gram', serving_size_g: 100, calories_kcal: 21, protein_g: 0, carbohydrate_g: 0.9, fat_g: 0, sugar_g: 0.4 }
    ],
    steps: [
      'Bumbui paha ayam tanpa kulit dengan bawang putih halus dan panggang hingga matang.',
      'Iris tipis kubis ungu dan rendam dengan sedikit cuka apel dan garam.',
      'Sajikan paha ayam panggang juicy hangat bersama salad kubis ungu segar.'
    ]
  },
  'Stir-fried Beef with Broccoli (No Sugar)': {
    image_url: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Daging Sapi', quantity: 150, unit: 'gram', serving_size_g: 100, calories_kcal: 250, protein_g: 26, carbohydrate_g: 0, fat_g: 17, sugar_g: 0 },
      { product_name: 'Brokoli', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 34, protein_g: 2.8, carbohydrate_g: 6.6, fat_g: 0.4, sugar_g: 1.7 },
      { product_name: 'Kecap Asin', quantity: 15, unit: 'gram', serving_size_g: 100, calories_kcal: 53, protein_g: 5.5, carbohydrate_g: 4.9, fat_g: 0.6, sugar_g: 0.4 }
    ],
    steps: [
      'Iris tipis daging sapi berlawanan serat agar empuk.',
      'Tumis bawang bombay dan brokoli di wajan panas.',
      'Masukkan daging sapi dan kecap asin bebas gula, tumis dengan cepat hingga matang.'
    ]
  },
  'Celery Sticks with Peanut Butter': {
    image_url: 'https://images.unsplash.com/photo-1566478989037-eec170784d20?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Seledri', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 16, protein_g: 0.7, carbohydrate_g: 3, fat_g: 0.2, sugar_g: 1.8 },
      { product_name: 'Selai Kacang', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 588, protein_g: 25, carbohydrate_g: 20, fat_g: 50, sugar_g: 9 },
      { product_name: 'Garam', quantity: 1, unit: 'gram', serving_size_g: 100, calories_kcal: 0, protein_g: 0, carbohydrate_g: 0, fat_g: 0, sugar_g: 0 }
    ],
    steps: [
      'Potong batang seledri besar (celery sticks) sepanjang 10 cm.',
      'Oleskan selai kacang murni tanpa gula di bagian lekukan seledri.',
      'Taburkan sedikit garam kasar di atasnya, siap dinikmati.'
    ]
  },
  'Whole Wheat Pancakes with Honey': {
    image_url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Tepung Gandum', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 339, protein_g: 13.7, carbohydrate_g: 72.6, fat_g: 1.9, sugar_g: 0.4 },
      { product_name: 'Susu Low Fat', quantity: 100, unit: 'ml', serving_size_g: 100, calories_kcal: 42, protein_g: 3.4, carbohydrate_g: 5, fat_g: 1, sugar_g: 5 },
      { product_name: 'Madu', quantity: 20, unit: 'gram', serving_size_g: 100, calories_kcal: 304, protein_g: 0.3, carbohydrate_g: 82, fat_g: 0, sugar_g: 82 }
    ],
    steps: [
      'Aduk rata tepung gandum, susu rendah lemak, dan satu butir telur menjadi adonan kental.',
      'Tuang adonan di wajan datar anti lengket dengan api kecil hingga muncul gelembung.',
      'Balik pancake, masak hingga kecokelatan, sajikan dengan siraman madu murni.'
    ]
  },
  'Brown Rice with Tempe and Vegetables': {
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Beras Merah', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 111, protein_g: 2.3, carbohydrate_g: 23, fat_g: 0.9, sugar_g: 0.4 },
      { product_name: 'Tempe', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 193, protein_g: 18.5, carbohydrate_g: 9.4, fat_g: 10.8, sugar_g: 0 },
      { product_name: 'Kangkung', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 19, protein_g: 2.6, carbohydrate_g: 3.1, fat_g: 0.2, sugar_g: 0.2 }
    ],
    steps: [
      'Masak beras merah hingga menjadi nasi merah pulen.',
      'Potong tempe, marinasi dengan ketumbar dan garam, panggang di wajan datar.',
      'Tumis kangkung dengan sedikit bawang putih dan cabai merah.'
    ]
  },
  'Chicken and Vegetable Pasta': {
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Pasta Gandum', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 348, protein_g: 14.6, carbohydrate_g: 75, fat_g: 1.5, sugar_g: 0 },
      { product_name: 'Dada Ayam', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 165, protein_g: 31, carbohydrate_g: 0, fat_g: 3.6, sugar_g: 0 },
      { product_name: 'Saus Tomat', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 40, protein_g: 1.5, carbohydrate_g: 8, fat_g: 0.5, sugar_g: 5 }
    ],
    steps: [
      'Rebus pasta gandum dalam air mendidih bergaram hingga al dente.',
      'Tumis dada ayam potong dadu di teflon, lalu tuangkan saus marinara tomat.',
      'Tiriskan pasta, masukkan ke dalam wajan saus ayam, aduk rata.'
    ]
  },
  'Mixed Fruit Salad': {
    image_url: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Melon', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 34, protein_g: 0.8, carbohydrate_g: 8.2, fat_g: 0.2, sugar_g: 7.9 },
      { product_name: 'Pepaya', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 43, protein_g: 0.5, carbohydrate_g: 10.8, fat_g: 0.3, sugar_g: 7.8 },
      { product_name: 'Semangka', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 30, protein_g: 0.6, carbohydrate_g: 7.6, fat_g: 0.2, sugar_g: 6.2 }
    ],
    steps: [
      'Kupas kulit melon, pepaya, dan semangka, buang bijinya.',
      'Potong dadu buah-buahan tersebut seukuran satu suapan.',
      'Campurkan buah-buahan di mangkuk, siram dengan yogurt rendah lemak dingin.'
    ]
  },
  'Banana Oatmeal Smoothie': {
    image_url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Pisang', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 89, protein_g: 1.1, carbohydrate_g: 22.8, fat_g: 0.3, sugar_g: 12.2 },
      { product_name: 'Rolled Oats', quantity: 30, unit: 'gram', serving_size_g: 100, calories_kcal: 389, protein_g: 16.9, carbohydrate_g: 66.3, fat_g: 6.9, sugar_g: 0 },
      { product_name: 'Susu UHT', quantity: 200, unit: 'ml', serving_size_g: 100, calories_kcal: 64, protein_g: 3.2, carbohydrate_g: 4.7, fat_g: 3.7, sugar_g: 4.7 }
    ],
    steps: [
      'Masukkan rolled oats kering ke dalam blender, haluskan terlebih dahulu.',
      'Tambahkan potongan buah pisang matang dan tuangkan susu UHT full cream.',
      'Blender dengan kecepatan tinggi hingga tekstur smoothie mengental halus.'
    ]
  },
  'Quinoa Salad with Roasted Chickpeas': {
    image_url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Quinoa', quantity: 60, unit: 'gram', serving_size_g: 100, calories_kcal: 368, protein_g: 14.1, carbohydrate_g: 64.2, fat_g: 6.1, sugar_g: 0 },
      { product_name: 'Kacang Arab', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 364, protein_g: 19, carbohydrate_g: 61, fat_g: 6, sugar_g: 11 },
      { product_name: 'Tomat Ceri', quantity: 50, unit: 'gram', serving_size_g: 100, calories_kcal: 18, protein_g: 0.9, carbohydrate_g: 3.9, fat_g: 0.2, sugar_g: 2.6 }
    ],
    steps: [
      'Rebus quinoa dengan air garam perbandingan 1:2 selama 15 menit hingga mekar.',
      'Panggang kacang arab (chickpeas) dengan olive oil dan bubuk paprika di oven.',
      'Campur quinoa dingin, kacang arab renyah, dan belahan tomat ceri dalam mangkuk salad.'
    ]
  },
  'Baked Potato with Tuna and Sweetcorn': {
    image_url: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Kentang', quantity: 200, unit: 'gram', serving_size_g: 100, calories_kcal: 77, protein_g: 2, carbohydrate_g: 17, fat_g: 0.1, sugar_g: 0.8 },
      { product_name: 'Tuna Kaleng', quantity: 80, unit: 'gram', serving_size_g: 100, calories_kcal: 116, protein_g: 26, carbohydrate_g: 0, fat_g: 1, sugar_g: 0 },
      { product_name: 'Jagung Manis', quantity: 40, unit: 'gram', serving_size_g: 100, calories_kcal: 86, protein_g: 3.2, carbohydrate_g: 19, fat_g: 1.2, sugar_g: 6.2 }
    ],
    steps: [
      'Cuci kentang, tusuk-tusuk dengan garpu, lalu panggang utuh dalam oven suhu 200C selama 40 menit.',
      'Campurkan tuna suwir matang dan jagung manis pipil rebus.',
      'Belah dua kentang panggang hangat di tengahnya, masukkan isian tuna jagung.'
    ]
  },
  'Dark Chocolate and Strawberries': {
    image_url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=600&auto=format&fit=crop',
    ingredients: [
      { product_name: 'Cokelat Hitam', quantity: 40, unit: 'gram', serving_size_g: 100, calories_kcal: 546, protein_g: 4.9, carbohydrate_g: 61, fat_g: 31, sugar_g: 48 },
      { product_name: 'Stroberi', quantity: 100, unit: 'gram', serving_size_g: 100, calories_kcal: 32, protein_g: 0.7, carbohydrate_g: 7.7, fat_g: 0.3, sugar_g: 4.9 },
      { product_name: 'Madu', quantity: 5, unit: 'gram', serving_size_g: 100, calories_kcal: 304, protein_g: 0.3, carbohydrate_g: 82, fat_g: 0, sugar_g: 82 }
    ],
    steps: [
      'Cuci bersih stroberi utuh beserta daunnya, keringkan dengan tisu.',
      'Tim/lelehkan cokelat hitam 70% di atas panci berisi air hangat.',
      'Celupkan setengah bagian stroberi ke cokelat leleh, susun di kertas roti, dinginkan.'
    ]
  }
};

async function seed() {
  try {
    console.log('--- START SEEDING SPRINT 2B (SAFE BACKFILL EDITION) ---');

    // 1. Seed Focus Categories
    const focusIdMap = {};
    for (const f of focusData) {
      const { data: existing } = await supabaseAdmin
        .from('focus_categories')
        .select('focus_id')
        .eq('focus_name', f.focus_name)
        .maybeSingle();

      if (existing) {
        console.log(`Focus Category "${f.focus_name}" already exists.`);
        focusIdMap[f.focus_name] = existing.focus_id;
      } else {
        const { data: inserted, error } = await supabaseAdmin
          .from('focus_categories')
          .insert(f)
          .select()
          .single();

        if (error) throw error;
        console.log(`Inserted Focus Category "${f.focus_name}"`);
        focusIdMap[f.focus_name] = inserted.focus_id;
      }
    }

    // 2. Seed Meal Packages
    const packageIdMap = {};
    for (const p of packageNames) {
      const focusId = focusIdMap[p.focus];
      if (!focusId) {
        console.error(`Focus ID not found for ${p.focus}`);
        continue;
      }

      const { data: existing } = await supabaseAdmin
        .from('meal_packages')
        .select('package_id')
        .eq('package_name', p.name)
        .maybeSingle();

      if (existing) {
        console.log(`Meal Package "${p.name}" already exists.`);
        packageIdMap[p.name] = existing.package_id;
        // Ensure metadata is updated
        await supabaseAdmin
          .from('meal_packages')
          .update({ 
            focus_id: focusId, 
            description: p.description,
            estimated_calories: p.estimated_calories,
            image_url: p.image_url,
            is_active: p.is_active
          })
          .eq('package_id', existing.package_id);
      } else {
        // Ambil category_id dari meal_categories lama agar mematuhi NOT NULL constraint yang belum di-drop
        const { data: mealCat } = await supabaseAdmin
          .from('meal_categories')
          .select('category_id')
          .eq('category_name', 'Lunch') // Dummy fallback category
          .maybeSingle();

        const catId = mealCat ? mealCat.category_id : null;

        const payload = {
          package_name: p.name,
          description: p.description,
          focus_id: focusId,
          estimated_calories: p.estimated_calories,
          image_url: p.image_url,
          is_active: p.is_active
        };
        if (catId) {
          payload.category_id = catId;
        }

        const { data: inserted, error } = await supabaseAdmin
          .from('meal_packages')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        console.log(`Inserted Meal Package "${p.name}"`);
        packageIdMap[p.name] = inserted.package_id;
      }
    }

    // 3. Seed/Verify 32 Recipes (Safe Backfill)
    const recipeIdMap = {};
    for (const r of defaultRecipes) {
      const { data: existing } = await supabaseAdmin
        .from('recipes')
        .select('recipe_id, image_url')
        .eq('recipe_name', r.recipe_name)
        .maybeSingle();

      let recipeId = '';
      const details = recipeDetails[r.recipe_name];

      if (existing) {
        console.log(`Recipe "${r.recipe_name}" already exists.`);
        recipeId = existing.recipe_id;
        recipeIdMap[r.recipe_name] = recipeId;

        // Phase 1: Update image_url if empty or null
        const imageUrl = details ? details.image_url : null;
        if (imageUrl) {
          await supabaseAdmin
            .from('recipes')
            .update({ image_url: imageUrl })
            .eq('recipe_id', recipeId);
          console.log(`Updated image_url for recipe "${r.recipe_name}"`);
        }
      } else {
        const insertPayload = { ...r };
        if (details && details.image_url) {
          insertPayload.image_url = details.image_url;
        }
        const { data: inserted, error } = await supabaseAdmin
          .from('recipes')
          .insert(insertPayload)
          .select()
          .single();

        if (error) throw error;
        console.log(`Inserted Recipe "${r.recipe_name}"`);
        recipeId = inserted.recipe_id;
        recipeIdMap[r.recipe_name] = recipeId;
      }

      // Phase 2: Ingredients Backfill
      if (details && details.ingredients) {
        for (const ing of details.ingredients) {
          // Find or create food product
          let { data: prod } = await supabaseAdmin
            .from('food_products')
            .select('product_id')
            .eq('product_name', ing.product_name)
            .maybeSingle();

          let productId = '';
          if (prod) {
            productId = prod.product_id;
          } else {
            // Find food category 'Lainnya' or any fallback
            const { data: foodCat } = await supabaseAdmin
              .from('food_category')
              .select('category_id')
              .eq('name', 'Lainnya')
              .maybeSingle();
            
            const catId = foodCat ? foodCat.category_id : null;

            const { data: newProd, error: prodErr } = await supabaseAdmin
              .from('food_products')
              .insert({
                product_name: ing.product_name,
                category_id: catId,
                serving_size_g: ing.serving_size_g,
                calories_kcal: ing.calories_kcal,
                protein_g: ing.protein_g,
                carbohydrate_g: ing.carbohydrate_g,
                fat_g: ing.fat_g,
                sugar_g: ing.sugar_g
              })
              .select()
              .single();

            if (prodErr) {
              console.error(`Error inserting food product "${ing.product_name}":`, prodErr.message);
              continue;
            }
            productId = newProd.product_id;
            console.log(`Created new food product: "${ing.product_name}"`);
          }

          // Check if relation already exists in bahan_resep
          const { data: existingBahan } = await supabaseAdmin
            .from('bahan_resep')
            .select('bahan_id')
            .eq('recipe_id', recipeId)
            .eq('product_id', productId)
            .maybeSingle();

          if (!existingBahan) {
            const { error: bahanErr } = await supabaseAdmin
              .from('bahan_resep')
              .insert({
                recipe_id: recipeId,
                product_id: productId,
                quantity: ing.quantity,
                unit: ing.unit
              });
            if (bahanErr) {
              console.error(`Error inserting ingredients for "${r.recipe_name}":`, bahanErr.message);
            } else {
              console.log(`Added ingredient "${ing.product_name}" to recipe "${r.recipe_name}"`);
            }
          }
        }
      }

      // Phase 3: Steps Backfill
      if (details && details.steps) {
        for (let i = 0; i < details.steps.length; i++) {
          const stepNum = i + 1;
          const instructionText = details.steps[i];

          const { data: existingStep } = await supabaseAdmin
            .from('recipe_steps')
            .select('step_id')
            .eq('recipe_id', recipeId)
            .eq('step_number', stepNum)
            .maybeSingle();

          if (!existingStep) {
            const { error: stepErr } = await supabaseAdmin
              .from('recipe_steps')
              .insert({
                recipe_id: recipeId,
                step_number: stepNum,
                instruction: instructionText
              });
            if (stepErr) {
              console.error(`Error inserting step ${stepNum} for "${r.recipe_name}":`, stepErr.message);
            } else {
              console.log(`Added step ${stepNum} to recipe "${r.recipe_name}"`);
            }
          }
        }
      }

      // Phase 4: Recalculate nutrition
      try {
        await calculateNutrition(recipeId);
        console.log(`Recalculated nutrition for recipe "${r.recipe_name}"`);
      } catch (calcErr) {
        console.error(`Error recalculating nutrition for "${r.recipe_name}":`, calcErr.message);
      }
    }

    // 4. Seed Meal Package Items (Junction Table Many-to-Many)
    for (const p of packagesWithRecipes) {
      const pkgId = packageIdMap[p.packageName];
      if (!pkgId) {
        console.error(`Package ID not found for: ${p.packageName}`);
        continue;
      }

      for (const meal of p.meals) {
        const recipeId = recipeIdMap[meal.recipe_name];
        if (!recipeId) {
          console.error(`Recipe ID not found for: ${meal.recipe_name}`);
          continue;
        }

        const { data: existing } = await supabaseAdmin
          .from('meal_package_items')
          .select('package_item_id')
          .eq('package_id', pkgId)
          .eq('recipe_id', recipeId)
          .eq('meal_time', meal.meal_time)
          .maybeSingle();

        if (existing) {
          console.log(`Junction for Package "${p.packageName}" - Recipe "${meal.recipe_name}" at "${meal.meal_time}" already exists.`);
        } else {
          const { error } = await supabaseAdmin
            .from('meal_package_items')
            .insert({
              package_id: pkgId,
              recipe_id: recipeId,
              meal_time: meal.meal_time
            });

          if (error) {
            console.error(`Error inserting junction for ${p.packageName} - ${meal.recipe_name} (${meal.meal_time}):`, error.message);
          } else {
            console.log(`Mapped Package "${p.packageName}" -> Recipe "${meal.recipe_name}" for "${meal.meal_time}"`);
          }
        }
      }
    }

    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
