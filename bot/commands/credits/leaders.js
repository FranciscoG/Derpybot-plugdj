'use strict';
const leaderUtils = require(process.cwd() + '/bot/utilities/leaderUtils.js');
const moment = require('moment');
const handleChat = require("../../utilities/handleChat");

/**
 * !leaders - display current leaders in prop and flow
 * @param {PlugApi} bot
 * @param {object} db
 * @param {import('../../utilities/typedefs').BotCommand} data
 */
module.exports = function(bot, db, data) {
  if (!bot.leaderboard) {
    bot.sendChat("I don't have leader informtaion at the momemt but try again in a minute");
    return;
  }

  const [param1, param2] = data.args;

  // get all time leaders
  if (param1 && param1 === "all") {
    var all_time = leaderUtils.allTimeLeaders(bot);

    var propString = all_time.props.reduce(function(a,v){
      return a += `${v[0]} (${v[1]}), `;
    }, '').replace(/, $/, '');

    var flowString = all_time.flows.reduce(function(a,v){
      return a += `${v[0]} (${v[1]}), `;
    }, '').replace(/, $/, '');

    return handleChat(
      [
        `All time prop leaders are:`,
        propString,
        `All time flow leaders are:`,
        flowString
      ]
    );
  }

  if (param1 && param2) { 
    var monthResult = leaderUtils.getLeadersByMonthYear(bot, param1, param2);

    let monthInfo = `The leaders for ${param1} ${param2} were:
      *props*: ${monthResult.props}
      *flow*: ${ monthResult.flow }
    `;
    bot.sendChat(monthInfo);
    return;
  }

  var year = moment().format('Y');
  var month = moment().format('MMM');
  var month_full = moment().format('MMMM');

  const chat_msg = [
    `Current leaders for ${month_full} ${year} are:`
  ];

  let current_board = bot.leaderboard[ month + year ];

  if (!current_board) {
    chat_msg.push(`Error accessing data for ${month_full} ${year}`);
    return handleChat(bot, chat_msg);
  }

  let info = `By *props* :heart: :musical_note: :fist: :fire: etc...
    ${current_board.props}
    By *flow* :surfer:
    ${ current_board.flow }
    points will reset at the end of every month
  `;
  chat_msg.push(info);
  handleChat(bot, chat_msg);
};

