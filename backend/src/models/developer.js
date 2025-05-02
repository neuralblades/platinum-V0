'use strict';

module.exports = (sequelize, DataTypes) => {
  const Developer = sequelize.define('Developer', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      // Removed unique constraint to reduce number of indexes
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    established: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    headquarters: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      // Removed unique constraint to reduce number of indexes
    }
  }, {
    tableName: 'developers',
    timestamps: true,
  });

  Developer.associate = (models) => {
    // A developer can have many properties
    Developer.hasMany(models.Property, {
      foreignKey: 'developerId',
      as: 'properties',
    });
  };

  return Developer;
};
