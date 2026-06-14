const admin = require('../config/firebase');
const { supabaseAdmin } = require('../config/supabase');

const sendNotification = async (fcmToken, title, message) => {
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body: message },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } }
    });
  } catch (err) {
    console.error('FCM error:', err.message);
  }
};

const saveNotification = async (userId, title, message, type) => {
  const { data, error } = await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type
  }).select().single();
  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const sendMealReminder = async (mealType) => {
  const titles = {
    breakfast: 'Waktunya Sarapan!',
    lunch: 'Waktunya Makan Siang!',
    dinner: 'Waktunya Makan Malam!'
  };
  const messages = {
    breakfast: 'Jangan lupa sarapan untuk memulai hari dengan energi penuh!',
    lunch: 'Sudah waktunya makan siang, jaga nutrisi harianmu!',
    dinner: 'Waktunya makan malam, catat makananmu di HealthPlate!'
  };

  const title = titles[mealType];
  const message = messages[mealType];

  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('user_id, fcm_token')
    .not('fcm_token', 'is', null);

  if (error || !users) return;

  for (const user of users) {
    await sendNotification(user.fcm_token, title, message);
    await saveNotification(user.user_id, title, message, 'general');
  }

  console.log('[Notif] ' + title + ' dikirim ke ' + users.length + ' user.');
};

const saveFcmToken = async (userId, token) => {
  if (!token) throw { statusCode: 400, message: 'fcm_token wajib diisi.' };

  const trimmedToken = token.trim();
  if (trimmedToken.length < 10) {
    throw { statusCode: 400, message: 'fcm_token tidak valid (panjang minimal 10 karakter).' };
  }

  // Hindari duplikasi token: Set fcm_token to null for any other user who has this token
  await supabaseAdmin
    .from('users')
    .update({ fcm_token: null })
    .eq('fcm_token', trimmedToken)
    .not('user_id', 'eq', userId);

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ fcm_token: trimmedToken })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const deleteFcmToken = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ fcm_token: null })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const getNotifications = async (userId, page = 1, limit = 10) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw { statusCode: 400, message: error.message };

  return {
    data: data || [],
    page: Number(page),
    limit: Number(limit),
    total_count: count || 0
  };
};

const markAsRead = async (userId, notificationId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('notification_id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const markAllAsRead = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
    .select();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
};

const createNotification = async (userId, payload) => {
  const { title, message, type = 'calorie_alert' } = payload;
  if (!title || !message) {
    throw { statusCode: 400, message: 'title dan message wajib diisi.' };
  }

  // Save to database
  const notif = await saveNotification(userId, title, message, type);

  // Send push notification if fcm_token exists
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('fcm_token')
    .eq('user_id', userId)
    .single();

  // Get push setting
  const { data: settings } = await supabaseAdmin
    .from('notification_settings')
    .select('push_enabled')
    .eq('user_id', userId)
    .limit(1)
    .single();

  const pushEnabled = settings ? settings.push_enabled : true;

  if (user && user.fcm_token && pushEnabled) {
    await sendNotification(user.fcm_token, title, message);
  }

  return notif;
};

const getPreferences = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('notification_settings')
    .select('push_enabled, mealplan_enabled, reminder_enabled, article_enabled')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        push_enabled: true,
        mealplan_enabled: true,
        reminder_enabled: true,
        article_enabled: true
      };
    }
    throw { statusCode: 400, message: error.message };
  }
  return {
    push_enabled: data.push_enabled ?? true,
    mealplan_enabled: data.mealplan_enabled ?? true,
    reminder_enabled: data.reminder_enabled ?? true,
    article_enabled: data.article_enabled ?? true
  };
};

const updatePreferences = async (userId, body) => {
  const { push_enabled, mealplan_enabled, reminder_enabled, article_enabled } = body;
  const updates = {};
  if (push_enabled !== undefined) updates.push_enabled = push_enabled;
  if (mealplan_enabled !== undefined) updates.mealplan_enabled = mealplan_enabled;
  if (reminder_enabled !== undefined) updates.reminder_enabled = reminder_enabled;
  if (article_enabled !== undefined) updates.article_enabled = article_enabled;

  const { data, error } = await supabaseAdmin
    .from('notification_settings')
    .update(updates)
    .eq('user_id', userId)
    .select('push_enabled, mealplan_enabled, reminder_enabled, article_enabled');

  if (error) throw { statusCode: 400, message: error.message };

  if (!data || data.length === 0) {
    // Populate defaults first
    const settingsSrv = require('./notification.settings.service');
    await settingsSrv.getSettings(userId);

    const { data: retryData, error: retryError } = await supabaseAdmin
      .from('notification_settings')
      .update(updates)
      .eq('user_id', userId)
      .select('push_enabled, mealplan_enabled, reminder_enabled, article_enabled');

    if (retryError) throw { statusCode: 400, message: retryError.message };
    return {
      push_enabled: retryData[0].push_enabled ?? true,
      mealplan_enabled: retryData[0].mealplan_enabled ?? true,
      reminder_enabled: retryData[0].reminder_enabled ?? true,
      article_enabled: retryData[0].article_enabled ?? true
    };
  }

  return {
    push_enabled: data[0].push_enabled ?? true,
    mealplan_enabled: data[0].mealplan_enabled ?? true,
    reminder_enabled: data[0].reminder_enabled ?? true,
    article_enabled: data[0].article_enabled ?? true
  };
};

module.exports = {
  sendNotification,
  saveNotification,
  sendMealReminder,
  saveFcmToken,
  deleteFcmToken,
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getPreferences,
  updatePreferences
};
