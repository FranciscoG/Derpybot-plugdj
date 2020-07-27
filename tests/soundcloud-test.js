"use strict";
const assert = require("assert").strict;

// stubs for bot functions
const stubs = require("./stubs.js");
const bot = stubs.bot;

// DJ = testDJname;
const data = {
  user: { username: "testUser" },
};

/*
IDs of confirmed broken songs
87380722 - 404 rror 
116534641 - null
54816877 - null
226913338 - 404 error
80963599 - 404 error
270048143 - 404 error

IDs of working songs (as of May 2018)
223456028 - Mz Boom Bap - Fast Life (Instrumental)

276516174 - https://soundcloud.com/pryced/grown - why did the bot skip this song?
*/

// require our file to test
const sc = require("../bot/utilities/soundcloud.js");

/* global it, describe */
describe("Soundcloud track info tests", function () {
  it("Should successfully connect to soundcloud", function (done) {
    var media = { cid: 123456789, name: "not a real track" };
    sc.getLink(bot, media, function (error, result) {
      assert.ok(result);
      done();
    });
  });

  it("Missing bot argument should return undefined", function (done) {
    assert.strictEqual(sc.getLink(), undefined);
    done();
  });

  it("Missing callback argument should return undefined", function (done) {
    assert.strictEqual(sc.getLink(bot), undefined);
    done();
  });

  it("Should return an error message when media object is missing", function (done) {
    sc.getLink(bot, null, function (result) {
      assert.strictEqual(result.error_message, "soundcloud getSCjson: missing media object");
      done();
    });
  });

  it("Should return an error message when song ID is missing", function (done) {
    sc.getLink(bot, {}, function (result) {
      assert.strictEqual(result.error_message, "soundcloud getSCjson: missing song id");
      done();
    });
  });

  it("Should return a 404 for made-up id", function (done) {
    var media = { cid: 111111111111111 };

    sc.getLink(bot, media, function (result) {
      assert.strictEqual(result.skippable, true);
      assert.strictEqual(result.error_message, "404 - Not Found");
      done();
    });
  });

  it("Should return a 404 for a confirmed broken id", function (done) {
    var media = { cid: 87380722, name: "Chamber Of Secrets" };

    sc.getLink(bot, media, function (result) {
      assert.strictEqual(result.link, null);
      assert.strictEqual(result.skippable, true);
      assert.strictEqual(result.error_message, "404 - Not Found");
      done();
    });
  });

  it("Body should be null for api forbidden track", function (done) {
    var media = { cid: 116534641, name: "The Other Side - Help Me (FilososfischeStilte Remix)" };

    sc.getLink(bot, media, function (result) {
      assert.strictEqual(result.link, null);
      assert.strictEqual(result.skippable, true);
      assert.strictEqual(typeof result.error_message, "string");
      done();
    });
  });

  it("Body should be null for api forbidden track", function (done) {
    var media = { cid: 54816877, name: "Morning in Japan" };

    sc.getLink(bot, media, function (result) {
      assert.strictEqual(result.link, null);
      assert.strictEqual(result.skippable, true);
      assert.strictEqual(typeof result.error_message, "string");
      done();
    });
  });

  it("Should successfully return track info", function (done) {
    var media = { cid: 223456028, name: "Mz Boom Bap - Fast Life (Instrumental)" };

    sc.getLink(bot, media, function (result) {
      assert.strictEqual(typeof result.link, "string");
      assert.strictEqual(result.skippable, false);
      assert.strictEqual(result.error_message, null);
      assert.ok(/^https?/.test(result.link));
      done();
    });
  });

  it("Should not skip this track but the bot did anyways which is weird, oh well", function (done) {
    var media = { cid: 276516174, name: "Grown" };

    sc.getLink(bot, media, function (result) {
      assert.strictEqual(result.link, "https://soundcloud.com/pryced/grown");
      assert.strictEqual(result.skippable, false);
      assert.strictEqual(result.error_message, null);
      done();
    });
  });
});
