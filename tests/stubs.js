"use strict";
/*
 * setup test db
 */
const _private = require(process.cwd() + "/private/get");
const settings = _private.settings;
const svcAcct = _private.svcAcct;
const makeUser = require("./sample-user-object");

var Database = require(process.cwd() + "/bot/db.js");
var BASEURL = settings.FIREBASE.BASEURL;
var db = new Database(svcAcct, BASEURL);

var config = require(process.cwd() + "/bot/config.js");

// this will be the user returned by getDJ()
// its username will be `testDJname`
const djUser = makeUser();

// this will be the "bot" user returned by getUser
const testBotUser = makeUser();
// change the username
testBotUser.username = "TestBot";

/**
 * [bot description]
 * @type {Object}
 */
var bot = {
  dj: djUser,

  onSendChat: function(callback) {
    this.chatCallback = callback;
  },

  sendChat: function(x) {
    if (typeof this.chatCallback === 'function') {
      this.chatCallback(x);
    }
    return x;
  },

  havePermission(id, roleId) {
    return true; // bot always has all the permissions
  },

  getDJ: function() {
    return this.dj;
  },

  getUser: function() {
    return testBotUser;
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
