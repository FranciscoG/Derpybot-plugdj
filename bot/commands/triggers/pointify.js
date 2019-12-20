'use strict';
const triggerStore = require(process.cwd()+ '/bot/store/triggerStore.js');
const triggerPoint = require(process.cwd()+ '/bot/utilities/triggerPoint.js');

function displayHelp(bot){
  bot.sendChat('Make a trigger give a prop or flow point');
  bot.sendChat('!pointify trigger_name prop|flow optional_emoji');
}

module.exports = function(bot, db, data) {
  const chatID = data.id;
  
  if (!data || !data.from || !data.from.username) {
    bot.log('error', 'BOT', '[TRIG] ERROR: Missing data or username');
    return bot.sendChat('An error occured, try again');
  }

  const isMod = bot.havePermission(data.from.id, bot.ROOM_ROLE.MANAGER);
  const isResDJ = bot.havePermission(data.from.id, bot.ROOM_ROLE.RESIDENTDJ);

  // if just "!pointify" was used then we show the help info for using it
  if (data.args.length === 0) {
    return displayHelp(bot);
  }

};