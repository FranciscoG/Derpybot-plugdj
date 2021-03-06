/**
 * @param {Object} bot plug.dj bot instance
 * @param {string|string[]} messages string or an array of strings
 */
module.exports = function handleChat(bot, messages) {
  if (Array.isArray(messages)) {
    bot.sendChat(messages.join(" \n"));
  } else {
    bot.sendChat(messages);
  }
};
