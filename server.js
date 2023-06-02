
const https = require('https');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const PORT = process.env.PORT || 443;

// Read the SSL certificate and key files
const privateKey = fs.readFileSync('./keys/your_domain.key', 'utf8');
const certificate = fs.readFileSync('./keys/your_domain.crt', 'utf8')
const ca = fs.readFileSync('./keys/your_domain.ca', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

app.use(bodyParser.json())
// Endpoint for Facebook Messenger webhook events
app.post('/webhook', (req, res) => {
    try {
        if (req.body.object === 'page') {
            req.body.entry.forEach(entry => {
                entry.messaging.forEach(event => {
                    if (event.message && event.message.text) {
                        const senderId = event.sender.id;
                        let messageText = event.message.text;
                        require('./functions/openai')(messageText, senderId);
                    }
                });
            });
            res.sendStatus(200);
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// Verify token endpoint
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'kahit ano pwede';

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified');
        res.status(200).send(challenge);
    } else {
        console.error('Failed to verify webhook');
        res.sendStatus(403);
    }
});

// Start the server
const server = https.createServer(credentials, app);

server.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
