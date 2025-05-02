'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create BlogPost table
    await queryInterface.createTable('blog_posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      featuredImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'General'
      },
      tags: {
        type: Sequelize.TEXT,
        defaultValue: '[]'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published'),
        defaultValue: 'draft'
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create BlogComment table
    await queryInterface.createTable('blog_comments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      postId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'blog_posts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add indexes (only for columns that don't already have indexes)
    // Skip slug index since it's already unique
    await queryInterface.addIndex('blog_posts', ['category']);
    await queryInterface.addIndex('blog_posts', ['status']);
    // Skip authorId index since it's a foreign key and already has an index
    // Skip postId and userId indexes since they're foreign keys and already have indexes
    await queryInterface.addIndex('blog_comments', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('blog_comments');
    await queryInterface.dropTable('blog_posts');
  }
};
