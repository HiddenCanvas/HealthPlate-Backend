const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { updateUserSchema } = require('./users.schema');
const usersController = require('./users.controller');

const router = express.Router();

router.get('/me', usersController.getMe);
router.put('/me', validate(updateUserSchema), usersController.updateMe);

module.exports = router;
