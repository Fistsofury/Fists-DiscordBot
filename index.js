const fs = require('fs');
const axios = require('axios');
const { Client, Collection, GatewayIntentBits, EmbedBuilder, ActivityType, } = require('discord.js');
const { token, serverIp, serverPort } = require('./config.json');



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}
console.log(new Date().toString());
client.cronJobs = new Map();
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.updateBotStatus();// Initial update on startup
  setInterval(() => client.updateBotStatus(), 60000); // Update every 1m

});

client.updateBotStatus = async function() {
  try {
    const url = `http://${serverIp}:${serverPort}/players.json`;
    const response = await axios.get(url);
    const playerCount = response.data.length;

    await this.user.setPresence({
      activities: [{ name: `${playerCount} players online`, type: ActivityType.Watching }],
      status: 'online', 
    });

    console.log(`Status updated: ${playerCount} players online`);
  } catch (error) {
    console.error('Failed to update bot status:', error);
  }
};
client.on('interactionCreate', async interaction => {
  console.log('Interaction received:', interaction.type, interaction.customId);

  // Handle Modal Submissions
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'deleteScheduleModal') {
      try {
        console.log('Modal interaction received:', interaction);
        const numberToDelete = interaction.fields.getTextInputValue('scheduleNumberInput');
        const indexToDelete = parseInt(numberToDelete, 10) - 1;
        console.log(`Index to delete: ${indexToDelete}`);
        let schedules = JSON.parse(fs.readFileSync('./schedules.json', 'utf8'));
        console.log('Schedules before deletion:', schedules);

        if (isNaN(indexToDelete) || indexToDelete < 0 || indexToDelete >= schedules.length) {
          await interaction.reply({ content: 'Invalid schedule number.', ephemeral: true });
          return;
        }

        schedules.splice(indexToDelete, 1);
        fs.writeFileSync('./schedules.json', JSON.stringify(schedules, null, 2), 'utf8');
        console.log('Schedules after deletion:', schedules);
        await interaction.reply({ content: `Schedule number ${numberToDelete} has been deleted.`, ephemeral: true });
      } catch (error) {
        console.error('Error processing modal submission:', error);
        await interaction.reply({ content: `An error occurred while processing your request: ${error.message}`, ephemeral: true });
      }
    }
  }

  // Handle Button Interactions
  if (interaction.isButton()) {
    console.log('Button interaction:', interaction.customId);

    if (interaction.customId === 'previous' || interaction.customId === 'next') {
      try {
        const channelCommand = client.commands.get('channel');
        if (channelCommand && channelCommand.handlePagination) {
          await channelCommand.handlePagination(interaction);
        } else {
          console.error('Pagination handler not found for channel command');
          await interaction.reply({ content: 'Unable to process the request.', ephemeral: true });
        }
      } catch (error) {
        console.error('Error handling button interaction:', error);
        await interaction.reply({ content: 'There was an error while processing your request.', ephemeral: true });
      }
    }
  }
});



client.login(token);

console.log(`Current time zone is: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);