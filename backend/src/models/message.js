'use strict';

module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    inquiryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    indexes: [
      // Combined index for inquiry messages
      { fields: ['inquiryId', 'createdAt'] },
      // Index for user's messages (sent or received)
      { fields: ['senderId', 'receiverId'] }
    ]
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Inquiry, {
      foreignKey: 'inquiryId',
      as: 'inquiry',
    });
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
    });
    Message.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver',
    });
  };

  return Message;
};
