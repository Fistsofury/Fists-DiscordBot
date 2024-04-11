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
    .setName('checknonactiveplayers')
    .setDescription('Check for non-active players who have not logged in over 30 days.'),

  async execute(interaction) {
    try {
      const results = await queryNonActivePlayers();


      const nonActivePlayers = results.map(row => `Steam user: ${row.steamname} Name: ${row.firstname}, ${row.lastname} last logged in on ${row.LastLogin}`);


      await interaction.reply({
        content: `Non-Active Players:\n${nonActivePlayers.join('\n')}`,
        ephemeral: false
      });
    } catch (error) {
      console.error('Error checking non-active players:', error);
      await interaction.reply({ content: 'An error occurred while checking non-active players.', ephemeral: true });
    }
  },
};

function queryNonActivePlayers() {
  return new Promise((resolve, reject) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    pool.query(
      'SELECT steamname, firstname, lastname, LastLogin FROM characters WHERE LastLogin < ?',
      [thirtyDaysAgo],
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
