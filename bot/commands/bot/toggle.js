'use strict';
function hasPermission(bot, user) {
  if (!user || !user.id) {
    bot.sendChat('unrecognized user id, try again');
    return false;
  }

  // if not at least a MOD, GTFO!
  if (!bot.havePermission(user.id, bot.ROOM_ROLE.MANAGER)) {
    bot.sendChat('Sorry only Managers and above can toggle a configuration');
    return false;
  }

  return true;
}

/**
 * !toggle configItem - toggles boolean config values
 * @param {PlugApi} bot
 * @param {object} db
 * @param {import('../../utilities/typedefs').BotCommand} data
 */
module.exports = function(bot, db, data) {
  if (typeof bot !== 'object' || typeof data !== 'object') {
    return;
  }

  const { user } = data;
  
  if (!hasPermission(bot,user)) return;

  // config item to toggle
  var [ item ] = data.args;

  if (!item) {
    bot.sendChat(`You must provide a config item to toggle. See full list here: http://franciscog.com/DerpyBot/commands/#config`);
    return;
  }

  if (typeof bot.myconfig[item] === "undefined") {
    bot.sendChat(`${item} is not a valid config item`);
    return;
  }

  if (typeof bot.myconfig[item] !== "boolean") {
    bot.sendChat(`You can only toggle true/false config items`);
    return;
  }

  // toggle that baby!
  bot.myconfig[item] = !bot.myconfig[item];
  bot.sendChat(`${item} is now set to *${bot.myconfig[item]}*. Note: this will reset if the bot reboots`);
};