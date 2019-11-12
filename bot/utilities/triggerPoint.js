'use strict';
var repo = require(process.cwd()+'/repo');
var userStore = require(process.cwd()+ '/bot/store/users.js');

var successMsg = function(recipient, pointType, pointEmoji){
  if (pointType === 'flow') {
    return `@${recipient.username} now has ${recipient[pointType]} flowpoint :${pointEmoji}:`;
  } 
  return `@${recipient.username} now has ${recipient[pointType]} props :${pointEmoji}:`;
};

var noRepeatPointMsg = function(username, pointEmoji){
  return `@${username}, you have already given a :${pointEmoji}: for this song`;
};


/**
 * Save point to db and send chat message
 * @param {Object} bot       Dubapi instance
 * @param {Object} db        Firebase instance
 * @param {Object} data      user info
 * @param {Object} recipient target user info
 */
function addPoint(bot, db, data, recipient, pointType, repeatCheck, pointEmoji) {
  repo.incrementUser(db, recipient, pointType, function(user){
    if (!user) {return;}
    userStore.addPoint( repeatCheck, data.from.id);
    bot.sendChat( successMsg(user, pointType, pointEmoji) );
  });
}


module.exports = function(bot, db, data, trig, type) {
  if (data.from.username === bot.getUser().username) {
    return bot.sendChat('I am not allowed to award points');
  }

  type = type.split('=');

  var pointType = 'props'; // this must match the name in the db
  var repeatCheck = 'usersThatPropped';
  var pointEmoji = type[1] || 'fist';
  
  if (type[0] === '+flow') {
    pointType = 'flow'; // this must match the name in the db
    repeatCheck = 'usersThatFlowed';
    pointEmoji = type[1] || 'surfer';
  }

  // send the trigger no matter what but remove the +prop/+flow stuff
  var re = new RegExp("\\+"+pointType+"?(=[a-z0-9_-]+)?$", "i");
  var strippedMsg = trig.replace(re,"");
  if (strippedMsg !== '') {
    bot.sendChat(strippedMsg);
  }

  if(!bot.getDJ()) {
    return bot.sendChat('There is no DJ playing!');
  }

  if (!bot.myconfig.allow_multi_prop ) {
    // no repeat giving
    if ( userStore.hasId( repeatCheck, data.from.id ) ) {
      return bot.sendChat( noRepeatPointMsg(data.frml.username, pointEmoji) );
    }
  }

  var dj = bot.getDJ();
  
  // can not give points to self
  // but don't show a warning, just remain silent
  if(data.from.username === dj.username){
    // return bot.sendChat( noSelfAwardingMsg(data.from.username) );
    return;
  }

  return addPoint(bot, db, data, dj, pointType, repeatCheck, pointEmoji);

};