"use strict";
const db = require(process.cwd() + "/bot/db.js");
const config = require(process.cwd() + "/bot/config.js");
const userObjects = require("./data/user-objects");

/**
 * [bot description]
 * @type {Object}
 */
var bot = {
  dj: userObjects.dj,

  users: [
    userObjects.dj,
    userObjects.rando,
    userObjects.botUser,
    userObjects.rando2
  ],

  // https://plugcubed.github.io/plugAPI/#plugapiroom_role
  ROOM_ROLE: {
    NONE: 0,
    RESIDENTDJ: 1000,
    BOUNCER: 2000,
    MANAGER: 3000,
    COHOST: 4000,
    HOST: 5000
  },

  onSendChat: function(callback) {
    this.chatCallback = callback;
  },

  sendChat: function(x) {
    if (typeof this.chatCallback === "function") {
      this.chatCallback(x);
    }
    return x;
  },

  havePermission(userId, roleId) {
    const user = this.getUser(userId);
    // console.log('havePermission', user.role, roleId);
    return user.role >= roleId;
  },

  getDJ: function() {
    return this.dj;
  },

  getUser: function(byId) {
    if (byId) {
      return this.users.filter(x => x.id === byId)[0] || null;
    }
    return userObjects.botUser;
  },

  getMedia: function() {
    // return a media object
    return {
      name: "",
      cid: "",
      format: 1
    };
  },
  updub: function() {
    return; // do nothing
  },
  getUsers: function() {
    // return list of users
    return {};
  },
  on: function(event, callback) {
    // probably do nothing during testing
  },
  log: function() {
    console.log("bot.log: ", ...arguments);
  },
  moderateDeleteChat: function(cid, callback) {},
  myconfig: config,
  commandedToDJ: false,
  isDJing: false
};

// need different kind of data responses
// 1. one without any params
// 2. one with params but just 1 item in the array
// 3. one with more items in the array
// 4. one without username
var dataResponse = {};

module.exports = {
  bot: bot,
  data: dataResponse,
  db: db
};
