'use strict';
const _ = require('lodash');
const roleChecker = require(process.cwd()+ '/bot/utilities/roleChecker.js');

module.exports = function(bot, db, data) {
  return bot.sendChat("The !dj command is disabled for now until some issues are resolved");

  // if not at least a MOD, GTFO!
  if ( !roleChecker(bot, data.user, bot.ROOM_ROLE.MANAGER) ) {
    bot.sendChat('sorry, !dj can only be used by mods');
  }
  
  // https://plugcubed.github.io/plugAPI/#plugapijoinbooth
  bot.joinBooth();

  // https://plugcubed.github.io/plugAPI/#plugapileavebooth
  // !dj stop
  // to stop DJing and clear Queue
  bot.leaveBooth();
};