// jshint -W014
var through = require('through2').obj;
var type = require('datalib').type;

module.exports = function(options) {
  if (!options) {
    options = {};
  }

  var keys;
  var samples = [];
  var limit = (options.limit <= 0)
    ? Number.POSITIVE_INFINITY
    : options.limit || 100;

  var flush = function() {
    var types = type.inferAll(samples, options.fields);
    this.emit('infer', types);

    // un-buffer those samples
    samples.forEach(function(obj) {
      this.push(obj);
    }, this);
  };

  return through(function infer(obj, enc, next) {

    if (!keys) {
      keys = Object.keys(obj);
    }

    if (samples.length < limit) {

      samples.push(obj);
      return next();

    } else if (flush) {

      flush.call(this);
      flush = null;

    }

    return next(null, obj);

  }, function(done) {

    // flush if we haven't inferred yet
    if (flush) {
      flush.call(this);
    }

    // free that memory
    samples.length = 0;

  });
};
