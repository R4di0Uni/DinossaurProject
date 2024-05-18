'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PasswordReset extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  PasswordReset.init({
    email: DataTypes.STRING,
    token: DataTypes.STRING,
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'PasswordReset',
  });
  return PasswordReset;
};
