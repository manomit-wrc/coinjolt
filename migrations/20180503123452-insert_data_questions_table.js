'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('questions', [
      {
          "id": "1",
          "question": "What are your financial goals?",
          "createdAt": "2018-05-03 06:24:37",
          "updatedAt": "2018-05-03 06:24:37"
      },
      { 
          "id": "2",
          "question": "What sort of risk preference would you like for us to allocate your capital?",
          "createdAt": "2018-05-03 06:34:37",
          "updatedAt": "2018-05-03 06:34:37"
      },
      {
          "id": "3",
          "question": "Are you a short term or long term investor?",
          "createdAt": "2018-05-03 06:44:37",
          "updatedAt": "2018-05-03 06:44:37"
      },
      {
          "id": "4",
          "question": "How much are you willing to invest in cryptocurrency?",
          "createdAt": "2018-05-03 06:54:37",
          "updatedAt": "2018-05-03 06:54:37"
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
