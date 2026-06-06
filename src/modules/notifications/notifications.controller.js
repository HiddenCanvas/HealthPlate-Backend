const { success } = require('../../utils/response');
const notificationsService = require('./notifications.service');

const listNotifications = async (req, res, next) => {
  try {
    const data = await notificationsService.listNotifications(req.user.id, req.query.is_read);
    return success(res, data, 'Notifications retrieved');
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const data = await notificationsService.markAsRead(req.user.id, req.params.notification_id);
    return success(res, data, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead(req.user.id);
    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};

module.exports = { listNotifications, markAsRead, markAllAsRead };
