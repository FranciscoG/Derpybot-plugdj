"use strict";
/***********************************************************************
 * soundcloud.js
 * util wrapper around making requests to soundcloud and getting track info
 */
const _private = require(process.cwd() + "/private/get");
const settings = _private.settings;
const got = require("got");
const _get = require("lodash/get");

/**
 *
 * @param {object} bot instance of Dubapi
 * @param {object} media dubapi song info from playlist-update event: data.media
 * @param {string} chatMsg the message the bot will send to chat
 * @param {string} logReason the message the bot will use when logging
 */
function doSkip(bot, media, chatMsg, logReason) {
  bot.log(
    "info",
    "BOT",
    `[SKIP] Soundcloud track - ${media.cid} - ${media.name || "unknown track name"} - ${logReason}`
  );

  if (bot.myconfig.autoskip_stuck) {
    return bot.moderateForceSkip(function () {
      bot.sendChat(chatMsg);
    });
  }
}

/**
 * @typedef {Object} LinkResult
 * @property {string} error_message basic description of error
 * @property {string} link the full url to the soundcloud track
 * @property {boolen} skippable is this track skippable or not
 * @property {string} reason a more chat friendly reason why song is being skipped.
 */

/**
 * Callback for handling request response from getSCjson
 *
 * @callback getSCjsonCallback
 * @param {LinkResult} result
 */

function onResponse(bot, response) {
  const customResponse = {
    error_message: null,
    link: null,
    skippable: false,
    reason: null,
  };
  const body = response.body;

  // if body is null then response.statusCode is most likely 403 forbidden
  // meaning owner of the track has disabled API request for their song
  // we can definitely skip the track if this is the case
  if (!body || body === "{}") {
    customResponse.reason = "Soundcloud link is broken";
    customResponse.skippable = true;
    customResponse.error_message = `${response.statusCode} - probably forbidden`;
    return customResponse;
  }

  try {
    // this is where it gets tricky.  if body.errors exists, then we skip
    // anything else probably means a good response
    const json = JSON.parse(body);
    const error404 = _get(json, "errors[0].error_message");
    if (error404) {
      customResponse.reason = "Soundcloud track does not exist aynmore";
      customResponse.skippable = true;
      customResponse.error_message = `${error404}`;
      return customResponse;
    } else {
      customResponse.link = _get(json, "permalink_url");
      return customResponse;
    }
  } catch (e) {
    bot.log("error", "BOT", `Soundcloud error parsing response.body - ${e}`);
    customResponse.error_message = "error parsing soundcloud response.body";
    return customResponse;
  }
}

/**
 * Makes request to Soundcloud for a specific songs meta data
 *
 * @param {object} bot instance of Dubapi
 * @param {object} media dubtrack media info object
 * @param {getSCjsonCallback} callback will be called on success/fail
 */
function getLink(bot, media, callback) {
  if (!bot || !callback) {
    console.log("warn", "BOT", "soundcloud.getLink missing bot or callback arguments");
    return;
  }

  if (!media) {
    return callback({ error_message: "soundcloud getSCjson: missing media object" });
  }
  if (!media.cid) {
    return callback({ error_message: "soundcloud getSCjson: missing song id" });
  }

  const customResponse = {
    error_message: null,
    link: null,
    skippable: false,
    reason: null,
  };

  const songID = media.cid;
  const url = `https://api.soundcloud.com/tracks/${songID}.json?client_id=${settings.SOUNDCLOUDID}`;

  got(url)
    .then((response) => {
      const resp = onResponse(bot, response);
      callback(resp);
    })
    .catch((err) => {
      // something happenend connecting to the API endpoint
      // we should NOT skip because we can't 100% know why this happened

      bot.log("error", "BOT", "Soundcloud Error: " + err);
      customResponse.error_message = "an error occured connecting to Soundcloud";
      callback(customResponse);
    });
}

module.exports = {
  getLink: getLink,
  skip: doSkip,
};
