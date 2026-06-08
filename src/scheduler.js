const cron = require('node-cron');
const { sendMealReminder } = require('./services/notification.service');

const startScheduler = () => {
  // Sarapan jam 06.15
  cron.schedule('15 6 * * *', () => {
    console.log('[Scheduler] Mengirim notifikasi sarapan...');
    sendMealReminder('breakfast');
  }, { timezone: 'Asia/Jakarta' });

  // Makan siang jam 12.00
  cron.schedule('0 12 * * *', () => {
    console.log('[Scheduler] Mengirim notifikasi makan siang...');
    sendMealReminder('lunch');
  }, { timezone: 'Asia/Jakarta' });

  // Makan malam jam 18.30
  cron.schedule('30 18 * * *', () => {
    console.log('[Scheduler] Mengirim notifikasi makan malam...');
    sendMealReminder('dinner');
  }, { timezone: 'Asia/Jakarta' });

  console.log('[Scheduler] Berjalan. Notifikasi: 06.15, 12.00, 18.30 WIB');
};

module.exports = { startScheduler };
