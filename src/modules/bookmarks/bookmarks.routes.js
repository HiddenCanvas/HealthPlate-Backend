const express = require('express');
const validate = require('../../middlewares/validate.middleware');
const { createBookmarkSchema } = require('./bookmarks.schema');
const bookmarksController = require('./bookmarks.controller');

const router = express.Router();

router.get('/', bookmarksController.listBookmarks);
router.post('/', validate(createBookmarkSchema), bookmarksController.createBookmark);
router.delete('/:bookmark_id', bookmarksController.deleteBookmark);

module.exports = router;
