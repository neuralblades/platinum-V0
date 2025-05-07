'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlogPost = sequelize.define('BlogPost', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    excerpt: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    featuredImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'General'
    },
    tags: {
      type: DataTypes.TEXT,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('tags');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('tags', JSON.stringify(value || []));
      }
    },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      defaultValue: 'draft'
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'blog_posts',
    timestamps: true,
    indexes: [
      { fields: ['slug'], unique: true },
      { fields: ['authorId'] },
      // Index for filtering by status and sorting by date
      { fields: ['status', 'createdAt'] },
      { fields: ['category'] }
    ],
    hooks: {
      beforeCreate: (post) => {
        if (post.status === 'published' && !post.publishedAt) {
          post.publishedAt = new Date();
        }
      },
      beforeUpdate: (post) => {
        if (post.status === 'published' && !post.publishedAt) {
          post.publishedAt = new Date();
        }
      }
    }
  });

  BlogPost.associate = (models) => {
    if (models.User) {
      BlogPost.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author'
      });
    }

    if (models.BlogComment) {
      BlogPost.hasMany(models.BlogComment, {
        foreignKey: 'postId',
        as: 'comments'
      });
    }
  };

  return BlogPost;
};
