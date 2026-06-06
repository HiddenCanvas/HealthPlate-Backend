const supabase = require('../../config/supabase');

const listPlans = async (userId) => {
  const { data, error } = await supabase.from('meal_plans').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const createPlan = async (userId, payload) => {
  const { data, error } = await supabase.from('meal_plans').insert({ user_id: userId, ...payload }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
};

const getPlan = async (userId, planId) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*, meal_plan_items(*)')
    .eq('plan_id', planId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.user_id !== userId) throw new Error('Meal plan not found');
  return data;
};

const updatePlan = async (userId, planId, payload) => {
  const { data, error } = await supabase
    .from('meal_plans')
    .update(payload)
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const deletePlan = async (userId, planId) => {
  const { error } = await supabase.from('meal_plans').delete().eq('plan_id', planId).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
};

const listItems = async (userId, planId) => {
  const plan = await getPlan(userId, planId);
  return plan.meal_plan_items || [];
};

const createItem = async (userId, planId, payload) => {
  const plan = await getPlan(userId, planId);
  if (!plan) throw new Error('Meal plan not found');
  const { data, error } = await supabase.from('meal_plan_items').insert({ plan_id: planId, ...payload }).select('*').single();
  if (error) throw new Error(error.message);
  return data;
};

const deleteItem = async (userId, planId, itemId) => {
  const plan = await getPlan(userId, planId);
  if (!plan) throw new Error('Meal plan not found');
  const { error } = await supabase.from('meal_plan_items').delete().eq('item_id', itemId).eq('plan_id', planId);
  if (error) throw new Error(error.message);
  return true;
};

module.exports = { listPlans, createPlan, getPlan, updatePlan, deletePlan, listItems, createItem, deleteItem };
