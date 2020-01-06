'use strict';
module.exports = (sequelize, DataTypes) => {
  const TokensLinks = sequelize.define('TokensLinks', {
    user_id: DataTypes.INTEGER,
    link: {
      type: DataTypes.STRING,
      allowNull: false
    },
    expiration_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'link']
      }
    ]
  });
  TokensLinks.associate = function(models) {
    TokensLinks.belongsTo(models.Users, {
      foreignKey: 'user_id',
      as: 'user'
    })
  };
  return TokensLinks;
};