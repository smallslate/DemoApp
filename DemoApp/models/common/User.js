module.exports = function(sequelize, DataTypes) {
  return sequelize.define("User", {
    userId: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
    providerId: { type: DataTypes.STRING(4000),allowNull: false},
    userFirstName: DataTypes.STRING(2000),
    userLastName: DataTypes.STRING(2000),
    userDisplayName: DataTypes.STRING(2000),
    accountStatus :{type:DataTypes.STRING(1),defaultValue: 'A'}
  });
};