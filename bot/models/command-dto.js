require('../utilities/typedefs');
const userModel = require("./user-dto");

/**
 * 
 * @param {Object} data 
 * @returns {BotCommand}
 */
function commandDTO(data) {
  return {
    data: data,
    chatId: data.id,
    command: data.trigger || data.command,
    trigger: data.trigger || data.command,
    user: userModel(data.user || data.from),
    args: data.args || []
  };
}


module.exports = commandDTO;
