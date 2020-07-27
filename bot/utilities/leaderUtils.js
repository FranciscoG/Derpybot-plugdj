"use strict";
const moment = require("moment");
const repos = require("../../repos");

/**
 * Takes a flat JS Object with values that are only strings or numbers and flips
 * the keys and values.
 * For example, this: { test: "flip" }
 * will become this: { flip: "test" }
 * @param {Object} obj
 */
function flipObj(obj) {
  return Object.keys(obj).reduce((ret, key) => {
    let val = obj[key];
    if (typeof val === "string" || typeof val === "number") {
      ret[val] = key;
      return ret;
    } else {
      throw new Error(
        `Object.flip only works with values that are numbers or strings. Value type for key ${key} is a ${typeof val}`
      );
    }
  }, {});
}

// firebase forbids these special characters in object keys so creating this
// simple pairing to encode/decode them since these don't have html entities or glyphs

const CHAR_ENCODE = {
  ".": "*!period!*",
  $: "*!dollar!*",
  "[": "*!lbracket!*",
  "]": "*!rbracket!*",
  "#": "*!hash!*",
  "/": "*!forwadslash!*",
  " ": "*!space!*",
};

// swap the keys with the values
const CHAR_DECODE = flipObj(CHAR_ENCODE);

function encodeUsername(str) {
  let keys = Object.keys(CHAR_ENCODE);
  return str.split("").reduce((acc, char) => {
    if (keys.includes(char)) {
      return acc + CHAR_ENCODE[char];
    } else {
      return acc + char;
    }
  }, "");
}

function decodeUsername(str) {
  return Object.keys(CHAR_DECODE).reduce((acc, key) => {
    if (acc.includes(key)) {
      return acc.split(key).join(CHAR_DECODE[key]);
    }
    return acc;
  }, str);
}

function getTop3(bot, prop) {
  var arr = [];

  Object.keys(bot.allUsers).forEach((userId) => {
    arr.push(bot.allUsers[userId]);
  });

  // help from: http://stackoverflow.com/a/1129270/395414
  arr.sort(function (a, b) {
    if (a[prop] < b[prop]) {
      return -1;
    }
    if (a[prop] > b[prop]) {
      return 1;
    }
    return 0;
  });
  arr.reverse();

  var finalArr = [];
  for (let i = 0; i < 3; i++) {
    finalArr.push(arr[i]);
  }
  return finalArr;
}

function updateLeaderboard(bot, db) {
  var year = moment().format("Y");
  var month = moment().format("MMM");
  var leaderObj = {
    month: month,
    year: year,
    props: "",
    propsObj: {},
    flow: "",
    flowObj: {},
  };

  var propsArr = [];
  var props = getTop3(bot, "props");
  props.forEach(function (user) {
    if (user.props > 0) {
      propsArr.push(user.username + " (" + user.props + ")");
      let encodedUserName = encodeUsername(user.username);
      leaderObj.propsObj[encodedUserName] = user.props;
    }
  });
  if (propsArr.length === 0) {
    leaderObj.props = "nobody got any props";
  } else {
    leaderObj.props = propsArr.join(", ");
  }

  var flowArr = [];
  var flow = getTop3(bot, "flow");
  flow.forEach(function (user) {
    if (user.flow > 0) {
      flowArr.push(user.username + " (" + user.flow + ")");
      let encodedUserName = encodeUsername(user.username);
      leaderObj.flowObj[encodedUserName] = user.flow;
    }
  });
  if (flowArr.length === 0) {
    leaderObj.flow = "there are currently no flow leaders";
  } else {
    leaderObj.flow = flowArr.join(", ");
  }

  repos.leaderboard
    .insertLeaderMonth(db, month + year, leaderObj)
    .then(function () {
      // bot.log('info', 'BOT', month + year + ': Leaderboard updated');
    })
    .catch(function (error) {
      bot.log("error", "BOT", "error updating leaderboard");
    });
}
/**
 * Work in progress
 * Update the All Time Leaders board
 *
 * @param {Obect} bot instance of DubAPI
 */
function allTimeLeaders(bot) {
  if (!bot.leaderboard) {
    bot.sendChat("I don't have leader informtaion at the momemt but try again in a minute");
    return;
  }

  /* 
    Leaders object structure:
      month_year
        flowObj
          user1: total
          user2: total
          user3: total
        propsObj
          user1: total
          user2: total
          user3: total
  */

  var flows = {};
  var props = {};

  // build our list of flows and props
  Object.keys(bot.leaderboard).forEach((key) => {
    let month_year = bot.leaderboard[key];

    // add up all the flows
    for (let user in month_year.flowObj) {
      let u = decodeUsername(user);
      if (!flows[u]) {
        flows[u] = month_year.flowObj[user];
      } else {
        flows[u] += month_year.flowObj[user];
      }
    }

    // add up all the props
    for (let user in month_year.propsObj) {
      let u = decodeUsername(user);
      if (!props[u]) {
        props[u] = month_year.propsObj[user];
      } else {
        props[u] += month_year.propsObj[user];
      }
    }
  });

  // sort all the flows by this method:
  // https://stackoverflow.com/a/1069840/395414
  var flow_sortable = [];
  for (let u in flows) {
    flow_sortable.push([u, flows[u]]);
  }

  var top3Flow = flow_sortable
    .sort(function (a, b) {
      return a[1] - b[1];
    })
    .reverse()
    .slice(0, 3);

  // sort all the props
  var props_sortable = [];
  for (let u in props) {
    props_sortable.push([u, props[u]]);
  }

  var top3Props = props_sortable
    .sort(function (a, b) {
      return a[1] - b[1];
    })
    .reverse()
    .slice(0, 3);

  return {
    props: top3Props,
    flows: top3Flow,
  };
}

/**
 * convert string to Capitlized 3 letter month
 */
const alphaRegex = new RegExp("[^a-z]+", "ig");
function formatMonth(str) {
  str = str.replace(alphaRegex, ""); // sanitize
  const first = str.charAt(0).toUpperCase();
  return (first + str.toLowerCase().substr(1)).replace(/([a-z]{3}).+/i, "$1");
}

function getLeadersByMonthYear(bot, month, year) {
  if (!bot.leaderboard) {
    bot.sendChat("I don't have leader informtaion at the momemt but try again in a minute");
    return;
  }

  if (!/^\d{4}$/.test(year)) {
    bot.sendChat(`Month or year was formatted wrong.`);
    bot.sendChat(`Please use \`!leaders <Month> <4-digit-year>\``);
    return;
  }

  const key = formatMonth(month) + year;
  const info = bot.leaderboard[key];
  if (!info) {
    bot.sendChat(`Sorry no info exists for ${month} ${year}`);
    return;
  }

  return info;
}

module.exports = {
  getTop3: getTop3,
  updateLeaderboard: updateLeaderboard,
  allTimeLeaders: allTimeLeaders,
  getLeadersByMonthYear: getLeadersByMonthYear,
};
