const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const { registerSchema, loginSchema, refreshSchema } = require('./auth.schema');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.post('/refresh', validate(refreshSchema), authController.refresh);

module.exports = router;
