# object-stream-infer-types

Infer the types of keys from a stream of objects using [datalib's type
inference](https://github.com/vega/datalib/wiki/Import#dl_type_inferAll):

```js
var infer = require('object-stream-infer-types');
var streamify = require('array-stream');

// assuming an object stream, such as:
var stream = streamify([
  {x: '1', y: 'foo', z: '1/1/2010'},
  {x: '2', y: 'bar', z: '5/5/2015'},
  // etc.
]);

stream
  .pipe(infer())
  // the stream emits an 'infer' event before sending any data
  .on('infer', function(types) {
    // types is an object, namely:
    // {x: 'integer', y: 'string', z: 'date'}
  })
  .on('data', function(d) {
    // coerce your data accordingly
  });
```
