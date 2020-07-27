"use strict";
/**
 * Transform an incoming user from PlugApi and taking only
 * @param {object} data plugapi user object
 * @return {import("../utilities/typedefs").BotUser}
 */
function userDTO(data) {
  return {
    id: data.id,
    username: data.username,
    role: data.role || 0
  };
}

module.exports = userDTO;
