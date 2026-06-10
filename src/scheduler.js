const cron = require('node-cron');
const { supabaseAdmin } = require('./config/supabase');
const { sendNotification, saveNotification } = require('./services/notification.service');

// Kirim notifikasi ke semua user yang punya setting aktif untuk type & jam tertentu
const sendScheduledNotif = async (type, currentHour, currentMinute) => {
  const { data: settings, error } = await supabaseAdmin
    .from('notification_settings')
    .select('user_id, custom_message, users!notification_settings_user_id_fkey(fcm_token)')
    .eq('type', type)
    .eq('is_enabled', true)
    .eq('hour', currentHour)
    .eq('minute', currentMinute);

  if (error || !settings || settings.length === 0) return;

  const titles = {
    breakfast: 'Waktunya Sarapan!',
    lunch:     'Waktunya Makan Siang!',
    dinner:    'Waktunya Makan Malam!',
    water:     'Jangan Lupa Minum Air!'
  };

  const title = titles[type];

  for (const setting of settings) {
    const fcmToken = setting.users?.fcm_token;
    const message = setting.custom_message || title;

    if (fcmToken) {
      await sendNotification(fcmToken, title, message);
    }
    await saveNotification(setting.user_id, title, message, 'general');
  }

  console.log(`[Scheduler] ${title} dikirim ke ${settings.length} user.`);
};

const startScheduler = () => {
  // Jalankan setiap menit, cek siapa yang perlu dikirimi notif
  cron.schedule('* * * * *', async () => {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const hour   = now.getHours();
    const minute = now.getMinutes();

    await sendScheduledNotif('breakfast', hour, minute);
    await sendScheduledNotif('lunch',     hour, minute);
    await sendScheduledNotif('dinner',    hour, minute);
    await sendScheduledNotif('water',     hour, minute);
  }, { timezone: 'Asia/Jakarta' });

  console.log('[Scheduler] Berjalan. Cek notifikasi setiap menit berdasarkan settings user.');
};

module.exports = { startScheduler };
