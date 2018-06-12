'use strict';
module.exports = (sequelize, DataTypes) => {
  var cms_risk_disclosures = sequelize.define('cms_risk_disclosures', {
    risk_disclosures_header_image: DataTypes.STRING,
    risk_disclosures_header_desc: DataTypes.TEXT,
    risk_disclosures_content: DataTypes.TEXT
  }, {});
  cms_risk_disclosures.associate = function(models) {
    // associations can be defined here
  };
  return cms_risk_disclosures;
};