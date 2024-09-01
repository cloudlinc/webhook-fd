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
    console.log('Received a request at /webhook');
    const data = req.body;

    // Log the received data
    console.log('Received data from Synthflow:', JSON.stringify(data, null, 2));

    // Extract specific fields from the webhook data
    const studentName = data.executed_actions._student_name_student_name_student_name?.return_value?.student_name || 'N/A';
    const studentDOB = data.executed_actions._student_dob?.return_value?.student_dob || 'N/A';
    const studentGrade = data.executed_actions._student_grade?.return_value?.student_grade || 'N/A';
    const callbackInfo = data.executed_actions._callback_info?.return_value?.callback_info || 'N/A';

    // Prepare Freshdesk ticket data
    const ticketData = {
        description: `
            Status: ${data.status}
            Error Message: ${data.error_message || 'N/A'}
            Lead Name: ${data.lead.name || 'N/A'}
            Lead Phone Number: ${data.lead.phone_number || 'N/A'}
            Call Status: ${data.call.status}
            End Call Reason: ${data.call.end_call_reason}
            Model ID: ${data.call.model_id}
            Timezone: ${data.call.timezone}
            Call ID: ${data.call.call_id}
            Duration: ${data.call.duration}
            Start Time: ${data.call.start_time}
            Transcript: ${data.call.transcript}
            Recording URL: ${data.call.recording_url}
            Student Name: ${studentName}
            Student DOB: ${studentDOB}
            Student Grade: ${studentGrade}
            Callback Info: ${callbackInfo}
        `,
        subject: 'New ticket from Synthflow webhook',
        email: 'voice@rocs.org', // Replace with actual customer email
        priority: 1,
        status: 2,
        custom_fields: {
            cf_student_name: studentName,
            cf_student_dob: studentDOB,
            cf_student_grade: studentGrade,
            cf_callback_info: callbackInfo
        }
    };

    try {
        console.log('Sending data to Freshdesk...');
        console.log('Ticket data:', JSON.stringify(ticketData, null, 2));

        // Send data to Freshdesk
        const response = await axios.post(`https://${process.env.FRESHDESK_DOMAIN}.freshdesk.com/api/v2/tickets`, ticketData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${process.env.FRESHDESK_API_KEY}:x`).toString('base64')
            }
        });

        console.log('Ticket created in Freshdesk:', JSON.stringify(response.data, null, 2));
        res.status(200).send('Ticket created successfully');
    } catch (error) {
        console.error('Error creating ticket in Freshdesk:', error.message);
        if (error.response) {
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', JSON.stringify(error.response.headers, null, 2));
            console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
            res.status(500).send(`Failed to create ticket: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
            console.error('Error details:', error);
            res.status(500).send('Failed to create ticket');
        }
    }
});

// Create HTTP server instead of HTTPS
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
    console.log(`HTTP Server is running on port ${PORT}`);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send('Internal Server Error');
});

// Add a simple GET endpoint for testing
app.get('/test', (req, res) => {
    res.send('Server is running');
});