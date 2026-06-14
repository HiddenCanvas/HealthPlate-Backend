const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/log.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', ctrl.getAllLogs);
router.get('/:date', ctrl.getLogByDate);
router.post('/:date/entries/custom', ctrl.addCustomEntry);
router.post('/:date/entries', ctrl.addEntry);
router.post('/:date/consume-recipe', ctrl.consumeRecipe);
router.post('/:date/ai-food', ctrl.addAiFoodEntry);
router.delete('/:date/entries/:entryId', ctrl.deleteEntry);
router.put('/:date/water', ctrl.updateWater);

module.exports = router;
