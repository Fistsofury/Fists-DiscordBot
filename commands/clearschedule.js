const fs = require('fs');
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType
} = require('discord.js');
const schedulesFilePath = './schedules.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clearschedule')
    .setDescription('Clear scheduled messages.'),

  async execute(interaction) {
    if (interaction.type === InteractionType.ModalSubmit) {
      if (interaction.customId === 'deleteScheduleModal') {
        try {
          const numberToDelete = interaction.fields.getTextInputValue('scheduleNumberInput');
          const indexToDelete = parseInt(numberToDelete) - 1;
          let schedules = JSON.parse(fs.readFileSync(schedulesFilePath, 'utf8'));
          if (isNaN(indexToDelete) || indexToDelete < 0 || indexToDelete >= schedules.length) {
            await interaction.reply({ content: 'Invalid schedule number.', ephemeral: true });
            return;
          }

          schedules.splice(indexToDelete, 1);
          fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf8');
          await interaction.reply({ content: `Schedule number ${numberToDelete} has been deleted.`, ephemeral: true });
        } catch (error) {
          console.error('Error processing modal submission:', error);
          await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
        }
        return;
      }
    }

    if (!fs.existsSync(schedulesFilePath)) {
      await interaction.reply({ content: 'There are no scheduled messages to clear.', ephemeral: true });
      return;
    }

    const data = fs.readFileSync(schedulesFilePath, 'utf8');
    let schedules = JSON.parse(data);

    if (schedules.length === 0) {
      await interaction.reply({ content: 'There are no scheduled messages to clear.', ephemeral: true });
      return;
    }

    let message = 'Which scheduled message would you like to delete?\n';
    schedules.forEach((schedule, index) => {
      message += `${index + 1}: Message "${schedule.messageText}" scheduled for channel <#${schedule.channelId}> at ${schedule.startTime} every ${schedule.intervalHours} hours.\n`;
    });
    message += 'Click the button corresponding to the schedule you wish to delete.';

    // Prepare buttons for user 
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('delete_one')
          .setLabel('Delete specific schedule')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('delete_all')
          .setLabel('Delete all schedules')
          .setStyle(ButtonStyle.Danger),
      );

    // button part
    await interaction.reply({ content: message, components: [row], ephemeral: true });

    // Pick a button after wait
    const filter = i => ['delete_one', 'delete_all'].includes(i.customId) && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', async i => {
      if (i.customId === 'delete_one') {
        const modal = new ModalBuilder()
          .setCustomId('deleteScheduleModal')
          .setTitle('Delete a Specific Schedule');

        const numberInput = new TextInputBuilder()
          .setCustomId('scheduleNumberInput')
          .setLabel('Which schedule number do you want to delete?')
          .setStyle(TextInputStyle.Short)
          .setPlaceholder('Enter a number')
          .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(numberInput);

        modal.addComponents(firstActionRow);


        await i.showModal(modal);
      } else if (i.customId === 'delete_all') {

        schedules = [];
        fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf8');
        await i.update({ content: 'All scheduled messages have been deleted.', components: [], ephemeral: true });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: 'No selection was made.', components: [] });
      }
    });
  }
};

