const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
    if (!channel) return interaction.reply('Could not find channel.');

    const embed = new EmbedBuilder()
      .setColor(0x0099FF) // Set the color of the embed
      .setTitle('Server Status Updates Channel Set') // Set the title of the embed
      .setDescription('This channel will now receive server status updates.') // Set the description
      .addFields(
        { name: 'Channel', value: channel.toString(), inline: true }, // Show the channel name
        { name: 'Next Update', value: 'Connecting with Server...', inline: true } // Placeholder for next update
      )
      .setFooter({ text: 'Fistsofury is a legend' }) // Add a footer
      .setTimestamp(); // Set the timestamp for the embed

    const statusMessage = await channel.send({ embeds: [embed] });

    // Save the message ID and channel ID for later use?
    interaction.client.statusMessageId = statusMessage.id;
    interaction.client.statusChannelId = channelId;

    await interaction.reply({ content: 'Channel set successfully!', ephemeral: true });
  }
};
