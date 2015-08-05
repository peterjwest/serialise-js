# serialise-js

[![build status](https://circleci.com/gh/peterjwest/serialise-js.svg?&style=shield&circle-token=975d524a7ce4f4e387faa7756e3366498139ad95)](https://circleci.com/gh/peterjwest/serialise-js) [![Coverage Status](https://coveralls.io/repos/peterjwest/serialise-js/badge.svg?branch=master&service=github)](https://coveralls.io/github/peterjwest/serialise-js?branch=master)

### An extensible library for serialising JavaScript data

## Installation

    npm install serialise-js --save


## Usage

Serialise any variable:
```
var serialise = require('serialise-js');
serialise({
  foo: [1, 2, 3],
  bar: { key: 'value' },
  "the key": "the value"
});
```

Returns:
```
{
  foo: [
    1,
    2,
    3
  ],
  bar: {
    key: 'value'
  },
  'the key': 'the value'
}
```

### Options

You can pass in an options object as a second argument to `serialise`:
- `indent` - Set the characters used for a single indent, default 2 spaces
- `doubleQuotes` - Set this to `true` to serialise strings with double quotes
- `inline` - Set this to `true` to serialise object and arrays inline, set to a number to serialise inline below lines of this length

Example:
```
var input = { foo: ['bar', { zim: 'gir' }] };
serialise(input, { indent: ' ', doubleQuotes: true, inline: 25 });
```

Returns:
```
{
 foo: [
  "bar",
  { zim: "gir" }
 ]
}
```

### Caveats

- Recursive instances of objects and arrays are replaced by the string `'[Circular]'`
- Functions are serialised, but this may not be valid javascript if they are native functions or use variables from another scope, you can prevent this by overriding `serialise.function` e.g. `serialise.function = function() { return 'null'; }`


## Extending

It's easy to extend and modify the library.

Say you want to support serialisation of the popular [moment.js](http://momentjs.com/) library.
By default moment will be serialised as a normal object, which is [pretty gross](https://gist.github.com/peterjwest/f302874e345aa6944fa7). We can allow it to serialise as it would be defined (or close enough).

1. The first thing we need to do is create a serialisation method, these are all exposed on the `serialise` function (e.g. `serialise.string`). We can just add another one:
    ```
    serialise.moment = function(moment, options) {
      return 'moment(' +serialise.string(moment.format(), options) + ')';
    };
    ```

    This uses `serialise.string` to serialise the formatted date string.

2. Next we need to create a type matching function to detect this type, and add it to `serialise.types`:
    ```
    serialise.types.moment = function(val) {
      return val && val._isAMomentObject;
    };
    ```

3. Finally we need to add this type to the `typeOrder` array, which defines the order in this the types are checked, in our case we need it to be checked before `object`, so we can just add it to the start of the array:
    ```
    serialise.typeOrder.unshift('moment');
    ```

Now we can use it:

    console.log(serialise({ time: moment('2015-01-01') }));

Which outputs:
```
{
  time: moment('2015-01-01T00:00:00+00:00')
}
```

This could be neater, still, but you get the idea.
