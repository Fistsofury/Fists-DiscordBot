const fs = require('fs');
const cron = require('node-cron');
const schedulesFilePath = './schedules.json';

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);
    if (fs.existsSync(schedulesFilePath)) {
      const schedules = JSON.parse(fs.readFileSync(schedulesFilePath, 'utf8'));
      schedules.forEach(scheduleObj => {
        const { jobId, messageText, channelId, intervalHours, nextExecutionTime } = scheduleObj;

        const task = cron.schedule(`0 ${new Date(nextExecutionTime).getMinutes()} ${new Date(nextExecutionTime).getHours()} * * *`, async () => {
          try {
            const channel = await client.channels.fetch(channelId);
            await channel.send(messageText);
            console.log(`Scheduled message sent to channel ID: ${channelId}`);

            updateNextExecutionTime(jobId, new Date(nextExecutionTime).getTime() + intervalHours * 60 * 60 * 1000);
          } catch (error) {
            console.error('Failed to send scheduled message:', error);
          }
        }, {
          scheduled: true
        });


        if (new Date(nextExecutionTime) < new Date()) {
          task.start();
        }

        // Save the task to the cronJobs map?
        client.cronJobs.set(jobId, task);
      });
    }
  },
};

function updateNextExecutionTime(jobId, nextExecutionTime) {
  let schedules = JSON.parse(fs.readFileSync(schedulesFilePath, 'utf8'));
  const scheduleIndex = schedules.findIndex(schedule => schedule.jobId === jobId);

  if (scheduleIndex !== -1) {
    schedules[scheduleIndex].nextExecutionTime = new Date(nextExecutionTime).toISOString();
    fs.writeFileSync(schedulesFilePath, JSON.stringify(schedules, null, 2), 'utf8');
  }
}
