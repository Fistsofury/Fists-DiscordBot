const fs = require('fs');
const { SlashCommandBuilder, ActivityType, PresenceStatusType } = require('discord.js');
const axios = require('axios');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configure')
    .setDescription('Configure the bot status with the number of players.')
    .addStringOption(option =>
      option.setName('ip')
        .setDescription('The IP address of the server')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('port')
        .setDescription('The port of the server')
        .setRequired(true)),
  async execute(interaction) {
    const ip = interaction.options.getString('ip');
    const port = interaction.options.getString('port');
    const url = `http://${ip}:${port}/players.json`;

    try {
      // Attempt to fetch player data from the server
      const response = await axios.get(url);
      const playerCount = response.data.length;

      // Bot Status stuff
      await interaction.client.user.setPresence({
        activities: [{ name: `${playerCount} players online`, type: ActivityType.Watching }],
        status: 'online',
      });
      
      await interaction.reply(`Bot status updated with ${playerCount} players online.`);
      const configPath = path.join(__dirname, '..', 'config.json');
      const config = require(configPath);

      config.serverIp = ip;
      config.serverPort = port;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

      // Confirm that the IP and port have been updated in the config.json
      await interaction.followUp(`Server IP and port have been updated to ${ip}:${port}.`);

    } catch (error) {
      console.error(error);
      await interaction.reply('Failed to fetch player data or update the bot status.');
    }
  },
};
