const express = require('express');

const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} = require('../controller/post');

const Post = require('../models/Post');
const Comment = require('../models/Comment');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const commentRouter = require('./comments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resourse routers
router.use('/:postId/comments', commentRouter);

router
  .route('/')
  .get(advancedResults(Post, [{ model: Comment, as: 'comments' }]), getPosts)
  .post(protect, createPost);

router
  .route('/:id')
  .get(getPost)
  .put(protect, authorize('author'), updatePost)
  .delete(protect, authorize('author'), deletePost);

module.exports = router;
