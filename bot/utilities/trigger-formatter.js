"use strict";
/// require('../utilities/typedefs');
/**
 * This formats a Trigger text with dynamic replacements
 */

/**
 * 
 * @param {string} str 
 * @returns {array} array of tokens
 */
function getTokens(str) {
  var found = [];

  var openToken = false;
  var storage = "";

  str.split("").forEach(function(char) {
    if (char === "%" && !openToken) {
      openToken = true;
      storage = "%";
      return;
    }
    if (char === "%" && openToken) {
      openToken = false;
      storage += "%";
      found.push(storage);
      return;
    }
    if (openToken) {
      storage += char;
    }
  });

  return found;
}

function regEsc(s) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * handle replacing indexed placeholder with data args from the commands
 *
 * @param {string} text - the full text of the trigger
 * @param {string} arg - current numbered argument index to replace
 * @param {PlugAPI} bot - the PlugApi instance
 * @param {BotCommand} data - full data object from the event callback
 * @returns
 */
function handleNumbered(text, arg, bot, data) {
  let params = data.args;

  // if only %n%, then replace
  if (/^%[0-9]+%$/.test(arg)) {
    let num = parseInt(arg.replace("%", ""), 10);
    let item = new RegExp(regEsc(arg), "g");
    if (params[num]) {
      text = text.replace(item, params[num]);
    }
  }

  // now handle default params
  if (/^%[0-9]+\|/.test(arg)) {
    let parts = arg.replace(/%/g, "").split("|");

    let dflt = parts[1];
    let num = parseInt(parts[0], 10);

    let item = new RegExp(regEsc(arg), "g");
    if (dflt === "me") {
      dflt = data.from.username;
    }
    if (dflt === "dj") {
      dflt = bot.getDJ().username;
    }
    text = text.replace(item, params[num] || dflt);
  }

  return text;
}

function handleSpreadsheets(text, c, bot) {
  if (!bot.sheetsData) {
    return text;
  }

  let parts = c.replace(/%/g, "").split(".");
  let sheet = bot.sheetsData[parts[0]];

  if (sheet) {
    // console.log(sheet);
    let item = sheet[parts[1]];
    // console.log( item );
    text = text.replace(c, item);
  }
  return text;
}

/**
 * 
 * @param {string} text 
 * @param {PlugAPI} bot 
 * @param {BotCommand} data 
 */
module.exports = function triggerFormatter(text, bot, data) {
  var tokens = getTokens(text);

  tokens.forEach(function(token) {
    if (token === "%dj%") {
      // replace with current DJ name
      text = text.replace("%dj%", "@" + bot.getDJ().username);
    }

    if (token === "%me%") {
      // replace with user who entered chat name
      text = text.replace("%me%", data.user.username);
    }

    // if (/%[a-z]+\./.test(c)) {
    //   text = handleSpreadsheets(text,c,bot);
    // }

    // if it's a numbered one
    if (/%[0-9]/.test(token)) {
      text = handleNumbered(text, token, bot, data);
    }
  });

  return text;
};
