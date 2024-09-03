# Synthflow - Freshdesk Webhook Server

Instructions for running the server and updating the repo.

## Running and Updating the Server

1. Access the VM via Lightsail SSH
2. cd webhook-fd
    - If webhook-fd does not exist, run mkdir webhook-fd
3. git pull origin main
4. pm2 restart server
5. pm2 save
6. screen -S ngrok
7. ngrok http 3000
8. ctrl-a d
9. exit

## Troubleshooting

- If ngrok gives an error, go to the ngrok dashboard and click "restart" on the old tunnel.
- if you have a conflict with pull requests, you can 
    - run git checkout -- package.json
    - run git pull origin main

1. If you get an error about ngrok not being installed, run `npm install -g ngrok`
2. If you get an error about pm2 not being installed, run `npm install -g pm2`
3. If you get an error about screen not being installed, run `sudo apt-get install screen`
4. If you get an error about node not being installed, run `sudo apt-get install nodejs`
5. If you get an error about npm not being installed, run `sudo apt-get install npm`
6. If you get an error about git not being installed, run `sudo apt-get install git`
7. If you get an error about ssh not being installed, run `sudo apt-get install ssh`
8. If you get an error about curl not being installed, run `sudo apt-get install curl`