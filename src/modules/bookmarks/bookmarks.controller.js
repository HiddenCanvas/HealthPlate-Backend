const { success } = require('../../utils/response');
const bookmarksService = require('./bookmarks.service');

const listBookmarks = async (req, res, next) => {
  try {
    const data = await bookmarksService.listBookmarks(req.user.id, req.query.type);
    return success(res, data, 'Bookmarks retrieved');
  } catch (err) {
    next(err);
  }
};

const createBookmark = async (req, res, next) => {
  try {
    const data = await bookmarksService.createBookmark(req.user.id, req.body);
    return success(res, data, 'Bookmark created', 201);
  } catch (err) {
    next(err);
  }
};

const deleteBookmark = async (req, res, next) => {
  try {
    await bookmarksService.deleteBookmark(req.user.id, req.params.bookmark_id);
    return success(res, null, 'Bookmark deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { listBookmarks, createBookmark, deleteBookmark };
