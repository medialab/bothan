module.exports = function(parent) {
console.log('here');
  // Alerting parent
  parent.send('ok', {ok: true});

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
