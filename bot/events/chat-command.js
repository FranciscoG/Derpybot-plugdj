const triggerPoint = require("../utilities/triggerPoint.js");
const triggerStore = require("../store/triggerStore.js");
const triggerCode = require("../utilities/triggerCode.js");
const handleChat = require("../utilities/handleChat");

const commandDTO = require("../models/command-dto");

let commands = {};

function unrecognized(trigger) {
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
 * @param {Object} bot
 * @param {Object} db
 * @param {BotCommand} model
 */
var handleCommands = async function (bot, db, commandModel) {
  let chat_messages = [];

  // first go through the commands in /commands to see if they exist
  if (typeof commands[commandModel.command] !== "undefined") {
    commands[commandModel.command](bot, db, commandModel.data);
    return;
  }

  // check if it's an exsiting trigger
  let trig = triggerStore.get(commandModel.command);

  if (!trig) {
    chat_messages.push(unrecognized(commandModel.command));
    return chat_messages;
  }

  const { data: triggerData } = trig;
  
  if (/^\{.+\}$/.test(triggerData.Returns)) {
    // if this is a special code trigger that is wrapped in brackets "{ }"
    try {
      let codeResult = await triggerCode(triggerData.Returns, commandModel.data);
      chat_messages.push(codeResult);
    } catch (e) {
      bot.log("error", "BOT", `${e.message}`);
      chat_messages.push(`Sorry, an error occured with !${triggerData.Trigger}. Try again`);
    }

    return chat_messages;
  }

  // sets trig.formatted
  trig.format(bot, commandModel.data);
  const { formatted } = trig;

  if (triggerData.givesProp) {
    let pointInfo = await triggerPoint(bot, db, commandModel, formatted, "prop", triggerData.propEmoji);
    chat_messages = chat_messages.concat(pointInfo);
  } else if (triggerData.givesFlow) {
    let pointInfo = await triggerPoint(bot, db, commandModel, formatted, "flow", triggerData.flowEmoji);
    chat_messages = chat_messages.concat(pointInfo);
  } else {
    chat_messages.push(formatted);
  }

  return chat_messages;
};

const main = function (bot, db) {
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
        The message type (mention, emote, message)

        data.isFrom Function
        Checks if the message sender is from the inputted array of IDs or ID

        data.respond Function
        Sends a message specified and mentions the command user.

        data.respondTime Function
        Same as data.respond, except it has an additional parameter to delete the message after specified amount of time in seconds.

        data.havePermission Function
        Checks if command user has specified permission or above.
   */
  bot.on(bot.events.CHAT_COMMAND, async (data) => {
    const commandModel = commandDTO(data);
    const chat_messages = await handleCommands(bot, db, commandModel);
    handleChat(bot, chat_messages);
  });
};

module.exports = {
  main: main,
  handleCommands: handleCommands,
};
