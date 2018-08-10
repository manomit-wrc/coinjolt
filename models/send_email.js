'use strict';
module.exports = (sequelize, DataTypes) => {
  var send_email = sequelize.define('send_email', {
    user_id: DataTypes.INTEGER,
    email_template_id: DataTypes.INTEGER,
    email_sub: DataTypes.STRING,
    email_desc: DataTypes.TEXT,
    send_by_id: DataTypes.INTEGER,
    send_email_address: DataTypes.INTEGER
  }, {});
  send_email.associate = function(models) {
    // associations can be defined here
  };
  return send_email;
};