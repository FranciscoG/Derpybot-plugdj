const triggerPoint = require(process.cwd() + "/bot/utilities/triggerPoint.js");
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const triggerCode = require(process.cwd() + "/bot/utilities/triggerCode.js");

var commands = {};
const pointCheck = new RegExp("\\+(props?|flow)(=[a-z0-9_-]+)?", "i");

function unrecognized(bot, trigger) {
  let msg = `*!${trigger}* is not a recognized trigger`;

  let results = triggerStore.recursiveSearch(trigger, 5);

  if (!results || results.length === 0) {
    return msg;
  }

  let moreMsg = "Did you mean one of these: ";
  if (results.length === 1) {
    moreMsg = "Did you mean this:  ";
  }
  moreMsg += results.join(", ");
  return msg + moreMsg;
}

/**
 * 
 * @param {Object} bot plug.dj bot instance
 * @param {string|string[]} messages string or an array of strings
 */
function handleChat(bot, messages) {
  if (Array.isArray(messages)) {
    bot.sendChat(
      messages.join(' \n')
    );
  } else {
    bot.sendChat(messages);
  }
}

var handleCommands = async function(bot, db, data) {
  let chat_messages = [];

  // to make compatible wth old DubAPI code
  data.trigger = data.trigger || data.command;
  data.user = data.user || data.from;
  data.args = data.args || []; // ensure always be an empty array
  
  // first go through the commands in /commands to see if they exist
  if (typeof commands[data.command] !== "undefined") {
    commands[data.command](bot, db, data);
    return;
  }

  // check if it's an exsiting trigger
  let trig = triggerStore.get(data.command, bot, data);
  
  if (trig && /^\{.+\}$/.test(trig)) {
    // if this is a special code trigger that is wrapped in brackets "{ }"
    try {
      let codeResult = await triggerCode(trig, data);
      chat_messages.push(codeResult);
    } catch (e) {
      bot.log('error', 'BOT', `${e.message}`);
      chat_messages.push(`Sorry, an error occured with !${trig}. Try again later`);
    }
  } else if (trig) {
    // checking if a trigger has a +prop or +flow
    var last = trig.split(" ").pop();
    if (pointCheck.test(last)) {
      let pointInfo = await triggerPoint(bot, db, data, trig, last);
      chat_messages = chat_messages.concat(pointInfo);
    } else {
      chat_messages.push(trig);
    }
  } else {
    chat_messages.push( unrecognized(bot, data.trigger) );
  }

  // handle sending the chat messages here
  handleChat(bot, chat_messages);
  return Promise.resolve(chat_messages);
};

const main = function(bot, db) {
  commands = require(process.cwd() + "/bot/loadCommands.js");

  // docs: https://plugcubed.github.io/plugAPI/#plugapieventcommand
  // This is emitted when a chat message starting with the
  // PlugAPI#commandPrefix is received

  /**
   * CHAT_COMMAND event
   * is emitted when a "!" command is sent bypassing the CHAT evemt
   * https://plugcubed.github.io/plugAPI/#plugapieventcommand
   * 
   * data (Object) : The chat data Object
        data.id String
        The chat id of the message.

        data.command String
        The command message.

        data.message String
        The chat message.

        data.args (Array<User> | Array<String>)
        An array of strings / user objects after the command.

        data.from User
        The user object of the message sender

        data.raw Object
        The raw data object from plug.dj. Not changed by PlugAPI

        data.mentions Array<User>
        An array of mentioned users.

        data.muted Boolean
        If the user is muted.

        data.type String
        The message type (mention, emote, messaage)

        data.isFrom Function
        Checks if the message sender is from the inputted array of IDs or ID

        data.respond Function
        Sends a message specified and mentions the command user.

        data.respondTime Function
        Same as data.respond, except it has an additional parameter to delete the message after specified amount of time in seconds.

        data.havePermission Function
        Checks if command user has specified permission or above.
   */
  bot.on(bot.events.CHAT_COMMAND, data => {
    //console.log("CHAT_COMMAND", data);
    handleCommands(bot, db, data);
  });
};

module.exports = {
  main: main,
  handleCommands: handleCommands
};
