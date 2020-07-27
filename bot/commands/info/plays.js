'use strict';

// TODO: use last.fm


/**
 * Command to show number of plays current song including last play info
 * @param  {Object} bot  dubapi instance
 * @param  {Object} db   Firebase instance
 * @param  {Object} data Room info object
 */
module.exports = function(bot, db, data) {
  return bot.sendChat('*plays* has been disabled until further notice.');
};