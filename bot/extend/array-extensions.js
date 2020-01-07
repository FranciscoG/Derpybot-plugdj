
if (!Array.prototype.random) {
  Array.prototype.random = function() {
    let i = Math.floor( ( Math.random()*this.length ) );
    return this[i];
  };
}

/**   
 * remove not null and undefined items from an array
 */
if (!Array.prototype.filterNotNull) {
  Array.prototype.filterNotNull = function() {
    return this.filter(function(n){
      return n !== null && n !== undefined;
    });
  };
}

module.exports = function() {};