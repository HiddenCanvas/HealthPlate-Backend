const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/article.controller');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', ctrl.getAllArticles);
router.get('/:id', ctrl.getArticleById);
router.get('/:id/engagement', ctrl.getEngagement);

// Protected routes
router.post('/', authMiddleware, ctrl.createArticle);
router.put('/:id', authMiddleware, ctrl.updateArticle);
router.delete('/:id', authMiddleware, ctrl.deleteArticle);
router.post('/:id/like', authMiddleware, ctrl.likeArticle);
router.post('/:id/bookmark', authMiddleware, ctrl.bookmarkArticle);
router.get('/my/engagement', authMiddleware, ctrl.getAllEngagementSummary);

module.exports = router;