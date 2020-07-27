'use strict';

// TODO: use last.fm to

/**
 * Checks the db to see who was the last person who played the current song
 * @param  {Object} bot  dubapi instance
 * @param  {Object} db   Firebase instance
 * @param  {Object} data Room info object
 */
module.exports = function(bot, db, data) {
  return bot.sendChat('*lastplay* has been disabled cause it was broke, like @ciscog\'s ability to code. oooooh burn! :fire: :fire:');
};