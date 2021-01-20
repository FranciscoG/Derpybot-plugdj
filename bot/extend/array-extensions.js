//@ts-ignore
if (!Array.prototype.random) {
  //@ts-ignore
  Array.prototype.random = function () {
    let i = Math.floor(Math.random() * this.length);
    return this[i];
  };
}

/**
 * remove not null and undefined items from an array
 */
//@ts-ignore
if (!Array.prototype.filterNotNull) {
  //@ts-ignore
  Array.prototype.filterNotNull = function () {
    return this.filter(function (n) {
      return n !== null && n !== undefined;
    });
  };
}

module.exports = function () {};
