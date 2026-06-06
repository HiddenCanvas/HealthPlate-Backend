const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { addEntrySchema, historyQuerySchema } = require('./logs.schema');
const logsController = require('./logs.controller');

const router = express.Router();

router.get('/daily', logsController.getDaily);
router.post('/entries', validate(addEntrySchema), logsController.addEntry);
router.delete('/entries/:entry_id', logsController.deleteEntry);
router.get('/history', validate(historyQuerySchema, 'query'), logsController.getHistory);

module.exports = router;
