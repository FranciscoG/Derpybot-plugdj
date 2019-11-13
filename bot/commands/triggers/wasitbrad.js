'use strict';
const source = require("./source");

/** 
 * !wasitbrad
 * tells you whether or not user Brad made the trigger or not
*/

function help(bot){
  bot.sendChat('*usage:* !wasitbrad <trigger_name>');
}

module.exports = function (bot, db, data) {
  if (data.args === void(0) || data.args.length < 1) {
    return help(bot);
  }

  if (data.args.length > 1) {
    bot.sendChat('only one trigger at a time');
    return help(bot);
  }

  source(bot, db, data, true);
};