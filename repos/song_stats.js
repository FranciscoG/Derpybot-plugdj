"use strict";
const log = require(process.cwd() + "/bot/utilities/logger");

const saveSong = function(db, cid, saveObj) {
  var song_stats = db.ref("song_stats");
  song_stats.child(cid).set(saveObj, function(err) {
    if (err) {
      log("error", "REPO", "song_stats: Error saving for id " + cid);
    }
  });
};

const getSong = function(db, cid) {
  return db
    .ref("song_stats")
    .child(cid)
    .once("value");
};

module.exports = {
  saveSong: saveSong,
  getSong: getSong
};
