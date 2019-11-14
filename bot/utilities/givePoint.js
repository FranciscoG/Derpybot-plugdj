'use strict';
var repo = require(process.cwd()+'/repo');
var userStore = require(process.cwd()+ '/bot/store/users.js');

/**
 * Save point to db and send chat message
 * @param {Object} bot       PlugAPI instance
 * @param {Object} db        Firebase instance
 * @param {Object} data      user info
 * @param {Object} recipient target user info
 */
function addPoint(bot, db, data, recipient, opts) {
  if (!recipient) {return;}
  repo.incrementUser(db, recipient, opts.pointType, function(user){
    if (!user) {return;}
    userStore.addPoint( opts.repeatCheck, data.user.id);
    bot.sendChat( opts.successMsg(data.user, user) );
  });
}


module.exports = function(bot, db, data, opts) {
  const botUserId = bot.getUser().id;
  const dj = bot.getDJ();

  // check if user is the bot
  if (data.user.id === botUserId) {
    return bot.sendChat('I am not allowed to award points');
  }

  if(!bot.getDJ()) {
      return bot.sendChat('There is no DJ playing!');
  }

  // if user just wrote "![pointType]"
  if (data.mentions.length === 0 && data.args.length === 0){

    if (!bot.myconfig.allow_multi_prop ) {
      // no repeat giving
      if(userStore.hasId( opts.repeatCheck, data.user.id) ) {
        return bot.sendChat( opts.noRepeatPointMsg(data.user.username) );
      }
    }

    // can not give points to self
    if(data.user.username === dj.username){
      return bot.sendChat( opts.noSelfAwardingMsg(data.user.username) );
    }

    return addPoint(bot, db, data, dj, opts);
  }

  // if user wrote ![pointType] @person1 @person2 ...
  if (data.mentions.length > 1) {
    return bot.sendChat( opts.noMultiAwarding(data.user.username) );
  }

  // if user wrote ![pointType] recipient (but didn't use the '@'')
  if (data.mentions.length === 0 && data.args.length > 0) {
    return bot.sendChat( opts.badFormatMsg(data.user.username) );
  }

  // if user wrote ![pointType] @recipient
  if (data.mentions.length === 1) {

    let recipient = data.mentions[0];

    // can't give points to yourself
    // but don't show a warning, just remain silent
    if (recipient.id === data.user.id) {
      // return bot.sendChat( opts.noSelfAwardingMsg(data.user.username) );
      return;
    }

    if (!bot.myconfig.allow_multi_prop ) {
      // can't give points twice for the same song
      if(userStore.hasId( opts.repeatCheck, data.user.id) ) {
        return bot.sendChat( opts.noRepeatPointMsg(data.user.username) );
      }
    }

    return addPoint(bot, db, data, recipient, opts);
  }
};