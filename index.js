var through = require('through2').obj;
var type = require('datalib').type;

module.exports = function(options) {
  if (!options) {
    options = {};
  }

  var keys;
  var samples = [];
  var limit = options.limit || 100;
  var inferred = false;

  var flush = function() {
    var types = type.inferAll(samples, options.fields);
    this.emit('infer', types);

    // un-buffer those samples
    samples.forEach(function(obj) {
      this.push(obj);
    }, this);

    inferred = true;
  };

  return through(function infer(obj, enc, next) {

    if (!keys) {
      keys = Object.keys(obj);
    }

    if (samples.length < limit) {

      samples.push(obj);
      return next();

    } else if (!inferred) {

      flush.call(this);

    }

    return next(null, obj);

  }, function(done) {

    // flush if we haven't inferred yet
    if (!inferred) {
      flush.call(this);
    }

    // free that memory
    samples.length = 0;

  });
};
