require('../utilities/typedefs');

/**
 * Transform an incoming user from PlugApi and taking only
 * what we need
 * @param {object} data plugapi user object
 * @return {BotUser}
 */
function userDTO(data) {
  return {
    id: data.id,
    username: data.username
  };
}

module.exports = userDTO;
