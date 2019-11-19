'use strict';
const repo = require(process.cwd()+'/repo');

/**
 * When a new user joins the room, we log their info to the db and we begin storing
 * props and what not
 * @param  {Object} bot PlugAPI instance
 * @param  {Object} db  Firebase db instance
 */
module.exports = function(bot, db) {
  /**
   * USER_JOIN {
        username: String
        sub: Int,
        language: 'en',
        level: Int,
        avatarID: String,
        joined: DateTime (example: '2014-10-10 19:58:27.294995'),
        id: Int(7),
        badge: String,
        role: Int (ex 3000),
        gRole: Int,
        slug: String,
        silver: Boolean,
        guest: Boolean
      }
   */
  bot.on(bot.events.USER_JOIN, function(user) {
    
    if (!user || !user.id) { return ;}
    repo.logUser(db, user, function(user){
      var info = `[JOIN] ${user.username} | ${user.id} | ${user.logType}`;
      bot.log('info', 'BOT', info);
    });

  });
};