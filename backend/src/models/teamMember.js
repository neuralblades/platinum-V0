const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TeamMember = sequelize.define('TeamMember', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    languages: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',
      get() {
        const value = this.getDataValue('languages');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('languages', JSON.stringify(value || []));
      }
    },
    isLeadership: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });

  return TeamMember;
};
