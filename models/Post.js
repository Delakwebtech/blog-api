const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');

// Define the Post model
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Please add a title'
            }
        }
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Please add content'
            }
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

// Hook to create slug from the title
Post.beforeCreate((post, options) => {
    post.slug = slugify(post.title, { lower: true });
});

// Hook to create slug from the title before update
Post.beforeUpdate((post, options) => {
    post.slug = slugify(post.title, { lower: true });
});

// Cascade delete comments when a post is deleted
Post.beforeDestroy(async (post, options) => {
    await sequelize.models.Comment.destroy({
        where: { postId: post.id }
    });
});

module.exports = Post;
