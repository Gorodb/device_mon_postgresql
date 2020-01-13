'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        'Users',
        'is_email_confirmed',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }
    )
  }
}
