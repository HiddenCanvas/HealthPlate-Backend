const srv = require('../services/article.service');

const getAllArticles = async (req, res, next) => {
  try {
    const { page, limit, category } = req.query;
    const result = await srv.getAllArticles({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      category
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) { next(err); }
};

const getArticleById = async (req, res, next) => {
  try {
    const data = await srv.getArticleById(req.params.id);
    // Increment view count
    await srv.incrementView(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const createArticle = async (req, res, next) => {
  try {
    const data = await srv.createArticle(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Artikel berhasil dibuat.', data });
  } catch (err) { next(err); }
};

const updateArticle = async (req, res, next) => {
  try {
    const data = await srv.updateArticle(req.user.id, req.params.id, req.body);
    return res.status(200).json({ success: true, message: 'Artikel berhasil diupdate.', data });
  } catch (err) { next(err); }
};

const deleteArticle = async (req, res, next) => {
  try {
    await srv.deleteArticle(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Artikel berhasil dihapus.' });
  } catch (err) { next(err); }
};

const likeArticle = async (req, res, next) => {
  try {
    const data = await srv.likeArticle(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Like berhasil.', data });
  } catch (err) { next(err); }
};

const bookmarkArticle = async (req, res, next) => {
  try {
    const data = await srv.bookmarkArticle(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Bookmark berhasil.', data });
  } catch (err) { next(err); }
};

const getEngagement = async (req, res, next) => {
  try {
    const data = await srv.getEngagement(req.params.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

const getAllEngagementSummary = async (req, res, next) => {
  try {
    const data = await srv.getAllEngagementSummary(req.user.id);
    return res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = {
  getAllArticles, getArticleById, createArticle, updateArticle,
  deleteArticle, likeArticle, bookmarkArticle, getEngagement,
  getAllEngagementSummary
};