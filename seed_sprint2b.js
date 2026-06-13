const { supabaseAdmin } = require('./src/config/supabase');

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

// 16 Resep Realistis (4 resep per paket, paket A & B berbeda sepenuhnya)
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

// Pemetaan eksplisit menu per paket (menjamin paket A dan B dalam fokus yang sama memiliki resep berbeda)
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

async function seed() {
  try {
    console.log('--- START SEEDING SPRINT 2B (SAFE REVISION - 16 RECIPES WITH METADATA) ---');

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

    // 3. Seed/Verify 16 Recipes
    const recipeIdMap = {};
    for (const r of defaultRecipes) {
      const { data: existing } = await supabaseAdmin
        .from('recipes')
        .select('recipe_id')
        .eq('recipe_name', r.recipe_name)
        .maybeSingle();

      if (existing) {
        console.log(`Recipe "${r.recipe_name}" already exists.`);
        recipeIdMap[r.recipe_name] = existing.recipe_id;
      } else {
        const { data: inserted, error } = await supabaseAdmin
          .from('recipes')
          .insert(r)
          .select()
          .single();

        if (error) throw error;
        console.log(`Inserted Recipe "${r.recipe_name}"`);
        recipeIdMap[r.recipe_name] = inserted.recipe_id;
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
