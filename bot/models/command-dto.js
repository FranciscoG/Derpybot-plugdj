const userModel = require("./user-dto");

/**
 * @param {import('plugapi').Event.Chat} data 
 * @returns {import("../utilities/typedefs").BotCommand}
 */
function commandDTO(data) {
  return {
    // original data object just in case
    _data: data,
    // id of chat
    chatId: data.id,
    // the current !command
    command: data.trigger || data.command,
    // an array of @user mentions from the chat text
    mentions: data.mentions.map(userModel),
    // user who sent the chat message
    user: userModel(data.user || data.from),
    // all the text after the command split into an array of strings
    args: data.args || []
  };
}


module.exports = commandDTO;
