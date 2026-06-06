const supabase = require('../../config/supabase');

const listNotifications = async (userId, isRead) => {
  let query = supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (isRead !== undefined) {
    query = query.eq('is_read', isRead === 'true');
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

const markAsRead = async (userId, notificationId) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('notification_id', notificationId)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const markAllAsRead = async (userId) => {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
};

module.exports = { listNotifications, markAsRead, markAllAsRead };
