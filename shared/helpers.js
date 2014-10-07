/**
 * Bothan Shared helpers
 * ======================
 *
 * Useful batch of functions used by both phantomjs and nodejs scripts.
 */

// Is the var a plain object?
function isPlainObject(v) {
  return v instanceof Object &&
         !(v instanceof Array) &&
         !(v instanceof Function);
}

// Recursively extend objects
function extend() {
  var i,
      k,
      res = {},
      l = arguments.length;

  for (i = l - 1; i >= 0; i--)
    for (k in arguments[i])
      if (res[k] && isPlainObject(arguments[i][k]))
        res[k] = extend(arguments[i][k], res[k]);
      else
        res[k] = arguments[i][k];

  return res;
}

// Converts a camelcase word into a hyphen separated one
function camelToHyphen(name) {
  return name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
}

// From configuration object to command line arguments
function toCLIArgs(o) {
  var args = [];

  for (var k in o)
    args.push('--' + camelToHyphen(k) + '="' + o[k] + '"');

  return args;
};

module.exports = {
  camelToHyphen: camelToHyphen,
  extend: extend,
  toCLIArgs: toCLIArgs
};
