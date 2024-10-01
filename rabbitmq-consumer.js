const { sendNotification } = require('./firebase-service');
const { saveMessageToDatabase } = require('./sequelize');
const amqp = require('amqplib/callback_api');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const queue = 'notification.fcm';
const exchange = 'notification.done';
let rabbitmq_channel;

const connectRabbitMQ = () => {
    amqp.connect(RABBITMQ_URL, (err, conn) => {
        if (err) {
            console.error('Error connecting to RabbitMQ:', err);
            setTimeout(connectRabbitMQ, 5000); // Retry after 5 seconds
            return;
        }
    
        conn.createChannel((err, channel) => {
            rabbitmq_channel = channel;
    
            if (err) {
                console.error('Error creating channel:', err);
                return;
            }
    
            channel.assertQueue(queue, { durable: true });
            channel.assertExchange(exchange, 'fanout', { durable: false });
    
            console.log('Waiting for messages in %s', queue);
            channel.consume(queue, async (msg) => {
                const messageContent = JSON.parse(msg.content.toString());
                console.log('Received:', messageContent);
    
                try {
                    channel.ack(msg);
    
                    await sendNotification(messageContent.deviceId, messageContent.text);
                    await saveMessageToDatabase(messageContent.identifier, new Date().toISOString());
    
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
}

const publishMessage = (message) => {
    if (!rabbitmq_channel) {
        console.error('RabbitMQ channel is not initialized');
        return;
    }

    rabbitmq_channel.assertQueue(queue, { durable: true });
    rabbitmq_channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
    console.log(`Message sent to ${queue}:`, message);

    return
};

connectRabbitMQ();
module.exports = { publishMessage };