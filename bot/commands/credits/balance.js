'use strict';
var repo = require(process.cwd()+'/repo');

function sayMyBalance(bot, user) {
  var flowS = user.flow > 1 || user.flow <= 0 ? 's' : '';
  var propS = user.props > 1 || user.props <= 0 ? 's' : '';

  bot.sendChat(`@${user.username} you have ${user.props} prop${propS} :fist: and ${user.flow} flowpoint${flowS} :surfer:`);
}

function sayTheirBalance(bot, whoAsked, user) {
  var flowS = user.flow > 1 || user.flow <= 0 ? 's' : '';
  var propS = user.props > 1 || user.props <= 0 ? 's' : '';

  bot.sendChat(`@${whoAsked}, the user @${user.username} has ${user.props} prop${propS} :fist: and ${user.flow} flowpoint${flowS} :surfer:`);
}

function lookUpBalance(bot, db, whoAsked, whoFor, which){
  repo.findUserById(db, whoFor.id, function(user){
    if (user !== null) {
      if (user.props === void(0) || user.props === null) { user.props = 0; }
      if (user.flow === void(0) || user.flow === null) { user.flow = 0; }
      
      if (!which || which === 'mine' ) {
        sayMyBalance(bot, user);
      } else {
        sayTheirBalance(bot, whoAsked,  user);
      }
    } else {
      bot.sendChat(`Strange, data for that was not found!`);
    }
    
  });
}

module.exports = function(bot, db, data) {

  if (data.args.length === 0) {
    return lookUpBalance(bot, db, data.user.username, data.user, 'mine');
  }

  if (data.args.length > 1) {
    return bot.sendChat(`@${data.user.username} you can only lookup one person`);
  }

  if (typeof data.args[0] === 'string') {
    return bot.sendChat(`@${data.user.username}, use '!balance @[username]' to check another user's balance`);
  }

  const recipient = data.mentions[0];

  if (!recipient){
    bot.sendChat(`@${data.user.username}, that user was not found!`);
    return;
  }

  return lookUpBalance(bot, db, data.user.username, recipient, 'theirs');

};

module.exports.extraCommands = ['stats', 'score'];