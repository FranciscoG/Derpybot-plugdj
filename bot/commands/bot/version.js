'use strict';
var pkg = require(process.cwd() + '/package.json');

/**
 * Displays the current version of the bot listed inthe pacakge.json
 * @param  {Object} bot Dubapi instance
 */
module.exports = function(bot) {
  return bot.sendChat(bot.getUser().username + ' version: ' + pkg.version);
};

module.exports.extraCommands = ['v', 'ver'];