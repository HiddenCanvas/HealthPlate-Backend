const express = require('express');
const router = express.Router();
['auth', 'nutrition', 'log', 'mealplan', 'dashboard', 'scan', 'recipe'].forEach(f => {
  router.use('/' + f, require('./' + f + '.routes'));
});
module.exports = router;