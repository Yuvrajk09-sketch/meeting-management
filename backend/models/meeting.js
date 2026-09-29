const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Meeting = sequelize.define('meeting', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING, // e.g. "2:00 PM"
        allowNull: false
    },
    slotNumber: {
        type: DataTypes.INTEGER, // 1, 2, or 3
        allowNull: false
    }
});

module.exports = Meeting;
