const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearmaintenance')
    .setDescription('Clears the server maintenance message.'),

  async execute(interaction) {
    let maintenanceData;
    try {
      maintenanceData = JSON.parse(fs.readFileSync('./maintenance.json', 'utf8'));
    } catch (error) {
      await interaction.reply({ content: 'There was a problem reading the maintenance data.', ephemeral: true });
      return;
    }

    const { maintenanceMessageId, maintenanceChannelId } = maintenanceData;

    if (!maintenanceMessageId || !maintenanceChannelId) {
      await interaction.reply({ content: 'No maintenance message found to clear.', ephemeral: true });
      return;
    }

    const channel = await interaction.client.channels.fetch(maintenanceChannelId);
    const message = await channel.messages.fetch(maintenanceMessageId);
    await message.delete();
    fs.writeFileSync('./maintenance.json', JSON.stringify({}, null, 2), 'utf8');
    await interaction.reply({ content: 'Maintenance message cleared.', ephemeral: true });
  },
};
