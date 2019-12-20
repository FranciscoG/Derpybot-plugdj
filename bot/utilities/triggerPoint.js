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
 * @param {Object} bot       bot api instance
 * @param {Object} db        Firebase instance
 * @param {Object} data      pass through of the data object from the event
 * @param {Object} recipient target User who is getting the point
 * @param {string} pointType what type of point: props or flow
 * @param {string} repeatCheck property to check in the currently playing song
 * @param {string} pointEmoji which emoji to display
 * @returns {Promise} with success message
 */
async function addPoint(bot, db, data, recipient, pointType, repeatCheck, pointEmoji) {
  const user = await repo.incrementUser(db, recipient, pointType);
  if (!user) {Promise.reject('user not found');}
  userStore.addPoint( repeatCheck, data.from.id);
  return Promise.resolve( successMsg(user, pointType, pointEmoji) );
}

/**
 * @param {object} bot PlugAPI instance
 * @param {object} db Firebase admin database instance
 * @param {object} data event object from bot.events.CHAT_COMMAND
 * @param {string} trig the current trigger text being processed
 * @param {string} type string indicating which type of prop to give 
 *                      +prop, +flow, +prop=fire, +flow=surfer
 * @returns {Promise.resolve<array>} array of strings that will be sent to the chat
 */
module.exports = async function(bot, db, data, trig, type) {
  const messages = [];

  if (data.from.username === bot.getUser().username) {
    messages.push('I am not allowed to award points');
    return Promise.resolve(messages);
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
    messages.push(strippedMsg);
  }

  if(!bot.getDJ()) {
    messages.push('There is no DJ playing!');
    return Promise.resolve(messages);
  }

  if (!bot.myconfig.allow_multi_prop ) {
    // no repeat giving
    if ( userStore.hasId( repeatCheck, data.from.id ) ) {
      messages.push(noRepeatPointMsg(data.from.username, pointEmoji));
      return Promise.resolve(messages);
    }
  }

  // the person being propped
  var dj = bot.getDJ();
  
  // can not give points to self
  // but don't show a warning, just remain silent
  if(data.from.username === dj.username){
    return Promise.resolve(messages);
  }
  
  try {
    let pointMsg = await addPoint(bot, db, data, dj, pointType, repeatCheck, pointEmoji);
    messages.push(pointMsg);
  } catch (e) {
    bot.log('error', 'BOT', `triggerPoint could not incrementUser: ${e.message}`);
  }
  
  return Promise.resolve(messages);
};