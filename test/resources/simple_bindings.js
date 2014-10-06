module.exports = function(messenger) {

  // Alerting parent
  messenger.send('ok', {ok: true});

  // Hello
  messenger.on('hello', function() {
    console.log('Hello world!');
  });

  // Error
  messenger.on('error', function() {
    throw new Error('Achtung!');
  });

  // Close
  messenger.on('close', function() {
    phantom.exit(0);
  });
};
