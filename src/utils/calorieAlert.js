async function checkAndNotify(supabase, userId, totalCalories, calorieLimit) {
  if (!calorieLimit || calorieLimit <= 0) return;

  if (totalCalories > calorieLimit) {
    await supabase.from('notifications').insert({
      user_id: userId,
      title: '⚠️ Batas Kalori Harian Terlampaui',
      message: `Total kalori hari ini ${totalCalories.toFixed(1)} kcal melebihi batas ${calorieLimit} kcal harian Anda.`,
      type: 'calorie_alert'
    });
  }
}

module.exports = { checkAndNotify };
