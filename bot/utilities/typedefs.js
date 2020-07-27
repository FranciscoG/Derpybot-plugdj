/**
 * @typedef {object} BotUser
 * @property {string} id user id from plug.dj
 * @property {string} username plug.dj user's name 
 * @property {0|1000|2000|3000|4000|5000} role plug.dj user's name 
 */

 /**
 * @typedef {object} TriggerModelData
 * @property {string} Author persion who created or last updated this trigger
 * @property {string} Returns Trigger text
 * @property {string} Trigger Trigger name
 * @property {'created'|'updated'} status
 * @property {number} [lastUpdated] timestamp of last update
 * @property {number} createdOn timestamp of when it was created
 * @property {string} createdBy who original created this trigger
 * @property {boolean} [givesProp=false] does this trigger give a prop point, default: false
 * @property {string} [propEmoji="fist"] which emoji to use in a prop, default: "fist"
 * @property {boolean} [givesFlow=false] does this trigger give a flow point, default: false
 * @property {string} [flowEmoji="surfer"] which emoji to use in a flow, default: "surfer"
 */

/**
 * @typedef {object} TriggerUpdate
 * @property {string} triggerName
 * @property {string} triggerText
 * @property {BotUser} user
 */

/**
 * @typedef {object} BotCommand
 * @property {object} data original data from response
 * @property {string} chatId originating chat id
 * @property {string} command 
 * @property {string} trigger
 * @property {BotUser} user
 * @property {array} args
 */

 module.exports = {};