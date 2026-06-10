const { supabaseAdmin } = require('../config/supabase');

const DEFAULT_SETTINGS = [
  { type: 'breakfast', hour: 6,  minute: 15, custom_message: 'Jangan lupa sarapan untuk memulai hari dengan energi penuh!' },
  { type: 'lunch',     hour: 12, minute: 0,  custom_message: 'Sudah waktunya makan siang, jaga nutrisi harianmu!' },
  { type: 'dinner',    hour: 18, minute: 30, custom_message: 'Waktunya makan malam, catat makananmu di HealthPlate!' },
  { type: 'water',     hour: 8,  minute: 0,  custom_message: 'Jangan lupa minum air putih hari ini!' },
];

// Ambil semua settings milik user, auto-insert default kalau belum ada
const getSettings = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .order('type');

  if (error) throw { statusCode: 400, message: error.message };

  // Kalau belum ada settings sama sekali, insert default dulu
  if (!data || data.length === 0) {
    const inserts = DEFAULT_SETTINGS.map(s => ({ ...s, user_id: userId }));
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('notification_settings')
      .insert(inserts)
      .select();
    if (insertError) throw { statusCode: 400, message: insertError.message };
    return inserted;
  }

  return data;
};

// Update satu setting berdasarkan type
const updateSetting = async (userId, type, body) => {
  const validTypes = ['breakfast', 'lunch', 'dinner', 'water'];
  if (!validTypes.includes(type))
    throw { statusCode: 400, message: 'type tidak valid. Gunakan: breakfast, lunch, dinner, water.' };

  const allowed = ['is_enabled', 'hour', 'minute', 'custom_message'];
  const updates = {};
  allowed.forEach(k => { if (body[k] !== undefined) updates[k] = body[k]; });

  if (updates.hour !== undefined && (updates.hour < 0 || updates.hour > 23))
    throw { statusCode: 400, message: 'hour harus antara 0-23.' };
  if (updates.minute !== undefined && (updates.minute < 0 || updates.minute > 59))
    throw { statusCode: 400, message: 'minute harus antara 0-59.' };

  updates.updated_at = new Date().toISOString();

  // Upsert: kalau belum ada row untuk type ini, buat baru
  const defaultForType = DEFAULT_SETTINGS.find(s => s.type === type);
  const { data, error } = await supabaseAdmin
    .from('notification_settings')
    .upsert(
      { user_id: userId, type, ...defaultForType, ...updates },
      { onConflict: 'user_id,type' }
    )
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

// Reset semua setting ke default
const resetSettings = async (userId) => {
  const { error: deleteError } = await supabaseAdmin
    .from('notification_settings')
    .delete()
    .eq('user_id', userId);
  if (deleteError) throw { statusCode: 400, message: deleteError.message };

  const inserts = DEFAULT_SETTINGS.map(s => ({ ...s, user_id: userId }));
  const { data, error } = await supabaseAdmin
    .from('notification_settings')
    .insert(inserts)
    .select();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

module.exports = { getSettings, updateSetting, resetSettings };
