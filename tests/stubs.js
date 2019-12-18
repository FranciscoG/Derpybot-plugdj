"use strict";
/*
 * setup test db
 */
const _private = require(process.cwd() + "/private/get");
const settings = _private.settings;
const svcAcct = _private.svcAcct;
const Database = require(process.cwd() + "/bot/db.js");
const BASEURL = settings.FIREBASE.BASEURL;
const db = new Database(svcAcct, BASEURL);
const config = require(process.cwd() + "/bot/config.js");
const userObjects = require('./data/user-objects');

/**
 * [bot description]
 * @type {Object}
 */
var bot = {
  dj: userObjects.dj,

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
