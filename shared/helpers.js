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
// TODO: this feels somewhat leaky
function request(socket, head, body, params, callback) {
  params = params || {};

  // Handling polymorphism
  if (arguments.length < 4) {
    callback = body;
    params = {};
  }
  else if (arguments.length < 5) {
    callback = params;
    params = {};
  }

  // Safeguard
  if (typeof callback !== 'function')
    throw Error('bothan.helpers.request: no callback supplied.');

  // Event functions
  var on = !socket.on ?
    function(l) {
      return socket.addEventListener('message', l);
    } :
    function(l) {
      return socket.on('message', l);
    };

  var off = socket.removeEventListener ?
    function(l) {
      return socket.removeEventListener('message', l);
    } :
    function(l) {
      return socket.removeListener('message', l);
    };

  // Unique identifier for this call
  var id = uuid();

  // Teardown helper
  function teardown() {
    off(listener);
    clearTimeout(timeout);
    cancel = Function.prototype;
  }

  // Timeout
  var timeout = setTimeout(function() {
    teardown();
    return callback(new Error('timeout'));
  }, params.timeout || DEFAULT_REQUEST_TIMEOUT);

  // Declaring outcomes
  var listener = function(event) {
    var message = JSON.parse(typeof event === 'string' ? event : event.data);

    // Solving
    if (message.id === id) {
      teardown();
      return callback(null, message);
    }
  };

  on(listener);

  // Sending message
  var sendArgs = [JSON.stringify({
    id: id,
    head: head,
    body: body
  })];

  if (!global.phantom)
    sendArgs.push(function(err) {
      if (!err)
        return;

      teardown();
      return callback(err);
    });

  socket.send.apply(socket, sendArgs);

  // Returning handful object
  var cancel = function() {
    teardown();
    return callback(new Error('canceled'));
  };

  return {
    id: id,
    cancel: cancel
  };
}

// Replying to a request
function replyTo(socket, id, data) {
  return socket.send(JSON.stringify({
    id: id,
    body: data
  }));
}

module.exports = {
  camelToHyphen: camelToHyphen,
  extend: extend,
  range: range,
  replyTo: replyTo,
  request: request,
  toCLIArgs: toCLIArgs,
  uuid: uuid
};
