'use strict';

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/*********************************************************************
  roleChecker,  kind of like hasPermission

  This module sets up a system to check a "minimum" access level
  because a user who has the role of "isManager" will fail a test for
  role "isMod", even though they are above that role.  So this will
  go through all the roles above given minimum role until it one passes
  of all are checked

  https://plugcubed.github.io/plugAPI/#plugapiglobal_roles

  ROOM_ROLE.NONE Number
  Room role of 0. User has no role.

  ROOM_ROLE.RESIDENTDJ Number
  Room role of 1000. User is a resident DJ.

  ROOM_ROLE.BOUNCER Number
  Room role of 2000. User is a bouncer.

  ROOM_ROLE.MANAGER Number
  Room role of 3000. User is a manager.

  ROOM_ROLE.COHOST Number
  Room role of 4000. User is a cohost.

  ROOM_ROLE.HOST Number
  Room role of 5000. User is a host.
*/

/**
 * Check if user is allowed to do something by checking Role status
 * @param {Object} bot
 * @param {Object} user instance of User: https://plugcubed.github.io/plugAPI/#user
 * @param {Number} minRole minimum room role user needs: https://plugcubed.github.io/plugAPI/#plugapiroom_role
 */
module.exports = function(bot, user, minRole) {
  // trying to minimize the amount of bot crashing due to possible missing user data from api
  if (!bot || !user || !minRole) {
    bot.log('error', 'BOT', 'Missing arguments in roleChecker');
    return false; 
  }

  return user.role >= minRole;
 
};