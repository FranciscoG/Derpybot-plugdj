"use strict";
require("./extend/array-extensions.js");
const PlugAPI = require("plugapi");
const { settings } = require(process.cwd() + "/private/get");

const config = require(process.cwd() + "/bot/config.js");
config.botName = settings.USERNAME;

const db = require(process.cwd() + "/bot/db.js");

/**
 * @type {import('./utilities/typedefs').DerpyBot}
 */
// @ts-ignore
const bot = new PlugAPI({
  email: settings.USERNAME,
  password: settings.PASSWORD
});

bot.myconfig = config;
bot.maxChatMessageSplits = 5;
bot.commandedToDJ = false;
bot.isDJing = false;
bot.isConnected = false;
bot.multiLine = true;
bot.multiLineLimit = 20;

if (bot.myconfig.muted) {
  bot.sendChat = function(x) {
    console.log("muted:", x);
  };
}

if (bot.myconfig.verboseLogging) {
  const Jethro = require("jethro");
  // @ts-ignore
  bot.log = new Jethro();
  // @ts-ignore
  bot.log.setTimestampFormat(null, "YYYY-MM-DD HH:mm:ss:SSS");
} else {
  // @ts-ignore
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

process.on("unhandledRejection", (reason, promise) => {
  bot.log(
    "error",
    "BOT",
    `Unhandled Rejection at: ${promise}, reason: ${reason}`
  );
});

// Load all events
require("./loadEvents")(bot, db);

bot.connect(settings.ROOMNAME);

module.exports = bot;
