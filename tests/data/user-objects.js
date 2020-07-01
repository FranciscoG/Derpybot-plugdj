const cloneDeep = require('lodash/cloneDeep');

const baseUser = {
  avatarID: "",
  badge: "food05",
  blurb: undefined,
  grab: false,
  gRole: 0,
  id: 2345678,
  ignores: undefined,
  joined: "2012-02-29 19:00:04.984000",
  language: null,
  level: 16,
  notifications: undefined,
  pp: undefined,
  pw: undefined,
  role: 5000,
  silver: true,
  slug: null,
  status: 1,
  sub: 1,
  username: "testDJname",
  vote: 1,
  xp: undefined
};

/**  
 * This will be the data returned from bot.getDJ() in all our tests
 */
const DJ = cloneDeep(baseUser);
DJ.username = 'test_bot_dj_011223344';
DJ.id = '011223344-011223344';
DJ.role = 1000; // Resident DJ

/**  
 * This will be the data returned from bot.getUser() which should be the bot
 */
const BotUser = cloneDeep(baseUser);
BotUser.username = 'test_bot_9988776655';
BotUser.id = '9988776655-9988776655';
BotUser.role = 3000; // Manager

/**  
 * This will represent another user who has sent a chat command which is not
 * the bot (and not the DJ either)
 */
const OtherUser = cloneDeep(baseUser);
OtherUser.username = 'test_bot_rando_666999666';
OtherUser.id = '666999666-666999666';
OtherUser.role = 1000; // Resident DJ

/**   
 * this user has no room role so you can test access level stuff
 */
const NoRoleUser = cloneDeep(baseUser);
NoRoleUser.username = 'test_bot_rando2_56575892';
NoRoleUser.id = '56575892-56575892';
NoRoleUser.role = 0; // None

/**
 * Always export a copy of data so that every call to this function produces
 * new object and not a reference to the above object
 */
module.exports = {
  dj: DJ,
  botUser: BotUser,
  rando: OtherUser,
  rando2: NoRoleUser,
  createUser: function() {
    return cloneDeep(baseUser);
  }
};
