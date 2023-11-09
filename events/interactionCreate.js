const { PermissionFlagsBits } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return; 

    const command = client.commands.get(interaction.commandName);

    if (!command) return;
    const memberRoles = interaction.member.roles.cache;
    const hasPermission = config.allowedRoles.some(roleId => memberRoles.has(roleId));

    if (!hasPermission) {
      return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  },
};
