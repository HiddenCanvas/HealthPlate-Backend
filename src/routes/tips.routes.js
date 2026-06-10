const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tips.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', ctrl.getAllTips);
router.get('/:id', ctrl.getTipById);
router.post('/', authMiddleware, ctrl.createTip);
router.put('/:id', authMiddleware, ctrl.updateTip);
router.delete('/:id', authMiddleware, ctrl.deleteTip);

module.exports = router;