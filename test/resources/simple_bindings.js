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

  // Close
  parent.on('close', function() {
    phantom.exit(0);
  });
};
