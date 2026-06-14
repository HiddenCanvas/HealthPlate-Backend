const srv = require('../services/log.service');

const getAllLogs = async (req, res, next) => {
  try {
    const data = await srv.getAllLogs(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getLogByDate = async (req, res, next) => {
  try {
    const data = await srv.getLogByDate(req.user.id, req.params.date);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const addEntry = async (req, res, next) => {
  try {
    const data = await srv.addEntry(req.user.id, req.params.date, req.body);
    return res.status(201).json({ success: true, message: 'Entry berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

const addCustomEntry = async (req, res, next) => {
  try {
    const data = await srv.addCustomEntry(req.user.id, req.params.date, req.body);
    return res.status(201).json({ success: true, message: 'Entry custom berhasil ditambahkan.', data });
  } catch (err) { next(err); }
};

const deleteEntry = async (req, res, next) => {
  try {
    await srv.deleteEntry(req.user.id, req.params.date, req.params.entryId);
    return res.status(200).json({ success: true, message: 'Entry berhasil dihapus.' });
  } catch (err) { next(err); }
};

const updateWater = async (req, res, next) => {
  try {
    const data = await srv.updateWater(req.user.id, req.params.date, req.body.total_water_ml);
    return res.status(200).json({ success: true, message: 'Air minum berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const consumeRecipe = async (req, res, next) => {
  try {
    const data = await srv.consumeRecipe(req.user.id, req.params.date, req.body);
    return res.status(201).json({
      success: true,
      message: 'Recipe consumption recorded.',
      data
    });
  } catch (err) { next(err); }
};

const addAiFoodEntry = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'image wajib diunggah.' });
    }

    const { food_name, meal_time } = req.body;
    
    if (!food_name || typeof food_name !== 'string' || !food_name.trim()) {
      return res.status(400).json({ success: false, message: 'food_name wajib diisi.' });
    }
    if (!meal_time) {
      return res.status(400).json({ success: false, message: 'meal_time wajib diisi.' });
    }
    const MEAL_TIMES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    if (!MEAL_TIMES.includes(meal_time)) {
      return res.status(400).json({ success: false, message: 'meal_time harus salah satu dari Breakfast, Lunch, Dinner, atau Snack.' });
    }
    
    const parsedCalories = req.body.calories_kcal !== undefined && req.body.calories_kcal !== '' ? Number(req.body.calories_kcal) : undefined;
    const parsedProtein = req.body.protein_g !== undefined && req.body.protein_g !== '' ? Number(req.body.protein_g) : undefined;
    const parsedCarbs = req.body.carbohydrate_g !== undefined && req.body.carbohydrate_g !== '' ? Number(req.body.carbohydrate_g) : undefined;
    const parsedFat = req.body.fat_g !== undefined && req.body.fat_g !== '' ? Number(req.body.fat_g) : undefined;
    const parsedSugar = req.body.sugar_g !== undefined && req.body.sugar_g !== '' ? Number(req.body.sugar_g) : undefined;
    
    const nutrients = { calories_kcal: parsedCalories, protein_g: parsedProtein, carbohydrate_g: parsedCarbs, fat_g: parsedFat, sugar_g: parsedSugar };
    for (const [key, value] of Object.entries(nutrients)) {
      if (value !== undefined && value !== null && (typeof value !== 'number' || isNaN(value) || value < 0)) {
        return res.status(400).json({ success: false, message: `${key} harus berupa angka lebih besar atau sama dengan 0.` });
      }
    }

    const uploadService = require('../services/upload.service');
    const { publicUrl, storagePath } = await uploadService.uploadAiFoodImage(req.file, req.user.id, req.params.date);
    
    const servicePayload = {
      food_name: food_name.trim(),
      quantity: req.body.quantity !== undefined && req.body.quantity !== '' ? Number(req.body.quantity) : undefined,
      unit: req.body.unit,
      estimated_serving_g: req.body.estimated_serving_g !== undefined && req.body.estimated_serving_g !== '' ? Number(req.body.estimated_serving_g) : undefined,
      calories_kcal: parsedCalories,
      protein_g: parsedProtein,
      carbohydrate_g: parsedCarbs,
      fat_g: parsedFat,
      sugar_g: parsedSugar,
      confidence: req.body.confidence !== undefined && req.body.confidence !== '' ? Number(req.body.confidence) : undefined,
      reasoning: req.body.reasoning,
      meal_time,
      image_url: publicUrl,
      ai_image_path: storagePath
    };
    
    const data = await srv.addAiFoodEntry(req.user.id, req.params.date, servicePayload);
    return res.status(201).json({
      success: true,
      message: 'AI food entry created.',
      data: {
        entry_id: data.entry_id,
        food_name: data.food_name,
        image_url: publicUrl
      }
    });
  } catch (err) { next(err); }
};

module.exports = { getAllLogs, getLogByDate, addEntry, addCustomEntry, deleteEntry, updateWater, consumeRecipe, addAiFoodEntry };
