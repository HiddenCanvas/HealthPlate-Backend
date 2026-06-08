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
  await supabaseAdmin.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type
  });
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

  // Ambil semua user yang punya fcm_token
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

module.exports = { sendNotification, saveNotification, sendMealReminder };
