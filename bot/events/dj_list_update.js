/***************************************************************
 * Event: DJ_LIST_UPDATE
 * 
 * https://plugcubed.github.io/plugAPI/#plugapieventdj_list_update
 * 
 * This is emitted when the waitList has changed.
 */

'use strict';
const checkHistory = require(process.cwd()+ '/bot/utilities/checkHistory.js');
const _ = require('lodash');
const repo = require(process.cwd()+'/repo');

function searchUsersObj(bot, username) {
  for (let key in bot.allUsers) {
    if (bot.allUsers[key].username === username) {
      return [key, bot.allUsers[key]];
    }
  }
}

function checkNewUser(bot, db, user) {
  if (!bot || !db || !user) { return; }

  let cachedUser = searchUsersObj(bot, user.username);
  if (cachedUser && user.dubs <= 20 && !cachedUser[1].introduced) {
    // console.log(user.username, user.dubs, cachedUser[1].introduced);

    bot.sendChat(`${user.username} is new to the mixer, and just joined the queue. Let's all be supportive!`);
    cachedUser[1].introduced = true;
    repo.updateUser(db, cachedUser[0], cachedUser[1], function(err){
      if (err) {
        bot.log('error', 'REPO', `Error updating introduced for user ${user.username}`);
      }
    });
  }
}

module.exports = function(bot, db) {
  bot.on(bot.events.DJ_LIST_UPDATE, function(data) {
    if (!data) {
      return bot.log('error', 'BOT', 'DJ_LIST_UPDATE: data object missing');
    }

    if (!Array.isArray(data.queue)) {
      return bot.log('error', 'BOT', 'queue is not an array');
    }

    if (data.queue.length > 0) {
      data.queue.forEach(function(q){
        checkHistory(bot, q);
        checkNewUser(bot, db, q.user);
      });
    }

  });
};