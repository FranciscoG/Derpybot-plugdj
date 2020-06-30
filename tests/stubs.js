"use strict";
const db = require(process.cwd() + "/bot/db.js");
const config = require(process.cwd() + "/bot/config.js");
const userObjects = require("./data/user-objects");
const PlugAPI = require("plugapi");

/**
 * [bot description]
 * @type {Object}
 */
var bot = {
  dj: userObjects.dj,

  users: [userObjects.dj, userObjects.rando, userObjects.botUser, userObjects.rando2],

  // https://plugcubed.github.io/plugAPI/#plugapiroom_role
  ROOM_ROLE: PlugAPI.ROOM_ROLE,

  onSendChat: function (callback) {
    this.chatCallback = callback;
  },

  sendChat: function (x) {
    if (typeof this.chatCallback === "function") {
      this.chatCallback(x);
    }
    return x;
  },

  havePermission(userId, roleId) {
    const user = this.getUser(userId);
    // console.log('havePermission', user.role, roleId);
    if (user) return user.role >= roleId;
    return false;
  },

  getDJ: function () {
    return this.dj;
  },

  getUser: function (byId) {
    if (byId) {
      return this.users.find((x) => x.id === byId);
    }
    return userObjects.botUser;
  },

  getMedia: function () {
    // return a media object
    return {
      name: "",
      cid: "",
      format: 1,
    };
  },
  updub: function () {
    return; // do nothing
  },
  getUsers: function () {
    // return list of users
    return {};
  },
  on: function (event, callback) {
    // probably do nothing during testing
  },
  log: function () {
    console.log("bot.log: ", ...arguments);
  },
  moderateDeleteChat: function (cid, callback) {},
  myconfig: config,
  commandedToDJ: false,
  isDJing: false,
};

module.exports = {
  bot,
  data: {},
  db,
};
