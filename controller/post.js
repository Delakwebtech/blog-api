const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Post = require('../models/Post');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        return next(
            new ErrorResponse(`Post not found with id ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: post });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Public
exports.createPost = asyncHandler(async (req, res, next) => {
    // Retrieve userId from the decoded token
    const userId = req.user.id;

    // Add userId to req.body
    req.body.userId = userId;

    const post = await Post.create(req.body);

    res.status(201).json({
        success: true,
        data: post
    });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Public
exports.updatePost = asyncHandler(async (req, res, next) => {
    // Find post by primary key
    let post = await Post.findByPk(req.params.id);

    // If post not found, return error
    if (!post) {
        return next(
            new ErrorResponse(`Post not found with id ${req.params.id}`, 404)
        );
    }

    // Make sure user is the post owner
    if (post.userId !== req.user.id) {
        return next(
            new ErrorResponse(`User ${req.user.id} is not authorized to update this post`, 401)
        );
    }

    // Update post
    post = await post.update(req.body);

    // Return updated post
    res.status(200).json({ success: true, data: post });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Public
exports.deletePost = asyncHandler(async (req, res, next) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        return next(
            new ErrorResponse(`Post not found with id ${req.params.id}`, 404)
        );
    }

    // Make sure user is the post owner
    if (post.userId !== req.user.id) {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to delete this post`, 401)
        );
    }

    await post.destroy();

    res.status(200).json({ success: true, data: {} });
});

// @desc    Upload post featured image
// @route   PUT /api/posts/:id/image
// @access  Public
exports.postImageUpload = asyncHandler(async (req, res, next) => {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
        return next(
            new ErrorResponse(`Post not found with id ${req.params.id}`, 404)
        );
    }

    // Make sure user is the post owner
    if (post.userId.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
            new ErrorResponse(`User ${req.params.id} is not authorized to update this post`, 401)
        );
    }

    if (!req.files) {
        return next(
            new ErrorResponse('Please upload a file', 400)
        );
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(
            new ErrorResponse('Please upload an image file', 400)
        );
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400)
        );
    }

    // Create custom filename
    file.name = `photo_${post.id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            return next(
                new ErrorResponse('Error with file upload', 500)
            );
        }

        await post.update({ photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    });
});
