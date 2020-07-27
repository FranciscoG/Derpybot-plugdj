'use strict';

// TODO: use last.fm api

/**
 * Checks the db to see who was the first person who played the current song
 * @param  {Object} bot  dubapi instance
 * @param  {Object} db   Firebase instance
 * @param  {Object} data Room info object
 */
module.exports = function(bot, db, data) {
  return bot.sendChat('*firstplay* has been disabled cause it did not work. :frowning:');
};