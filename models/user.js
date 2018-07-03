'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    type: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    referral_id: DataTypes.INTEGER,
    user_name: DataTypes.STRING,
    dob: DataTypes.DATE,
    address: DataTypes.TEXT,
    contact_no: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country_id: DataTypes.INTEGER,
    postal_code: DataTypes.STRING,
    about_me: DataTypes.TEXT,
    image: DataTypes.STRING,
    identity_proof: DataTypes.STRING,
    status: DataTypes.INTEGER,
    activation_key: DataTypes.STRING,
    notes: DataTypes.STRING,
    investor_type: DataTypes.INTEGER,
    otp: DataTypes.INTEGER,
    two_factorAuth_secret_key: DataTypes.STRING,
    two_factorAuth_qr_code_image: DataTypes.TEXT,
    two_factorAuth_status: DataTypes.INTEGER,
    raw_password: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};