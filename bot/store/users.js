'use strict';


const UserStore = {
  usersThatPropped : [],
  usersThatFlowed : [],

  getFlows : function(){
    return this.usersThatFlowed;
  },
  getProps : function(){
    return this.usersThatPropped;
  },

  addPoint : function(pointType, id){
    if (!pointType || !id) {return;}
    this[pointType].push(id);
  },

  hasId: function(type, id){
    if (!type || !id) {return;}
    return this[type].indexOf(id) >= 0;
  },

  clear : function(){
    this.usersThatPropped = [];
    this.usersThatFlowed = [];
  }
};

module.exports = UserStore;

