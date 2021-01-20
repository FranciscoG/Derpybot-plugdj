'use strict';
const mediaStore = require(process.cwd()+ '/bot/store/mediaInfo.js');
const _ = require('lodash');

function makeYTCheckerUrl(yid){
  return `https://polsy.org.uk/stuff/ytrestrict.cgi?ytid=${yid}`;
}

module.exports = function(bot, db, data) {
  if(!data) { return; }
  const current = mediaStore.getCurrent();  
  const restrictions = '';

  const whoAsked = _.get(data, 'user.username', '');
  if (whoAsked){ 
    whoAsked = "@"+whoAsked;
  }

  if(!current.link) {
    bot.sendChat('Sorry I couldn\'t get the link for this track');
  } else {
    if (current.format === 1) {
      restrictions = ` - YouTube region restriction info: ${makeYTCheckerUrl(current.id)}`;
    }
    bot.sendChat(`${whoAsked} - ${current.link}${restrictions}`);
  }
};
