const sequelize = require('../utils/database');
const User = require('./user');
const Meeting = require('./meeting');

User.hasMany(Meeting);
Meeting.belongsTo(User);

module.exports = {
    sequelize,
    User,
    Meeting
};
