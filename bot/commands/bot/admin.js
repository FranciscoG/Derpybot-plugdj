"use strict";
const _private = require(process.cwd() + "/private/get");
const settings = _private.settings;
const historyStore = require(process.cwd() + "/bot/store/history.js");
// const nmm = require(process.cwd()+ '/bot/store/nmm.js');
// const ff = require(process.cwd()+ '/bot/store/ff.js');
// const _ = require("lodash");

function hasPermission(bot, user) {
  if (!user || !user.id) {
    bot.sendChat("unrecognized user id, try again");
    return false;
  }

  // if not at least a MOD, GTFO!
  if (!bot.havePermission(user.id, bot.ROOM_ROLE.MANAGER)) {
    bot.sendChat("Sorry I only take admin commands from managers and above");
    return false;
  }

  return true;
}

/**
 * !admin - perfom specific admin actions
 * @param {PlugApi} bot
 * @param {object} db
 * @param {import('../../utilities/typedefs').BotCommand} data
 */
module.exports = function (bot, db, data) {
  if (typeof bot !== "object" || typeof data !== "object") {
    return;
  }

  const { user } = data;

  if (!hasPermission(bot, user)) return;

  // now we can assume all chats are from owner

  // if messages was just '!admin' without a any arguments
  if (data.args.length === 0) {
    bot.sendChat("What would you like me to do master?");
    return;
  }

  const [ command, ...extra ] = data.args;

  // now to go through possible commands
  // !admin command extra stuff
  switch (command) {
    case "restart":
      bot.sendChat(":recycle: brb! :recycle:");
      setTimeout(process.exit, 500);
      break;
    case "reconnect":
      bot.sendChat(":phone: Redialing, brb! :computer:");
      bot.close(true);
      setTimeout(function () {
        bot.connect(settings.ROOMNAME);
      }, 5000);
      break;
    case "mute":
      if (!bot.myconfig.muted) {
        bot.sendChat("I shut up now :speak_no_evil:");
        bot.oldSendChat = bot.sendChat;
        bot.myconfig.muted = true;
        bot.sendChat = function (x) {
          return;
        };
      }
      break;
    case "history":
      bot.sendChat("ok, updating my room playlist history");
      historyStore.init(bot);
      break;
    // case "refresh":
    //   bot.sendChat("refreshing all spreadsheet data");
    //   nmm.load(bot);
    //   ff.load(bot);
    //   break;
    case "unmute":
      if (bot.myconfig.muted) {
        bot.sendChat = bot.oldSendChat;
        bot.myconfig.muted = false;
        bot.sendChat("It's good to be back :loudspeaker:");
      }
      break;
    // more commands to come
    default:
      break;
  }
};
