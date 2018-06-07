'use strict';
module.exports = (sequelize, DataTypes) => {
  var email_draft = sequelize.define('email_draft', {
    subject: DataTypes.STRING,
    body: DataTypes.TEXT,
    user_type: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  email_draft.associate = function(models) {
    // associations can be defined here
  };
  return email_draft;
};