const { sendNotification } = require('./firebase-service');
const { saveToDatabase } = require('./sequelize');
const amqp = require('amqplib/callback_api');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

amqp.connect(RABBITMQ_URL, (err, conn) => {
    if (err) {
        console.error('Error connecting to RabbitMQ:', err);
        return;
    }

    conn.createChannel((err, channel) => {
        if (err) {
            console.error('Error creating channel:', err);
            return;
        }

        const queue = 'notification.fcm';
        const exchange = 'notification.done';

        channel.assertQueue(queue, { durable: true });
        channel.assertExchange(exchange, 'fanout', { durable: false });

        console.log('Waiting for messages in %s', queue);
        channel.consume(queue, async (msg) => {
            const messageContent = JSON.parse(msg.content.toString());
            console.log('Received:', messageContent);

            try {
                channel.ack(msg);

                await sendNotification(messageContent.deviceId, messageContent.text);
                await saveToDatabase(messageContent.identifier, new Date().toISOString());

                const doneMessage = {
                    identifier: messageContent.identifier,
                    deliverAt: new Date().toISOString()
                };
                channel.publish(exchange, '', Buffer.from(JSON.stringify(doneMessage)));

            } catch (error) {
                console.error('Error handling message:', error);
            }
        });
    });
});
