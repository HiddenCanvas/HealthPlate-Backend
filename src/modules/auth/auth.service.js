const supabase = require('../../config/supabase');

const register = async ({ name, email, password }) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data?.user) throw new Error('Unable to create user');

  const userId = data.user.id;
  const { error: updateError } = await supabase.from('users').update({ name }).eq('user_id', userId);
  if (updateError) throw new Error(updateError.message);

  return {
    user: {
      id: userId,
      name,
      email
    },
    access_token: data.session?.access_token || null,
    refresh_token: data.session?.refresh_token || null
  };
};

const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data?.session || !data.user) throw new Error('Invalid login response');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('name')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (profileError) throw new Error(profileError.message);

  return {
    user: {
      id: data.user.id,
      name: profile?.name || null,
      email: data.user.email
    },
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  };
};

const refreshToken = async ({ refresh_token }) => {
  const { data, error } = await supabase.auth.refreshSession({ refreshToken: refresh_token });
  if (error) throw new Error(error.message);
  if (!data?.session) throw new Error('Unable to refresh token');

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token
  };
};

const logout = async (userId) => {
  const { error } = await supabase.auth.admin.invalidateUserSessions(userId);
  if (error) throw new Error(error.message);
  return true;
};

module.exports = { register, login, logout, refreshToken };
