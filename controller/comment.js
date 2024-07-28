const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Comment = require('../models/Comment');
const Post = require('../models/Post');


// @desc    Get all comments of a post
// @route   GET /api/posts/:postId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
    if(req.params.postId) {
        const comments = await Comment.findAll({post: req.params.postId});

        return res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});


// @desc    Add comment
// @route   POST /api/posts/:postId/comment
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
    req.body.postId = req.params.postId;

    req.body.userId = req.user.id;

    const post = await Post.findByPk(req.params.postId);

    if(!post) {
        return next(new ErrorResponse(`No post with id ${req.params.postId}`), 404);
    }

    const comment = await Comment.create(req.body);

    res.status(200).json({
        success: true,
        data: comment
    });
});


// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {

    let comment = await Comment.findByPk(req.params.id);

    if(!comment) {
        return next(new ErrorResponse(`No comment with id ${req.params.id}`), 404);
    }

    // Make sure user is the comment owner
    if(comment.userId !== req.user.id) {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update a comment ${course._id}`, 401)
        );
    }

    // Update post
    comment = await comment.update(req.body);

    // Return updated post
    res.status(200).json({
        success: true,
        data: comment
    });
});
  

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Public
exports.deleteComment = asyncHandler(async (req, res, next) => {
  
    const comment = await Comment.findByPk(req.params.id);

    if(!comment) {
        return next(new ErrorResponse(`Comment with id ${req.params.id} not found`, 404));
    }

    // Make sure user is the comment owner
    if(comment.userId !== req.user.id) {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to delete a comment ${comment._id}`, 401)
        );
    }

    await comment.destroy();

    res.status(200).json({
        success: true, 
        data:{}
    });

});
