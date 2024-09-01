const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const https = require('https');
const http = require('http'); // Add this line
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Comment out the SSL certificate loading
// const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
// const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
// const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

// const credentials = {
//     key: privateKey,
//     cert: certificate,
//     ca: ca
// };

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    const data = req.body;

    // Log the received data
    console.log('Received data from Synthflow:', data);

    // Prepare Freshdesk ticket data
    const ticketData = {
        description: JSON.stringify(data),
        subject: 'New ticket from Synthflow webhook',
        email: 'voice@rocs.org', // Replace with actual customer email
        priority: 1,
        status: 2
    };

    try {
        // Send data to Freshdesk
        const response = await axios.post(`https://${process.env.FRESHDESK_DOMAIN}.freshdesk.com/api/v2/tickets`, ticketData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.FRESHDESK_API_KEY}:x`).toString('base64')
            }
        });

        console.log('Ticket created in Freshdesk:', response.data);
        res.status(200).send('Ticket created successfully');
    } catch (error) {
        console.error('Error creating ticket in Freshdesk:', error.response ? error.response.data : error.message);
        res.status(500).send('Failed to create ticket');
    }
});

// Create HTTP server instead of HTTPS
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
});