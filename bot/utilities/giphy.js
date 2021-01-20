'use strict';
// modified from this source: https://github.com/ShMcK/API-Demos/tree/master/demo-ng/packages/giphy
const request = require('request');

const ROOT_API = 'http://api.giphy.com/v1/gifs/';

const Giphy = {};

const defaults = {
  API_KEY: 'dc6zaTOxFJmzC',
  size: 'original', // {string} [fixed, downsized, original]
  limit: 15,
  rating: 'pg-13', // {string} [y, g, pg, pg-13, r]
  random : true
};

Giphy.options = Object.assign({}, defaults);

const getRandom = function (list) {
  return list[Math.floor((Math.random()*list.length))];
};

const reformatRandomImage = function(data) {
  const url = null;
  switch (Giphy.options.size) {
    case 'original':
      url = data.image_original_url;
      break;
    case 'downsized':
      url = data.fixed_height_small_url;
      break;
    case 'fixed':
      url = data.fixed_height_downsampled_url;
      break;
    default:
      throw new Error('Not a valid option size for images');
  }
  return url;
};

const buildAPI = function(query){
  const apiPath = ROOT_API;

  if (Giphy.options.random) {
    apiPath += 'random';
    apiPath += '?tag=' + query.replace(/ /g, '+');
  } else {
    apiPath += 'search';
    apiPath += '?q=' + query.replace(/ /g, '+');
    apiPath += '&limit=' + Giphy.options.limit;
  }
  apiPath += '&fmt=json';
  apiPath += '&rating=' + Giphy.options.rating;
  apiPath += '&api_key=' + Giphy.options.API_KEY;
  return apiPath;
};

function apiCall(query, callback) {
  const apiPath = buildAPI(query);

  return request.get(apiPath, function (error, response, body) {
    if (error) {
      callback( error, null );
      return;
    } 
    
    if (!error && response.statusCode === 200) {
      const result = JSON.parse(body);
      if (!Giphy.options.random) {
        callback(null, getRandom(result.data).images[Giphy.options.size] );
      } else {
        callback(null, reformatRandomImage(result.data) );
      }
    }
  });
}

/*
  random:  bool
  rating : {string} [y, g, pg, pg-13, r]
  limit : number
  size : {string} [fixed, downsized, original] 
 */

const getGif = function(options, query, callback){
  if (typeof callback !== 'function') {
    return; // what's the point if we're not going to do anything with it
  }

  if (options && typeof options === 'object') {
    Giphy.options = Object.assign({}, Giphy.options, options);
  }

  apiCall(query, callback);
};

module.exports = {
 getGif : getGif,
 getRandom : getRandom
};