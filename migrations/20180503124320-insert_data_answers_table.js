'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('options', [
      {
          "id": "1",
          "option": "I want to have enough money to retire.",
          "question_id": "1",
          "createdAt": "2018-05-03 06:24:37",
          "updatedAt": "2018-05-03 06:24:37"
      },
      { 
          "id": "2",
          "option": "I'm looking to create a strong financial asset portfolio.",
          "question_id": "1",
          "createdAt": "2018-05-03 06:24:37",
          "updatedAt": "2018-05-03 06:24:37"
      },
      {
          "id": "3",
          "option": "I want to have passive income paid out monthly as form of dividends.",
          "question_id": "1",
          "createdAt": "2018-05-03 06:24:37",
          "updatedAt": "2018-05-03 06:24:37"
      },
      {
          "id": "4",
          "option": "I'm looking to double my investment.",
          "question_id": "1",
          "createdAt": "2018-05-03 06:24:37",
          "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "5",
        "option": "I'm interested in creating wealth.",
        "question_id": "1",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "6",
        "option": "Low",
        "question_id": "2",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "7",
        "option": "Medium",
        "question_id": "2",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "8",
        "option": "High",
        "question_id": "2",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "9",
        "option": "Very high",
        "question_id": "2",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "10",
        "option": "Short term",
        "question_id": "3",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "11",
        "option": "Long term",
        "question_id": "3",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "12",
        "option": "$100",
        "question_id": "4",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "13",
        "option": "$10,000",
        "question_id": "4",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "14",
        "option": "$100,000",
        "question_id": "4",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
      },
      {
        "id": "15",
        "option": "$1,000,000 or more",
        "question_id": "4",
        "createdAt": "2018-05-03 06:24:37",
        "updatedAt": "2018-05-03 06:24:37"
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
