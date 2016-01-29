var csv = require('fast-csv');
var fs = require('fs');
var streamify = require('stream-array');

var infer = require('../');
var assert = require('assert');

describe('infer()', function() {

  it('infers column types', function(done) {
    streamify([
      {x: '1', y: 'foo'},
      {x: '2', y: 'bar'}
    ])
    .pipe(infer())
    .on('infer', function(types) {
      assert.deepEqual(types, {
        x: 'integer',
        y: 'string'
      });
      done();
    });
  });

  it('passes through all the data', function(done) {
    var data = [
      {x: '1', y: 'foo'},
      {x: '2', y: 'bar'},
      {x: '3', y: 'baz'},
      {x: '2', y: 'foo'},
      {x: '1', y: 'foo'},
      {x: '2', y: 'bar'},
      {x: '3', y: 'baz'},
      {x: '2', y: 'bar'},
      {x: '1', y: 'foo'},
      {x: '2', y: 'bar'},
    ];

    var inferred;
    var read = 0;
    var order = [];

    streamify(data)
      .pipe(infer())
      .on('infer', function(types) {
        inferred = types;
        assert.equal(read, 0, 'we should not have gotten data yet');
      })
      .on('data', function() {
        read++;
      })
      .on('finish', function(error) {
        assert(!error, error);
        assert.deepEqual(inferred, {
          x: 'integer',
          y: 'string'
        });
        assert.equal(read, data.length);
        done();
      });
  });

  it('respects the "limit" option', function(done) {

    var data = [];
    var i;
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    for (i = 0; i < 20; i++) {
      data.push({x: String(1 + Math.random()), y: alpha[i]});
    }
    for (true; i < 100; i++) {
      data.push({x: null, y: null});
    }

    var inferred;
    var read = 0;

    streamify(data)
      .pipe(infer({
        limit: 20
      }))
      .on('infer', function(types) {
        inferred = types;
      })
      .on('data', function(d) {
        read++;
      })
      .on('finish', function(error) {
        assert(!error, error);
        assert.deepEqual(inferred, {
          x: 'number',
          y: 'string'
        });
        assert.equal(read, 100);
        done();
      });

  });

});
