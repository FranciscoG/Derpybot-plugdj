const userData = require('./user-objects');
const { cloneDeep } = require("lodash");

var data = {
  // guid string
  id: "1234567-89234",

  /**
   * the command message: !command (without the !)
   */
  command: "",
  trigger: "", //  trigger === command

  /**
   * the chat message
   */
  message: "",

  /**
   * data.args (Array<User> | Array<String>)
   * An array of strings / user objects after the command.
   */
  args: [],

  /**
   *  data.from User
   *  The user object of the message sender
   */
  from: userData.rando,
  // I manually make copy from to user for backwards compat with previous dubapi code
  user: userData.rando,

  /**
   * data.raw Object
   * The raw data object from plug.dj. Not changed by PlugAPI
   */
  raw: {},

  /**
   * data.mentions Array<User>
   * An array of mentioned users.
   */
  mentions: [],

  /**
   * data.muted Boolean
   * If the user is muted.
   */
  muted: false,

  /**
   * data.type String
   * The message type (mention, emote, messaage)
   */
  type: "message",

  /**
   * data.isFrom Function
   * Checks if the message sender is from the inputted array of IDs or ID
   */
  isFrom: function(ids, success, failure) {},

  /**
   * data.respond Function
   * Sends a message specified and mentions the command user.
   */
  respond: function() {},

  /**
   * data.respondTime Function
   * Same as data.respond, except it has an additional parameter to delete
   * the message after specified amount of time in seconds.
   */
  respondTime: function() {},

  /**
   * data.havePermission Function
   * Checks if command user has specified permission or above.
   */
  havePermission: function(permission, callback) {
    return callback(true);
  }
};

/**
 * Always export a copy of data so that every call to this function produces
 * new object and not a reference to the above object
 */
module.exports = function() {
  return cloneDeep(data);
};
