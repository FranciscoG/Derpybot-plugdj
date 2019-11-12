'use strict';
const repo = require(process.cwd()+'/repo');

/**
 * When a new user joins the room, we log their info to the db and we begin storing
 * props and what not
 * @param  {Object} bot Dubapi instance
 * @param  {Object} db  Firebase db instance
 */
module.exports = function(bot, db) {
  bot.on(bot.events.USER_JOIN, function(data) {

    repo.logUser(db, data.user, function(user){
      var info = `[JOIN] ${user.username} | ${user.id} | ${user.dubs} | ${user.logType}`;
      bot.log('info', 'BOT', info);
    });

  });
};