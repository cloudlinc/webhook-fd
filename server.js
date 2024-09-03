const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
    console.log('Received a request at /webhook');
    const data = req.body;

    // Log the received data
    console.log('Received data from Synthflow:', JSON.stringify(data, null, 2));

    // Extract key information from the webhook data
    const studentName = data.executed_actions._student_name_student_name_student_name?.return_value?.student_name || "Unknown Student";
    const studentDOB = data.executed_actions._student_dob?.return_value?.student_dob || "Unknown DOB";
    const studentGrade = data.executed_actions._student_grade?.return_value?.student_grade || "Unknown Grade";
    const callTranscript = data.call?.transcript || "No transcript available";
    const issueDescription = data.executed_actions.my_extract_info_issue_description_issue_description?.return_value?.issue_description || "No issue description provided";
    const callbackInfo = data.executed_actions._callback_info?.return_value?.callback_info || "No callback info provided";

    // Prepare Freshdesk ticket data with the extracted information
    const ticketData = {
        description: `
        **Issue Description:** ${issueDescription}
        **Student Name:** ${studentName}
        **Date of Birth:** ${studentDOB}
        **Grade:** ${studentGrade}
        **Call Transcript:** 
        ${callTranscript}
        **Callback Info:** ${callbackInfo}`,
        subject: `Voice Support for ${studentName}`,
        email: 'voice@rocs.org', // Replace with actual customer email
        priority: 1,
        status: 2
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
const httpServer = require('http').createServer(app);

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