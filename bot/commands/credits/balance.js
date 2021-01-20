'use strict';
const repos = require('../../../repos');

function sayMyBalance(bot, user) {
  const flowS = user.flow > 1 || user.flow <= 0 ? 's' : '';
  const propS = user.props > 1 || user.props <= 0 ? 's' : '';

  bot.sendChat(`@${user.username} you have ${user.props} prop${propS} :fist: and ${user.flow} flowpoint${flowS} :surfer:`);
}

function sayTheirBalance(bot, whoAsked, user) {
  const flowS = user.flow > 1 || user.flow <= 0 ? 's' : '';
  const propS = user.props > 1 || user.props <= 0 ? 's' : '';

  bot.sendChat(`@${whoAsked}, the user @${user.username} has ${user.props} prop${propS} :fist: and ${user.flow} flowpoint${flowS} :surfer:`);
}

async function lookUpBalance(bot, db, whoAsked, whoForId, which){
  try {
    const user = await repos.users.findUserById(db, whoForId);
    if (user !== null) {
      if (user.props === void(0) || user.props === null) { user.props = 0; }
      if (user.flow === void(0) || user.flow === null) { user.flow = 0; }
      
      if (!which || which === 'mine' ) {
        sayMyBalance(bot, user);
      } else {
        sayTheirBalance(bot, whoAsked,  user);
      }
    } else {
      bot.sendChat(`Strange, data for that person was not found!`);
    }
  } catch (e) {
    bot.sendChat(`Strange, data for that person was not found!`);
  }
}

/**
 * !balance - shows Prop and Flow points for user who sent command
 * !balance @username - shows points for another user
 * @param {import('plugapi')} bot
 * @param {import('firebase-admin').database.Database} db
 * @param {import('../../utilities/typedefs').BotCommand} data
 */
function balance(bot, db, data) {
  if (!bot || !db || !data) {
    return;
  }
  
  if (data.args.length === 0) {
    return lookUpBalance(bot, db, data.user.username, data.user.id, 'mine');
  }

  if (data.args.length > 1) {
    return bot.sendChat(`@${data.user.username} you can only lookup one person`);
  }

  if (typeof data.args[0] === 'string') {
    return bot.sendChat(`@${data.user.username}, use '!balance @[username]' to check another user's balance`);
  }

  const [recipient] = data.mentions;

  if (!recipient){
    bot.sendChat(`@${data.user.username}, that user was not found!`);
    return;
  }

  return lookUpBalance(bot, db, data.user.username, recipient.id, 'theirs');

}

module.exports = balance;
module.exports.extraCommands = ['stats', 'score'];