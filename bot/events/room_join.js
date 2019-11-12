"use strict";
const mediaStore = require(process.cwd() + "/bot/store/mediaInfo.js");
const historyStore = require(process.cwd() + "/bot/store/history.js");
const triggerStore = require(process.cwd() + "/bot/store/triggerStore.js");
const leaderUtils = require(process.cwd() + "/bot/utilities/leaderUtils.js");
const repo = require(process.cwd() + "/repo");
const pointReset = require(process.cwd() + "/bot/utilities/point-reset.js");
const setTimeout = require("timers").setTimeout;

module.exports = function(bot, db) {
  bot.on(bot.events.ROOM_JOIN, function(roomname) {
    bot.isConnected = true;
    bot.log("info", "BOT", "Connected to " + roomname);
    bot.sendChat("Initializing...");
    var initStart = Date.now();

    setTimeout(function() {

      /*******************************************
       *  log current logged in user data
       */
      var users = bot.getUsers();
      users.forEach((user,i)=>{
        repo.logUser(db, user);
      });

      /*******************************************
       *  handle current playing song
       */
      bot.woot();
      var media = bot.getMedia();
      var dj = bot.getDJ();
      if (media) {
        var currentSong = {
          name: media.title,
          id: media.cid,
          format: media.format, // format (Number) : 1 if the song is YouTube. 2 if SoundCloud
          dj: !dj || !dj.username ? "404usernamenotfound" : dj.username
        };
        mediaStore.setCurrent(currentSong);
      }

      // // load new music monday next row into memory
      // nmm.load(bot);
      // // schedule it to refresh
      // nmm.schedule(bot);

      // // load FF info
      // ff.load(bot);
      // // schedule it to refresh
      // ff.schedule(bot);

      // store user info locally
      var user = db.ref("users");
      user.on(
        "value",
        function(snapshot) {
          var val = snapshot.val();
          bot.allUsers = val;
          // update leaderboard everytime someone gives a point
          leaderUtils.updateLeaderboard(bot, db);
        },
        function(error) {
          bot.log(
            "error",
            "BOT",
            `error getting users from firebase - ${error}`
          );
        }
      );

      // store trigger info locally
      triggerStore.init(bot, db);

      // store leaderboard info locally
      var leaderboard = db.ref("leaderboard");
      leaderboard.on(
        "value",
        function(snapshot) {
          var val = snapshot.val();
          bot.leaderboard = val;
        },
        function(error) {
          bot.log(
            "error",
            "BOT",
            `error getting leaderboard from firebase - ${error}`
          );
        }
      );
      
      /*******************************************
       *  Start the monthly point reset
       */
      pointReset(bot, db);

      bot.sendChat("Initialization complete");

      historyStore
        .init(bot)
        .then(function(){
          var complete = (Date.now() - initStart) / 1000;
          bot.log('info', 'BOT', `Initialization completed in ${complete} seconds`);
        });
    }, 3000);
  });
};
