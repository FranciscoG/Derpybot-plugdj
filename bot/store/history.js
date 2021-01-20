"use strict";
const _get = require("lodash/get");
const moment = require("moment");

const historyStore = {
  songStore: [],
  warnedStore: [],

  ready: false,

  convertTime: function(timestamp) {
    return moment(timestamp).fromNow();
  },

  fromHistory: function(song) {
    return {
      id: song.id,
      lastplayed: song.timestamp,
      user: song.user.username,
      title: song.media.title,
      modIgnore: false
    };
  },

  fromUpdate: function(song) {
    return {
      id: song.id,
      lastplayed: song.timestamp,
      user: _get(song, "user.username", "404usernamenotfound"),
      title: _get(song, "media.title", "404songnamenotfound"),
      modIgnore: false
    };
  },

  /**
   * checks to see if a user was already warned about a song within the last minute
   * @param  {Object} warnSong
   * @return {boolean}
   */
  recentlyWarned: function(warnSong) {
    const result = false;

    this.warnedStore.forEach(function(song) {
      if (song.id !== warnSong.id && song.user !== warnSong.user) {
        return;
      }

      // if we warned dj within the last minute, return true
      if (Date.now() - warnSong.warned < 60000) {
        result = true;
      }
    });

    // make sure this array stays small
    if (this.warnedStore.length > 20) {
      this.warnedStore.shift();
    }

    return result;
  },

  /**
   * check history to see if songid is present
   */
  getSong: function(bot, songid) {
    if (!songid) {
      return;
    }
    if (!this.ready) {
      return;
    }
    const result = [];
    const self = this;

    this.songStore.forEach(function(song) {
      if (song.songid !== songid) {
        return; // continue to next song in the list
      }

      // if a mod wants to play a song again then why not
      if (song.modIgnore) {
        return;
      }

      // giving DJs a 1 minute grace period between warnings
      // if (self.recentlyWarned(song)) {
      //    bot.log('info', 'BOT', `Already warned: ${song.user} about ${song.name}`);
      //   return;
      // }

      result.push(song);
      // song.warned = Date.now();
      // self.warnedStore.push(song);
    });

    return result;
  },

  /**
   * Save the currently played song into the history array that
   * was initially created on load by scraping the last 8 pages
   * of song history
   *
   * For every new song that comes in, one song must be removed
   * that way we always keep the array at a certain length which
   * is (20 * config.history_pages)
   * 1 history page = 20 songs
   *
   * @param {object} bot instance of dubapi
   * @param {object} song dubapi song info object
   */
  save: function(bot, song) {
    if (!song) {
      return;
    }
    if (!this.ready) {
      return;
    }

    const songId = _get(song, "media.id");
    const lastplayed = _get(song, "raw.song.played");
    if (!lastplayed || !songId) {
      return;
    }

    const convert = this.fromUpdate(song);
    // add song to the beginning of the array
    this.songStore.unshift(convert);

    // remove last element from array
    this.songStore.pop();
  },

  clear: function() {
    this.songStore = [];
    this.warnedStore = [];
    this.ready = false;
  },

  init: function(bot) {
    this.clear();

    const self = this;

    return new Promise(function(resolve, reject) {
      bot.getHistory(function(history) {
        if (history && history.length > 0) {
          self.songStore = history.map(function(song) {
            return self.fromHistory(song);
          });
          self.ready = true;
        }
        resolve();
      });
    });
  }
};

module.exports = historyStore;
