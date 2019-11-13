'use strict';
const _ = require('lodash');

module.exports = function(bot, db, data) {
  return bot.sendChat("The !dj command is disabled for now until some issues are resolved");

  const { user } = data
  if (!user || !user.id) {
    return
  }

  // if not at least a MOD, GTFO!
  if ( !bot.havePermission(user.id, bot.ROOM_ROLE.MANAGER) ) {
    bot.sendChat('sorry, !dj can only be used by mods');
  }
  
  // https://plugcubed.github.io/plugAPI/#plugapijoinbooth
  bot.joinBooth();

  // https://plugcubed.github.io/plugAPI/#plugapileavebooth
  // !dj stop
  // to stop DJing and clear Queue
  bot.leaveBooth();
};