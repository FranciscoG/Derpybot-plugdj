const triggerPoint = require(process.cwd()+ '/bot/utilities/triggerPoint.js');
const triggerStore = require(process.cwd()+ '/bot/store/triggerStore.js');
const triggerCode = require(process.cwd() + '/bot/utilities/triggerCode.js');

var commands = {};

function unrecognized(bot, trigger) {
  let msg = `*!${trigger}* is not a recognized trigger. `;
  
  let results = triggerStore.recursiveSearch(trigger, 5);
  
  if (!results || results.length === 0) {
    return bot.sendChat(msg);
  }

  let moreMsg = "Did you mean one of these: ";
  if (results.length === 1) {
    moreMsg = "Did you mean this:  ";
  }
  moreMsg += results.join(', ');
  return bot.sendChat(msg + moreMsg);
}

var handleCommands = function(bot, db, data) {
  // first go through the commands in /commands to see if they exist
  if (typeof(commands[data.trigger]) !== 'undefined'){
    return commands[data.trigger](bot, db, data);
  }

  // check if it's an exsiting trigger
  triggerStore.get(bot, db, data, function(trig){
    if (trig !== null) {
      
      // if this is a special code trigger that is wrapped in brackets "{ }"
      if (/^\{.+\}$/.test(trig)) {
        triggerCode(bot, trig, data);
        return;
      }

      var last = trig.split(" ").pop();
      var pointCheck = new RegExp("\\+(props?|flow)(=[a-z0-9_-]+)?", "i");
      if (pointCheck.test(last)) {
        return triggerPoint(bot, db, data, trig, last);
      } else {
        return bot.sendChat(trig);
      }
    } else {
      return unrecognized(bot, data.trigger);
    }
  });

};

module.exports = function(bot, db) { 

  commands = require(process.cwd() + '/bot/loadCommands.js');

  // docs: https://plugcubed.github.io/plugAPI/#plugapieventcommand
  // This is emitted when a chat message starting with the 
  // PlugAPI#commandPrefix is received

  bot.on(bot.events.CHAT_COMMAND, (data) => {
    console.log("CHAT_COMMAND", data);
    
    var cmd = data.message;
    //split the whole message words into tokens
    var  tokens = cmd.split(' ');

    if (tokens.length > 0 && tokens[0].charAt(0) === '!') {
      data.trigger = tokens[0].substring(1).toLowerCase();
      
      //the params are an array of the remaining tokens
      data.params = tokens.slice(1);
      return handleCommands(bot, db, data);
    }
  });

};