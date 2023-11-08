const fs = require('fs');
const cron = require('node-cron');
const schedulesFilePath = './schedules.json';

function loadAndScheduleMessages(client) {
  if (!fs.existsSync(schedulesFilePath)) {
    return; // No schedules to load
  }

  const schedules = JSON.parse(fs.readFileSync(schedulesFilePath, 'utf8'));
  schedules.forEach(scheduleObj => {
    const { messageText, channelId, intervalHours, nextExecutionTime } = scheduleObj;
    const timeUntilNextExecution = new Date(nextExecutionTime).getTime() - Date.now();
    let start = new Date();
    if (timeUntilNextExecution < 0) {
      start = new Date(); 
    } else {
      start = new Date(nextExecutionTime);
    }

    const minutes = start.getMinutes();
    const hours = start.getHours();
    const cronSchedule = `${minutes} ${hours} */${intervalHours} * * *`;
    cron.schedule(cronSchedule, async () => {
      try {
        const channel = await client.channels.fetch(channelId);
        await channel.send(messageText);
        console.log(`Scheduled message sent to channel ID: ${channelId}`);

        updateNextExecutionTime(channelId, new Date(), intervalHours);
      } catch (error) {
        console.error('Failed to send scheduled message:', error);
      }
    }, {
      scheduled: true,
      timezone: "UTC" // Replace with your timezone
    });
  });
}


module.exports.loadAndScheduleMessages = loadAndScheduleMessages;
