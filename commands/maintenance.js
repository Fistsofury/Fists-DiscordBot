const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('maintenance')
    .setDescription('Send a server maintenance message.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The maintenance message to display.')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the maintenance message to.')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const messageText = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel');
    if (![ChannelType.GuildText, ChannelType.GuildNews].includes(channel.type)) {
      await interaction.reply({ content: 'This command can only be used in text channels within a server.', ephemeral: true });
      return;
    }
    if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply({ content: 'I do not have permission to send messages in the chosen channel.', ephemeral: true });
      return;
    }

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('Maintenance Alert')
      .setDescription(messageText)
      .setTimestamp();

    let sentMessage;
    try {
      sentMessage = await channel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send maintenance message:', error);
      await interaction.reply({ content: 'Failed to send the maintenance message.', ephemeral: true });
      return;
    }

    const maintenanceData = {
      maintenanceMessageId: sentMessage.id,
      maintenanceChannelId: channel.id
    };
    fs.writeFileSync('maintenance.json', JSON.stringify(maintenanceData, null, 2), 'utf8');

    await interaction.reply({ content: 'Maintenance message posted!', ephemeral: true });
  },
};
