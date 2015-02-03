# Bothan

**bothan.js** is a low-level [phantomjs](http://phantomjs.org/) controller that can be used with node.js and initially intended to perform scraping tasks.

This controller is used by [sandcrawler](https://github.com/medialab/sandcrawler) to perform its dynamic scraping tasks.

## Installation

You can install **bothan.js** with npm. Note that by default, the library will install a correct version of phantomjs thanks to this [package](https://www.npmjs.com/package/phantomjs).

```bash
npm install bothan
```

Or if you need the latest development version:

```bash
npm install git+https://github.com/medialab/bothan.git
```

## Concept

**bothan.js** communicates with its phantom child processes through a websocket server.

It does so without needing to accessing a dummy webpage on the phantom side since phantom main JavaScript context is perfectly able to handle websockets.

This dramatically enhance stability of the communication between node and phantom children.

## Bindings

However, bothan is just providing a simple way to spawn phantom and to communicate with them. So, if you want to be able to send messages to your phantoms and them to react accordingly, you must pass bindings to them.

Bindings are just expressed in a script written thusly:

```js
module.exports = function(parent, params) {

  // Hello
  parent.on('hello', function() {
    console.log('Hello world!');
  });
};
```

## Usage

### Deploying a phantom

```js
var bothan = require('bothan');

bothan.deploy(function(err, phantom) {
  phantom.send('message', {hello: 'world'});
});

// With parameters
bothan.deploy({path: './bin/customphantomjs'}, function(err, phantom) {
  //...
});
```

### Methods

#### Send

Sends a message to the phantom child to receive.

```js
phantom.send(head, body);
```

#### Request

Request something from the phantom child.

```js
phantom.request(head, body, params, function(err, response) {
  // Deal with error
  if (err)
    // ...

  // Handle response
  console.log(response);
});

// Alternate signatures
phantom.request(head, callback);
phantom.request(head, body, callback);

// Cancel a request
var call = phantom.request(...);
call.cancel();
```

*Parameters*:

* **timeout** *?integer* [`2000`]: time in milliseconds before request timeouts.

#### ReplyTo

Reply to one side's request.

```js
phantom.replyTo(id, data);
```

#### Kill

Kill a phantom child.

```js
phantom.kill();
```

#### Restart

Restarting a phantom child.

```js
phantom.restart();
```

### Events

Phantom children wrappers as offered by **bothan.js** are event emitters so you can listen to various events.

*Events*

* **ready**: fires when the phantom child is ready or ready again (specially after a restart).
* **log**: fires when the phantom child logs something to stdout.
* **error**: fires when the phantom child prints an error or ouptuts to stderr.
* **close**: fires when the phantom child closes.
* **crash**: fires when the pantom child crashes.
* **?anyMessage?**: fires when the phantom child emits a message through its web socket.

*Example*

Note that event emitting is done through node's core events [module](http://nodejs.org/api/events.html).

```js
phantom.on('crash', function() {
  console.log('Phantom child crashed.');
});
```

### Options

* **args** *?object*: camel-cased [arguments](http://phantomjs.org/api/command-line.html) to pass to the phantom child.
* **autoRestart** *?boolean* [`false`]: should the phantom child try to restart on crash?
* **bindings** *?string*: path of script to pass to the phantom child so you can communicate with it.
* **data** *?object*: arbitrary parameters to pass to the phantom child and accessible in the bindings.
* **handshakeTimeout** *?integer* [`5000`]: time allowed in milliseconds to perform the handshake with the phantom child.
* **name** *?string*: an optional name to give to the phantom child.
* **path** *?string*: path of a custom `phantomjs` binary.

### Global bothan configuration

```js
var bothan = require('bothan');

// Changing the default port on which bothan is communicating
bothan.config({port: 5647});
```

## Roadmap

* Clusters
* Better messenging
* Better restarts
* Better encapsulation

## Contribution
[![Build Status](https://travis-ci.org/medialab/bothan.svg)](https://travis-ci.org/medialab/bothan)

Contributions are more than welcome. Feel free to submit any pull request as long as you added unit tests if relevant and passed them all.

To install the development environment, clone your fork and use the following commands:

```bash
# Install dependencies
npm install

# Testing
npm test
```

## Authors
**bothan.js** is being developed by [Guillaume Plique](https://github.com/Yomguithereal) @ SciencesPo - [médialab](http://www.medialab.sciences-po.fr/fr/).
