# fists-redmbot

This is a discord bot that displays the amount of players in your server as the bots status and also send the player names and ping to a channel of your choosing.It also includes Maintenance messaging and message scheduling.

## Features

- Custom commands to display server stats for your server
- Scheduled messaging
- Clear player display
- Sets bots status as your player count

## Features
 <img src="https://i.imgur.com/wyCAkDS.png"> 
- /configure : will alow you to configure the IP and the port of the server, it will overwrite the config.json and will aslso set the bots status
- /channel: Pick the channel of wehre you want the player list to be displayed and updated every minute. (it doesnt ping)
 <img src="https://i.imgur.com/PzWuE7C.png"> 
- /schedule: Schedules a message to a channel of your chosing to repeat every X amount of hours, great for server restarts and general repatitive messaging in your discord server.
 <img src="https://i.imgur.com/UN3AYJP.png"> 
- /clearschedule: - Delete all or delete a specefic schedule
- /maintenence Displays a custome maintenance message for when your server needs to be taken down or CFX is down
 <img src="https://i.imgur.com/n5oAyk2.png"> 
- /clearmaintenance: Deletes the maintenance message

## Config.JSON
-   "token": "your-bot-token-here", -- Put in your bot token
-  "clientId": "your-client-id-here", -- put in your bots application ID
-  "guildId": "your-guild-id-here", -- Put in your server ID
-  "serverIp": "your-server-ip-here", -- Can leave blank and use /configure to overwrite
-  "serverPort": "your-server-port-here", -- Can leave blank and use /configure to overwrite
-  "allowedRoles": ["your-reole-id-here"] --User permission ID's for people to use the commands ["ROLE_ID_1", "ROLE_ID_2", "ROLE_ID_3"]

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (Download and install from [Node.js official website](https://nodejs.org/)).


1. Visit the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click on "New Application" and give your bot a name.
3. Go to the "Bot" tab and click "Add Bot".
4. Under "TOKEN", click "Copy". **Never share your bot token.**
5. Go to the config.json and input the bot token there, along side the bots application ID (client ID) and your servers ID

#### Inviting Your Bot to Your Server

1. In the "OAuth2" tab, under "URL Generator", select "bot" & "applications.commands".
2. Choose the appropriate permissions for your bot under "BOT PERMISSIONS".
3. Copy the generated URL, open it in your web browser, select your server, and invite your bot.

### Local Setup

#### Installing Node.js and NPM

Node.js and NPM (Node Package Manager) are essential to run a Discord bot. You can download them from the [Node.js official website](https://nodejs.org/).

#### Installing Dependencies

Clone your bot repository and install the necessary node modules:

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_REPOSITORY_DIRECTORY
npm install
npm install discord.js
npm install @discordjs/rest discord-api-types
npm install axios
npm install fs-extra
```

### Special Mentions
Thanks to Jake2k4, SavSin and Bytesizd
