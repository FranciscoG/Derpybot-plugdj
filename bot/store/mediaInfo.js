"use strict";
var _ = require("lodash");
var repo = require(process.cwd() + "/repo");

var mediaStore = {
  current: {
    link: null,
    name: null,
    id: null,
    format: null,
    dj: null,
    length: 0,
    usersThatPropped: 0,
    usersThatFlowed: 0,
    when: 0
  },

  last: {
    link: null,
    name: null,
    id: null,
    format: null,
    dj: null,
    length: 0,
    usersThatPropped: 0,
    usersThatFlowed: 0,
    when: 0
  },

  getCurrent: function() {
    return this.current;
  },

  getLast: function() {
    return this.last;
  },

  lastPlayModel: function(currentSong, storedData) {
    let obj = {
      id: currentSong.cid,
      format: currentSong.format,
      name: currentSong.title,
      plays: 1,
      firstplay: {
        user: _.get(storedData, "firstplay.user", currentSong.dj),
        when: _.get(storedData, "firstplay.when", Date.now())
      },
      lastplay: {
        user: _.get(storedData, "lastplay.user", currentSong.dj),
        when: _.get(storedData, "lastplay.when", Date.now())
      }
    };

    if (storedData && storedData.plays) {
      obj.plays = storedData.plays + 1;
    }
    return obj;
  },

  setLast: function(db, song) {
    if (typeof song === "object" && song) {
      for (var key in song) {
        if (this.last.hasOwnProperty(key)) {
          this.last[key] = song[key];
        }
      }

      if (!song.id) {
        return;
      }

      // look for the song in the db
      // repo
      //   .getSong(db, song.id)
      //   .then(data => {
      //     // then save song in the db
      //     repo.saveSong(db, song.id, this.lastPlayModel(song, data.val()));
      //   })
      //   .catch(err => {
      //     console.log(err);
      //   });
    }
  },

  setCurrent: function(x) {
    if (typeof x === "object") {
      for (var key in x) {
        if (this.current.hasOwnProperty(key)) {
          this.current[key] = x[key];
        }
      }
    }
  },

  setCurrentKey: function(key, value) {
    if (this.current.hasOwnProperty(key)) {
      this.current[key] = value;
    }
  },

  getLink: function() {
    return this.current.link;
  }
};

module.exports = mediaStore;
