"use strict";
require("./extend/array-extensions.js");
const _private = require(process.cwd() + "/private/get");
const settings = _private.settings;
const svcAcct = _private.svcAcct;

const PlugAPI = require("plugapi");
var Database = require(process.cwd() + "/bot/db.js");
var config = require(process.cwd() + "/bot/config.js");

config.botName = settings.USERNAME;
var BASEURL = settings.FIREBASE.BASEURL;
var db = new Database(svcAcct, BASEURL);

new PlugAPI(
  {
    email: settings.USERNAME,
    password: settings.PASSWORD
  },
  function(err, bot) {
    if (err) {
      console.error(err);
      process.exit(1); // exit so pm2 can restart
      return;
    }

    bot.myconfig = config;
    bot.maxChatMessageSplits = 5;
    bot.commandedToDJ = false;
    bot.isDJing = false;
    bot.isConnected = false;
    bot.multiLine = true;
    bot.multiLineLimit = 10;

    if (bot.myconfig.muted) {
      bot.sendChat = function(x) {
        console.log("muted:", x);
      };
    }

    if (bot.myconfig.verboseLogging) {
      bot.log = require("jethro");
      bot.log.setTimestampFormat(null, "YYYY-MM-DD HH:mm:ss:SSS");
    } else {
      bot.log = function() {
        return;
      }; // do nothing
    }

    /**
     * Exit/Error related events
     */
    let closing = false;
    function onExit(exitErr) {
      if (exitErr && exitErr.stack) bot.log("error", "BOT", exitErr.stack);

      if (closing) {
        return;
      }
      closing = true;
      if (bot.isConnected) {
        bot.sendChat("I'm ded :skull:");
      }
      bot.close(false);
      process.exit(1);
    }

    //Properly disconnect from room and close db connection when program stops
    process.on("exit", onExit); //automatic close
    process.on("SIGINT", onExit); //ctrl+c close
    process.on("uncaughtException", onExit);
    process.on("message", function(msg) {
      bot.log("info", "BOT", "message: " + msg);
      if (msg === "shutdown") {
        onExit();
      }
    });
    
    // Load all events
    // require('./loadEvents')(bot, db);
    require('./events/room_join')(bot,db);
    require('./events/chat-command')(bot,db);
    require('./events/chat-message')(bot,db);
    require('./events/advance')(bot,db);

    bot.connect(settings.ROOMNAME);

  }
);
