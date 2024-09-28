const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
});

const Job = sequelize.define('fcm_job', {
    identifier: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    deliverAt: {
        type: DataTypes.DATE
    }
}, {
    timestamps: false
});

const saveToDatabase = async (identifier, deliverAt) => {
    try {
        await sequelize.sync();
        await Job.create({ identifier, deliverAt });
    } catch (error) {
        console.error('Error saving to database:', error);
    }
};

module.exports = { sequelize, Job, saveToDatabase };