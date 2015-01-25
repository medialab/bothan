/**
 * Bothan Shared helpers
 * ======================
 *
 * Useful batch of functions used by both phantomjs and nodejs scripts.
 */

// Generating a uuid v4 - not robust, should improve
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
}

// Creating a range
function range(len) {
  return Array.apply(null, Array(len)).map(function (_, i) {return i;});
}

var DEFAULT_REQUEST_TIMEOUT = 2000;

// Expect an answer from an asynchronous request
function request(com, head, body, params, callback) {

  // Handling polymorphism
  if (arguments.length < 5) {
    callback = params;
    params = {};
  }

  // Safeguard
  if (typeof callback !== 'function')
    throw Error('bothan.helpers.request: no callback supplied.');

  // Unique identifier for this call
  var id = uuid();

  // Timeout
  var timeout = setTimeout(function() {
    return callback(new Error('timeout'));
  }, params.timeout || DEFAULT_REQUEST_TIMEOUT);

  // Declaring outcomes
  com.receptor(function(message) {
    if (message.id === id && message.head === head) {
      clearTimeout(timeout);
      return callback(null, message.data);
    }
  });

  // Sending message
  com.emitter({
    id: id,
    head: head,
    body: body
  });
}

module.exports = {
  camelToHyphen: camelToHyphen,
  extend: extend,
  range: range,
  request: request,
  toCLIArgs: toCLIArgs,
  uuid: uuid
};
