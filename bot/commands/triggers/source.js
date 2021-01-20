"use strict";
const moment = require("moment");
const repos = require('../../../repos');

module.exports = function(bot, db, data, isBrad = false) {
  if (data.args === void 0 || data.args.length < 1) {
    return bot.sendChat("*usage:* !source <trigger_name>");
  }

  if (data.args.length > 1) {
    bot.sendChat("only one trigger at a time");
    return bot.sendChat("*usage:* !source <trigger_name>");
  }

  const trigger = data.args[0];

  if (trigger.charAt(0) === "!") {
    trigger = trigger.substring(1);
  }

  repos.triggers.getTrigger(db, trigger, function(val) {
    if (val !== null) {
      const keys = Object.keys(val);
      const result = val[keys[0]];
      const theAuthor = result.Author || "unknown";
      let extendedInfo = false;
      let chatMsg = `the trigger ${trigger}`;
      let chatMsgEnd = ` was created/updated by ${theAuthor}`;

      if (isBrad) {
        if (["brad", "bluesfart"].includes(theAuthor.toLowerCase())) {
          return bot.sendChat("Yes");
        }
        return bot.sendChat(`No, it was ${theAuthor}`);
      }

      if (result.createdOn && result.createdBy) {
        let when = moment(result.createdOn).format("MMM Do YYYY");
        chatMsg += ` was created by ${result.createdBy} on ${when}`;
        extendedInfo = true;
      }

      if (result.lastUpdated && result.status && result.status === "updated") {
        let when = moment(result.lastUpdated).format("MMM Do YYYY");
        chatMsg += ` and was last updated by ${theAuthor} on ${when}`;
        extendedInfo = true;
      }

      if (extendedInfo) {
        return bot.sendChat(chatMsg);
      } else {
        return bot.sendChat(chatMsg + chatMsgEnd);
      }
    }
  });
};
