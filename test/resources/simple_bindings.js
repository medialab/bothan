module.exports = function(parent) {

  // Alerting parent
  setTimeout(function() {
    parent.send('ok', {ok: true});
  }, 300);

  // Hello
  parent.on('hello', function() {
    console.log('Hello world!');
  });

  // Error
  parent.on('error', function() {
    throw new Error('Achtung!');
  });

  // Request
  parent.on('request', function(msg) {
    parent.replyTo(msg.id, {roger: true});
  });

  // Ask
  parent.on('ask', function() {
    parent.request('request', function(err) {
      console.log('received');
    });
  });

  // Close
  parent.on('close', function() {
    phantom.exit(0);
  });

  // Crash
  parent.on('crash', function() {
    phantom.exit(1);
  });
};
