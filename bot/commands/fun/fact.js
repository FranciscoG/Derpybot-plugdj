"use strict";
const got = require("got");

module.exports = async function (bot, db) {
  try {
    const response = await got("http://numbersapi.com/random/trivia");
    bot.sendChat(response.body);
  } catch (error) {
    bot.sendChat('Sorry an error occured trying to get a fact');
    bot.log('error', 'BOT', `[!fact] ${error.message}`);
  }
};
