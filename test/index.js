var serialise = require('../index');
var assert = require('assert');

var lines = function() {
  return [].join.call(arguments, '\n');
};

describe('serialise-js', function() {
  describe('type()', function() {
    it('identities null', function() {
      assert.equal(serialise.type(null), 'null');
    });

    it('identities undefined', function() {
      assert.equal(serialise.type(undefined), 'undefined');
    });

    it('identities booleans', function() {
      assert.equal(serialise.type(true), 'boolean');
      assert.equal(serialise.type(false), 'boolean');
    });

    it('identities numbers', function() {
      assert.equal(serialise.type(3), 'number');
      assert.equal(serialise.type(1.23), 'number');
      assert.equal(serialise.type(Infinity), 'number');
      assert.equal(serialise.type(NaN), 'number');
    });

    it('identities functions', function() {
      assert.equal(serialise.type(function() {}), 'function');
      assert.equal(serialise.type(console.log), 'function');
    });

    it('identities regexes', function() {
      assert.equal(serialise.type(/foo/), 'regex');
      assert.equal(serialise.type(new RegExp('foo')), 'regex');
    });

    it('identities dates', function() {
      assert.equal(serialise.type(new Date()), 'date');
    });

    it('identities arrays', function() {
      assert.equal(serialise.type([]), 'array');
      assert.equal(serialise.type(new Array(3)), 'array');
    });

    it('identities strings', function() {
      assert.equal(serialise.type('foo'), 'string');
      assert.equal(serialise.type(new String('foo')), 'string');
    });

    it('identities objects', function() {
      assert.equal(serialise.type({ foo: 'bar' }), 'object');
      assert.equal(serialise.type(new Object()), 'object');
    });
  });

  describe('null()', function() {
    it('serialises null', function() {
      assert.equal(serialise.null(null), 'null');
    });
  });

  describe('undefined()', function() {
    it('serialises undefined', function() {
      assert.equal(serialise.undefined(undefined), 'undefined');
    });
  });

  describe('boolean()', function() {
    it('serialises booleans', function() {
      assert.equal(serialise.boolean(true), 'true');
      assert.equal(serialise.boolean(false), 'false');
    });
  });

  describe('number()', function() {
    it('serialises numbers', function() {
      assert.equal(serialise.number(3), '3');
      assert.equal(serialise.number(3.25), '3.25');
    });
  });

  describe('string()', function() {
    it('serialises an empty string', function() {
      assert.equal(serialise.string('', {}), "''");
    });

    it('serialises a string using single quotes', function() {
      assert.equal(serialise.string('foo bar', {}), "'foo bar'");
    });

    it('serialises a string using double quotes', function() {
      assert.equal(serialise.string('foo bar', { doubleQuotes: true }), '"foo bar"');
    });

    it('serialises a string containing single quotes using single quotes', function() {
      assert.equal(serialise.string("foo 'bar'", { doubleQuotes: false }), "'foo \\'bar\\''");
    });

    it('serialises a string containing double quotes using double quotes', function() {
      assert.equal(serialise.string('foo "bar"', { doubleQuotes: true }), '"foo \\"bar\\""');
    });

    it('serialises a string containing newlines', function() {
      assert.equal(serialise.string('foo \nbar \rzim', {}), "'foo \\nbar \\rzim'");
    });
  });

  describe('function()', function() {
    it('serialises functions', function() {
      assert.equal(serialise.function(function(x) { return x; }), 'function (x) { return x; }');
      assert.equal(serialise.function(console.log), 'function () { [native code] }');
    });
  });

  describe('regex()', function() {
    it('serialises regexes', function() {
      assert.equal(serialise.regex(/foo\/bar\\zim/), '/foo\\/bar\\\\zim/');
    });
  });

  describe('date()', function() {
    it('serialises dates', function() {
      assert.equal(serialise.date(
        new Date('November 1, 1985 22:00:00')),
        "new Date('1985-11-01T22:00:00.000Z')"
      );
    });
  });

  describe('array()', function() {
    it('serialises an empty array', function() {
      assert.equal(serialise.array([]), '[]');
    });

    it('serialises a simple array', function() {
      assert.equal(serialise.array([1, '2', 3.33], { indent: '   ' }), lines(
        '[',
        '   1,',
        '   \'2\',',
        '   3.33',
        ']'
      ));
    });

    it('serialises a simple array without indentation', function() {
      assert.equal(serialise.array([1, 2, 3], { indent: '' }), lines(
        '[',
        '1,',
        '2,',
        '3',
        ']'
      ));
    });

    it('serialises a nested array', function() {
      assert.equal(serialise.array([1, [2, 3]], { indent: '  ' }), lines(
        '[',
        '  1,',
        '  [',
        '    2,',
        '    3',
        '  ]',
        ']'
      ));
    });

    it('serialises recursive arrays', function() {
      var array = [];
      array.push(array);
      assert.equal(serialise.array(array, { indent: '  ' }), lines(
        '[',
        '  "[Circular]"',
        ']'
      ));
    });
  });

  describe('object()', function() {
    it('serialises an empty object', function() {
      assert.equal(serialise.object({}), '{}');
    });

    it('serialises an object without indentation', function() {
      var object = { foo: 1, bar: '2', 'foo bar': 3.33, 'foo-bar': 4 };
      assert.equal(serialise.object(object, { indent: '' }), lines(
        '{',
        'foo: 1,',
        'bar: \'2\',',
        '\'foo bar\': 3.33,',
        '\'foo-bar\': 4',
        '}'
      ));
    });

    it('serialises an object', function() {
      var object = { foo: 1, bar: '2', 'foo bar': 3.33, 'foo-bar': 4 };
      assert.equal(serialise.object(object, { indent: '  ' }), lines(
        '{',
        '  foo: 1,',
        '  bar: \'2\',',
        '  \'foo bar\': 3.33,',
        '  \'foo-bar\': 4',
        '}'
      ));
    });

    it('serialises a nested object', function() {
      var object = { foo: { bar: 1 } };
      assert.equal(serialise.object(object, { indent: '  ' }), lines(
        '{',
        '  foo: {',
        '    bar: 1',
        '  }',
        '}'
      ));
    });

    it('serialises recursive objects', function() {
      var object = {};
      object.self = object;
      assert.equal(serialise.object(object, { indent: '  ' }), lines(
        '{',
        '  self: "[Circular]"',
        '}'
      ));
    });
  });

  it('serialises any type', function() {
    assert.equal(serialise(null), 'null');
    assert.equal(serialise(undefined), 'undefined');
    assert.equal(serialise(true), 'true');
    assert.equal(serialise(3), '3');
    assert.equal(serialise('test'), '\'test\'');
    assert.equal(serialise(/test/), '/test/');
    assert.equal(serialise(
      new Date('November 1, 1985 22:00:00')),
      "new Date('1985-11-01T22:00:00.000Z')"
    );
    assert.equal(serialise([1, 2, 3]), lines(
      '[',
      '  1,',
      '  2,',
      '  3',
      ']'
    ));
    assert.equal(serialise({ foo: 'bar' }), lines(
      '{',
      '  foo: \'bar\'',
      '}'
    ));
  });

  it('serialises with custom options', function() {
    var options = { indent: '    ', doubleQuotes: true };
    assert.equal(serialise({ 'foo-bar': 'bar' }, options), lines(
      '{',
      '    "foo-bar": "bar"',
      '}'
    ));
  });

  it('serialises multiple nested types correctly', function() {
    var data = { foo: [1, 2, { bar: '3', zim: /test/ }] };
    assert.equal(serialise(data), lines(
      '{',
      '  foo: [',
      '    1,',
      '    2,',
      '    {',
      '      bar: \'3\',',
      '      zim: /test/',
      '    }',
      '  ]',
      '}'
    ));
  });
});
