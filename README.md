# Synthflow - Freshdesk Webhook Server

Instructions for running the server and updating the repo.

## Running and Updating the Server

1. Access the VM via Lightsail SSH
2. cd webhook-fd
3. git pull origin main
4. pm2 restart server
5. pm2 save
6. screen -S ngrok
7. ngrok http 3000
8. ctrl-a d
9. exit