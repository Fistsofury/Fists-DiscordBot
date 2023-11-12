const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { serverIp, serverPort } = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('channel')
    .setDescription('Set the channel for server status updates.')
    .addStringOption(option =>
      option.setName('channel_id')
        .setDescription('The ID of the channel')
        .setRequired(true)),
  async execute(interaction) {
    const channelId = interaction.options.getString('channel_id');
    console.log(`Channel ID set to: ${channelId}`);

    const channel = await interaction.client.channels.fetch(channelId);
    if (!channel) {
      return interaction.reply({ content: 'Could not find channel.', ephemeral: true });
    }

    const { playerData, totalPages } = await fetchPlayerData(1);
    const buttons = createButtons(1, totalPages);

    const embed = createPlayerEmbed(playerData, 1, totalPages);

    const statusMessage = await channel.send({ embeds: [embed], components: [buttons] });

    interaction.client.statusMessageId = statusMessage.id;
    interaction.client.statusChannelId = channelId;

    // Set up periodic updates
    setInterval(async () => {
      try {
        await updateStatusMessage(interaction.client);
      } catch (error) {
        console.error('Error in periodic update:', error);
      }
    }, 60000); // 60 seconds

    await interaction.reply({ content: 'Channel set successfully!', ephemeral: true });
  },
  async handlePagination(interaction) {
    console.log('Handling pagination...'); // Debugging

    try {
      const embed = interaction.message.embeds[0];
      const footer = embed.footer.text;
      const [currentPage, totalPages] = footer.match(/\d+/g).map(Number);

      let newPage = currentPage;
      if (interaction.customId === 'previous') {
        newPage = Math.max(1, currentPage - 1);
      } else if (interaction.customId === 'next') {
        newPage = Math.min(totalPages, currentPage + 1);
      }

      console.log(`Current page: ${currentPage}, New page: ${newPage}`); // Debugging

      const { playerData } = await fetchPlayerData(newPage);
      const updatedEmbed = createPlayerEmbed(playerData, newPage, totalPages);
      const buttons = createButtons(newPage, totalPages);

      // Update the original message
      await interaction.update({ embeds: [updatedEmbed], components: [buttons] });
    } catch (error) {
      console.error('Error in handlePagination:', error);
      await interaction.followUp({ content: 'There was an error processing your request.', ephemeral: true });
    }
  }
};

async function fetchPlayerData(page) {
  const playersPerPage = 10;
  try {
    const url = `http://${serverIp}:${serverPort}/players.json`;
    const response = await axios.get(url);
    const players = response.data;

    const totalPages = Math.ceil(players.length / playersPerPage);
    const pageStart = (page - 1) * playersPerPage;
    const pageEnd = pageStart + playersPerPage;
    const playerData = players.slice(pageStart, pageEnd).map(player => ({
      name: player.name,
      ping: player.ping
    }));

    return { playerData, totalPages };
  } catch (error) {
    console.error('Failed to fetch player data:', error);
    return { playerData: [], totalPages: 0 };
  }
}

function createButtons(currentPage, totalPages) {
  return new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('previous')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 1),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Next')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages)
    );
}

function createPlayerEmbed(playerData, currentPage, totalPages) {
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Server Status Updates')
    .setFooter({ text: `Page ${currentPage} of ${totalPages}` })
    .setTimestamp();

  playerData.forEach(player => {
    embed.addFields({ name: player.name, value: `Ping: ${player.ping}`, inline: true });
  });

  if (playerData.length === 0) {
    embed.addFields({ name: 'No players online', value: '\u200B', inline: false });
  }

  return embed;
}

async function updateStatusMessage(client) {
  try {
    const channel = await client.channels.fetch(client.statusChannelId);
    const message = await channel.messages.fetch(client.statusMessageId);

    const { playerData, totalPages } = await fetchPlayerData(1); 
    const updatedEmbed = createPlayerEmbed(playerData, 1, totalPages);
    const buttons = createButtons(1, totalPages);

    await message.edit({ embeds: [updatedEmbed], components: [buttons] });
    console.log('Status message updated successfully'); // Some of them logs
  } catch (error) {
    console.error('Failed to update status message:', error);
  }
}
