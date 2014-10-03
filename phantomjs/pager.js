/**
 * Bothan Phantomjs Page Utility
 * ==============================
 *
 * Phantomjs helper to open pages for node Bothans and keep track of them.
 */

var webpage = require('webpage');

function Pager(comlink, params) {
  var self = this;

  // Properties
  this.comlink = comlink;
  this.params = params || {};
  this.pages = {};

  // Messaging events
  this.comlink.on('task.scrape', function(msg) {
    if (!msg.url || !msg.scraper || !msg.taskId)
      throw Error('Phantom.Pager.onScrape: wrong message data for get header.');

    if (!(msg.taskId in self.pages))
      self.pages[msg.taskId] = [];
    else
      throw Error('Phantom.Pager.onScrape: taskId is already registered.');

    // Creating a page
    var p = webpage.create();

    // Accessing given url
    p.open(msg.url, function() {

      // Inject js needed dependencies
      self.params.injections.forEach(function(i) {
        p.injectJs(i);
      });

      // Evaluating the given scraper
      p.evaluate(msg.scraper);
    });

    // Registering the page for later use
    self.pages[msg.taskId].push(p);

    // Way to retrieve data
    p.onCallback = function(resMsg) {
      if (resMsg.header === 'done') {
        self.comlink.send('task.results', {
          taskId: msg.taskId,
          results: resMsg.data
        });

        // Killing page
        p.close();
        delete self.pages[msg.taskId];
      }
    };

    // DEBUG
    if (self.params.debug)
      p.onConsoleMessage = function(msg) {
        console.log('PAGE LOG: \n', msg);
      };
  });
}

module.exports = Pager;
