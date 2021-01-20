'use strict';
const urlPrefix = 'https://translate.google.com/#auto/en/';

module.exports = function(bot, db, data) {
  if(!data) { return; }
  
  // if just "!trigger" was used then we show the help info for using it
  if (data.args === void(0) || data.args.length < 1) {
    bot.sendChat('Generates a link to Google Translate link');
    bot.sendChat('usage: !translate text to translate');
    return;
  }

  const content = encodeURIComponent(data.args.join(' '));
  bot.sendChat(`${urlPrefix}${content}`);
};
