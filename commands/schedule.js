const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const cron = require('node-cron');
const schedulesFilePath = './schedules.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Schedule a message in a certain channel.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message text to send.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('channel_id')
        .setDescription('The ID of the channel to send the message to.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('start_time')
        .setDescription('The time to start sending the message (24-hour format: HH:MM).')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('interval_hours')
        .setDescription('How many hours to wait before repeating the message.')
        .setRequired(true)),

  async execute(interaction) {
    const messageText = interaction.options.getString('message');
    const channelId = interaction.options.getString('channel_id');
    const startTime = interaction.options.getString('start_time');
    const intervalHours = interaction.options.getInteger('interval_hours');

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime)) {
      return interaction.reply({ content: 'Invalid time format. Please use HH:MM (24-hour format).', ephemeral: true });
    }

    const [hours, minutes] = startTime.split(':').map(Number);

    // Define next execution time
    let nextExecutionTime = new Date();
    nextExecutionTime.setHours(hours, minutes, 0, 0); // Set seconds and milliseconds to 0?
    if (nextExecutionTime < new Date()) {
      nextExecutionTime.setDate(nextExecutionTime.getDate() + 1);
    }

    const jobId = `job-${Date.now()}`;

    let task = cron.schedule(`0 ${minutes} ${hours} * * *`, async () => {
      try {
        const channel = await interaction.client.channels.fetch(channelId);
        await channel.send(messageText);
        console.log(`Scheduled message sent to channel ID: ${channelId}`);

        // Update next execution time
        nextExecutionTime = new Date(nextExecutionTime.getTime() + (intervalHours * 60 * 60 * 1000));
        updateNextExecutionTime(jobId, nextExecutionTime);
      } catch (error) {
        console.error('Failed to send scheduled message:', error);
      }
    }, {
      scheduled: true
    });


    task.start();
    interaction.client.cronJobs.set(jobId, task);

    saveSchedule({ jobId, messageText, channelId, startTime, intervalHours, nextExecutionTime: nextExecutionTime.toISOString() });

    interaction.reply({ content: `Message scheduled successfully and will repeat every ${intervalHours} hours.`, ephemeral: true });
  }
};

function saveSchedule(scheduleObj) {
  let schedules = [];
  if (fs.existsSync(schedulesFilePath)) {
    const data = fs.readFileSync(schedulesFilePath, 'utf8');
    schedules = JSON.parse(data);
  }

  schedules.push(scheduleObj);
  fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf8');
}


function updateNextExecutionTime(jobId, nextExecutionTime) {
  let schedules = JSON.parse(fs.readFileSync(schedulesFilePath, 'utf8'));
  const scheduleIndex = schedules.findIndex(schedule => schedule.jobId === jobId);

  if (scheduleIndex !== -1) {
    schedules[scheduleIndex].nextExecutionTime = nextExecutionTime.toISOString();
    fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf8');
  }
}
