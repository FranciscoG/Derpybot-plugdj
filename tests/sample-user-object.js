const { cloneDeep } = require("lodash");

const sampleUser = {
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
  rawun: "testDJname",
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
 * Always export a copy of data so that every call to this function produces
 * new object and not a reference to the above object
 */
module.exports = function() {
  return cloneDeep(sampleUser);
};
