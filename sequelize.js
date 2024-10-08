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

const Token = sequelize.define('fcm_token', {
    token: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, {
    timestamps: false
});

const saveMessageToDatabase = async (identifier, deliverAt) => {
    try {
        await sequelize.sync();

        const [newJob, created] = await Job.findOrCreate({
            where: { identifier },
            defaults: { deliverAt }
        });

        if (created) {
            console.log('Message saved successfully:', newJob.identifier, newJob.deliverAt);
        } else {
            console.log('Message already exists for identifier:', newJob.identifier);
        }
    } catch (error) {
        console.error('Error saving to database:', error);
    }
};

const saveTokenToDatabase = async(token) => {
    try {
        await sequelize.sync();

        const [newToken, created] = await Token.findOrCreate({ // using findOrCreate to prevent duplicates
            where: { token },  // Find by token
            defaults: { token } // If not found, create a new entry
        });

        if (created) {
            console.log('Token saved successfully:', newToken.token);
        } else {
            console.log('Token already exists:', newToken.token);
        }
    } catch (error) {
        console.error('Error saving to database:', error);
    }
}

const getAllTokens = async() => {
    try {
        const tokens = await Token.findAll();
        return tokens.map(token => token.token);
    } catch (error) {
        console.error('Error fetching tokens from database:', error);
        throw error;
    }
}

module.exports = { sequelize, Job, saveMessageToDatabase, saveTokenToDatabase, getAllTokens };