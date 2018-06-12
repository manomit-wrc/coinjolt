'use strict';
module.exports = (sequelize, DataTypes) => {
  var cms_privacy_policy = sequelize.define('cms_privacy_policy', {
    privacy_policy_header_image: DataTypes.STRING,
    privacy_policy_header_desc: DataTypes.TEXT,
    privacy_policy_content: DataTypes.TEXT
  }, {});
  cms_privacy_policy.associate = function(models) {
    // associations can be defined here
  };
  return cms_privacy_policy;
};