const express = require('express');

const {
    getComments,
    addComment,
    updateComment,
    deleteComment
} = require('../controller/comment');

const Comment = require('../models/Comment');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

router
    .route('/:postId/comments')
    .get(advancedResults(Comment, {
        path: 'post'
    }), getComments)
    .post(protect, addComment);

router
    .route('/comments/:id')
    .put(protect, authorize('author'), updateComment)
    .delete(protect, authorize('author'), deleteComment);

module.exports = router;