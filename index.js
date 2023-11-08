const fs = require('fs');
const { Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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
client.on('interactionCreate', async interaction => {
  if (!interaction.isModalSubmit()) return;
  if (interaction.customId === 'deleteScheduleModal') {
    try {
      // Logs
      console.log('Modal interaction received:', interaction);

      const numberToDelete = interaction.fields.getTextInputValue('scheduleNumberInput');
      const indexToDelete = parseInt(numberToDelete, 10) - 1;

      // Logs
      console.log(`Index to delete: ${indexToDelete}`);

      let schedules = JSON.parse(fs.readFileSync('./schedules.json', 'utf8'));

      // Logs
      console.log('Schedules before deletion:', schedules);

      if (isNaN(indexToDelete) || indexToDelete < 0 || indexToDelete >= schedules.length) {
        await interaction.reply({ content: 'Invalid schedule number.', ephemeral: true });
        return;
      }

      schedules.splice(indexToDelete, 1);
      fs.writeFileSync('./schedules.json', JSON.stringify(schedules, null, 2), 'utf8');

      // Log the schedules after deletion
      console.log('Schedules after deletion:', schedules);

      await interaction.reply({ content: `Schedule number ${numberToDelete} has been deleted.`, ephemeral: true });
    } catch (error) {
      console.error('Error processing modal submission:', error);
      await interaction.reply({ content: `An error occurred while processing your request: ${error.message}`, ephemeral: true });
    }
  }
});


client.login(token);


const updateInterval = 60000; // 60 seconds
console.log(`Current time zone is: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
setInterval(async () => {
  if (!client.statusMessageId || !client.statusChannelId) return;

  const channel = await client.channels.fetch(client.statusChannelId);
  const statusMessage = await channel.messages.fetch(client.statusMessageId);
  //code to be added
  const { playerData, serverStatus } = await fetchPlayerDataAndServerStatus();
const embed = new EmbedBuilder()
  .setColor(serverStatus.online ? 0x00FF00 : 0xFF0000) // Green if online, red if not
  .setTitle(`Server is ${serverStatus.online ? 'online' : 'offline'}`)
  .setTimestamp();

playerData.forEach(player => {
  embed.addFields({ name: player.name, value: `Ping: ${player.ping}`, inline: true });
});

if (playerData.length === 0) {
  embed.addFields({ name: 'No players online', value: '\u200B', inline: false });
}

await statusMessage.edit({ embeds: [embed] });
}, updateInterval);



const axios = require('axios');

async function fetchPlayerDataAndServerStatus() {
  try {
    const url = `http://${serverIp}:${serverPort}/players.json`;

    const response = await axios.get(url);
    const players = response.data;

    if (!Array.isArray(players) || players.length === 0) {
      return {
        playerData: [],
        serverStatus: { online: true }
      };
    }

    let playerData = players.map(player => ({
      name: player.name,
      ping: player.ping
    }));

    return {
      playerData: playerData,
      serverStatus: { online: true }
    };
  } catch (error) {
    console.error('Failed to fetch player data:', error);
    return {
      playerData: [],
      serverStatus: { online: false }
    };
  }
}