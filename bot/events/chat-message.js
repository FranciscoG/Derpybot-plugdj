'use strict';
const fs = require('fs');
const path = require('path');
const triggerPoint = require(process.cwd()+ '/bot/utilities/triggerPoint.js');
const cleverbot = require( process.cwd() + '/bot/utilities/cleverbot.js');
const triggerStore = require(process.cwd()+ '/bot/store/triggerStore.js');

var commands = {};
var localCommands = process.cwd() + '/bot/commands';


var walk = function(dir) {
  //cache all the commands here by auto requiring them and passing the bot
  //supports directories no matter how deep you go.
  fs.readdirSync(dir).forEach(function(file) {
    var _path = path.resolve(dir, file);
    fs.stat(_path, function(err, stat) {
        if (stat && stat.isDirectory()) {
            walk(_path);
        } else {
          if (file.indexOf('.js') > -1) {
              // add commands set in file if they exist
              if(typeof(require(_path).extraCommands) !== 'undefined'){
                  if(Array.isArray(require(_path).extraCommands)){
                    // add each command in array into overall commands
                    require(_path).extraCommands.forEach(function(command){
                        commands[command] = require(_path);
                    });
                  } else {
                    throw new TypeError('Invalid extraCommands export for file: ' + _path);
                  }
              }

              commands[file.split('.')[0]] = require(_path);
          }
        }
    });
  });
};

var handleCommands = function(bot, db, data) {
  // first go through the commands in /commands to see if they exist
  if (typeof(commands[data.trigger]) !== 'undefined'){
    
    // disbaling raffles for now, might do this via some kind of global config later
    if (data.trigger === 'raffle' || data.trigger === 'join') {
      return bot.sendChat('Raffles have been disabled, gambling is a serious problem!');
    }
    return commands[data.trigger](bot, db, data);
  }

  if (data.params.length === 0) {
    // if it's not an existing command caught by the code above
    // lets check if it's one of the many existing triggers
    triggerStore.get(bot, db, data, function(trig){
      if (trig !== null) {
        var trigSplit  = trig.split(" ");
        var last = trigSplit[trigSplit.length - 1];

        if (last === "+prop") {
          return triggerPoint(bot, db, data, trig, "props");
        } else if (last === "+flow")  {
          return triggerPoint(bot, db, data, trig, "flow");
        } else {
          return bot.sendChat(trig);
        }
      } else {
        return bot.sendChat(`beep boop, *!${data.trigger}* is not a recognized command or trigger, beep boop`);
      }
    });
  }

  return;
  // allow the updating of a trigger using the "+=" operater which appends text to the end
  // example:
  // !test --->  returns "this is a test"
  // !test += bla bla bla ----> will update it to "this is a test bla bla bla"
  let plusEqTest = data.params.length > 1 && data.params[0] === "+=";
  if (plusEqTest) {
    // remove the "+=" from the array
    data.params.shift();
    // create a new string with the rest of the items in the array
    data.triggerAppend = data.params.join(' ');
    triggerStore.append(bot, db, data);
  } 
};


module.exports = function(bot, db) {
    
  walk(localCommands);
  
  bot.on(bot.events.chatMessage, function(data) {
    var cmd = data.message;
    //split the whole message words into tokens
    var  tokens = cmd.split(' ');

    if (tokens.length > 0 && tokens[0].charAt(0) === '!') {
      data.trigger = tokens[0].substring(1).toLowerCase();
      
      //the params are an array of the remaining tokens
      data.params = tokens.slice(1);
      return handleCommands(bot, db, data);
    }

    if (tokens.length === 1 && tokens[0].charAt(0) === '$') {
      bot.sendChat('RIP @mixerbot, we will never forget you.');
      bot.sendChat('http://i.imgur.com/xyny6OZ.gif');
      bot.sendChat('That being said, I\'m the new bot in town!');
      bot.sendChat('Use "!" instead of "$", all the old triggers should be available.');
      return;
    }

    if (tokens[0].toLowerCase() === '@'+bot.myconfig.botName.toLowerCase() && bot.myconfig.cleverbot) {
      data.params = tokens.slice(1);
      return cleverbot(bot, db, data);
    }

  });
};
