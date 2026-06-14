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
    const { food_name, calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g, meal_time } = req.body;
    
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
    
    const nutrients = { calories_kcal, protein_g, carbohydrate_g, fat_g, sugar_g };
    for (const [key, value] of Object.entries(nutrients)) {
      if (value !== undefined && value !== null && (typeof value !== 'number' || value < 0)) {
        return res.status(400).json({ success: false, message: `${key} harus berupa angka lebih besar atau sama dengan 0.` });
      }
    }
    
    const data = await srv.addAiFoodEntry(req.user.id, req.params.date, req.body);
    return res.status(201).json({
      success: true,
      message: 'AI food entry created.',
      data
    });
  } catch (err) { next(err); }
};

module.exports = { getAllLogs, getLogByDate, addEntry, addCustomEntry, deleteEntry, updateWater, consumeRecipe, addAiFoodEntry };
