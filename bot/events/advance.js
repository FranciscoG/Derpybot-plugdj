/***************************************************************
 * Event: Advance
 *
 * https://plugcubed.github.io/plugAPI/#plugapieventadvance
 * This is emitted when the song has changed to another one.
 *
 */
"use strict";
const mediaStore = require(process.cwd() + "/bot/store/mediaInfo.js");
const userStore = require(process.cwd() + "/bot/store/users.js");
const youtube = require(process.cwd() + "/bot/utilities/youtube.js");
const soundcloud = require(process.cwd() + "/bot/utilities/soundcloud");
const _get = require("lodash/get");

/**
 *
 * @param {import('plugapi')} bot instance of api
 * @param {object} currentSong song data of current track playing
 */
function reviewPoints(bot, currentSong) {
  const propped = userStore.getProps();
  const flowed = userStore.getFlows();

  const messageToSend = [];
  const plural = "";
  const finalChat = "";

  if (propped.length > 0) {
    plural = propped.length > 1 ? "s" : "";
    messageToSend.push(`${propped.length} prop${plural} :fist: :heart: :musical_note:`);
  }

  if (flowed.length > 0) {
    plural = flowed.length > 1 ? "s" : "";
    messageToSend.push(`${flowed.length} flowpoint${plural} :surfer:`);
  }

  if (messageToSend.length > 0) {
    finalChat = `'${currentSong.name}', queued by ${currentSong.dj} received `;
    finalChat += messageToSend.join(" and ");
    bot.sendChat(finalChat);
  }
}

/**
 * handles various song warning and skipping of broken tracks
 * for now this only handles youtube because it's more complex
 *
 * @param {Object} bot instanceOf dubapi
 * @param {Object} db database object
 * @param {Object} data dubapi song data
 */
function songModerate(bot, db, data) {
  const songLength = _get(data, "media.songLength");
  if (songLength && bot.myconfig.longSongs.warn && songLength >= bot.myconfig.longSongs.max) {
    bot.sendChat(bot.myconfig.longSongs.message);
  }

  const songID = _get(data, "media.cid");
  const type = _get(data, "media.format");
  if (!type || !songID) {
    return;
  }

  //type (aka format): 1 if the song is YouTube. 2 if SoundCloud
  if (type === 1 || type === "1") {
    return youtube(bot, db, data.media);
  }
}

module.exports = function (bot, db) {
  // https://plugcubed.github.io/plugAPI/#plugapieventadvance
  bot.on(bot.events.ADVANCE, function (data) {
    bot.woot();

    // get the current DJ
    let dj = data.currentDJ;

    /************************************************************
     *  song info and trackinng
     */

    const currentSong = mediaStore.getCurrent(); // gets last played song
    const propped = userStore.getProps(); // get props given for last song
    const flowed = userStore.getFlows(); // get flow points for last song

    /************************************************************
     * review points
     * send chat message if there were any props or flow points given
     */
    reviewPoints(bot, currentSong);

    /************************************************************
     * save current song as last song data in the store
     * !lastplayed uses it
     */

    currentSong.usersThatFlowed = flowed.length;
    currentSong.usersThatPropped = propped.length;
    mediaStore.setLast(currentSong);

    //Reset user props/tunes stuff
    userStore.clear();

    // start new song store
    const newSong = {};

    // if no data.media from the api then stop now because everything below needs it
    if (!data.media) {
      return;
    }

    newSong.name = data.media.title;
    newSong.id = data.media.cid;
    newSong.format = data.media.format;
    newSong.length = data.media.songLength;
    newSong.dj = dj;
    newSong.when = Date.now();

    // store new song data reseting current in the store
    mediaStore.setCurrent(newSong);

    if (data.media.format === 2) {
      soundcloud.getLink(bot, data.media, function (result) {
        mediaStore.setCurrentKey("link", result.link);
        // by doing this we also check if we need to skip because track is broken
        // youtube has much more various reasons for being skipped, sc is more basic
        // so we can do it here
        if (result.skippable) {
          soundcloud.skip(
            bot,
            data.media,
            `Sorry @${dj} that ${result.reason}`,
            result.error_message
          );
        }
      });
    } else {
      mediaStore.setCurrentKey("link", `http://www.youtube.com/watch?v=${data.media.cid}`);
    }

    /************************************************************
     * check youtube links for various issues
     */

    songModerate(bot, db, data);
  });
};
