const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql');
const config = require('../config.json');

const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkplayer')
    .setDescription('Check player information by mentioning them.')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to check.')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser('user');

      const results = await queryPlayerInfo(user.id);

      if (results.length === 0) {
        await interaction.reply({ content: 'No player information found for the specified user.', ephemeral: true });
        return;
      }

      const playerInfo = results.map(row => `Steam Name: ${row.steamname}\nFirst Name: ${row.firstname}\nLast Name: ${row.lastname}\nMoney: ${row.money}\nLast Login: ${row.LastLogin}\nJob: ${row.job}\nIs Dead: ${row.isdead ? 'Yes' : 'No'}`).join('\n\n');

      await interaction.reply({ content: `Player Information for ${user.username}:\n\n${playerInfo}` });
    } catch (error) {
      console.error('Error checking player information:', error);
      await interaction.reply({ content: 'An error occurred while checking player information.', ephemeral: true });
    }
  },
};

function queryPlayerInfo(discordId) {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT steamname, firstname, lastname, money, LastLogin, job, isdead FROM characters WHERE discordid = ?',
      [discordId],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
}
