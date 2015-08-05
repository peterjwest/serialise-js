var serialise = module.exports = function(val, options, seen, inline) {
  options = options || {};
  options.indent = options.indent === undefined ? '  ' : options.indent;
  seen = seen || [];
  inline = inline === undefined ? (options.inline === true ? Infinity : options.inline) : inline;

  var type = serialise.type(val);
  return serialise[type](val, options, seen, inline);
};

serialise._indent = function(string, indent) {
  return string.split('\n').map(function(str) { return indent + str; }).join('\n');
};

serialise.typeOrder = [
  'null', 'undefined', 'boolean', 'number', 'string', 'function', 'regex', 'date', 'array', 'object'
];

serialise.types = {
  null: function(val) { return val === null; },
  undefined: function(val) { return val === undefined; },
  boolean: function(val) { return typeof val === 'boolean'; },
  number: function(val) { return typeof val === 'number'; },
  string: function(val) { return typeof val === 'string' || val instanceof String; },
  function: function(val) { return typeof val === 'function'; },
  regex: function(val) { return Object.prototype.toString.call(val) === '[object RegExp]' },
  date: function(val) { return val instanceof Date; },
  array: function(val) { return Array.isArray(val); },
  object: function(val) { return true; }
};

serialise.type = function(val) {
  var type;
  for (var i = 0; i < serialise.typeOrder.length; i++) {
    type = serialise.typeOrder[i];
    if (serialise.types[type](val)) {
      return type;
    }
  }
};

var simpleTypes = ['null', 'undefined', 'boolean', 'number', 'function', 'regex'];
simpleTypes.forEach(function(type) {
  serialise[type] = String;
});

serialise.string = function(val, options) {
  val = String(val).replace(/\r/g, '\\r').replace(/\n/g, '\\n');
  var quote = options.doubleQuotes ? '"' : "'";
  return quote + val.replace(new RegExp(quote, 'g'), '\\' + quote) + quote;
};

serialise.date = function(val) {
  return 'new Date(\'' + val.toISOString() + '\')';
};

serialise.array = function(val, options, seen, inline) {
  seen = seen || [];
  if (seen.indexOf(val) !== -1) return '"[Circular]"';

  if (val.length === 0) return '[]';

  var lines = val.map(function(item, i) {
    return serialise(item, options, seen.concat([val]), inline - options.indent.length);
  });

  var inlineArray = '[' + lines.join(', ') + ']';
  if (inline >= inlineArray.length) {
    return inlineArray;
  }
  return '[\n' + serialise._indent(lines.join(',\n'), options.indent) + '\n]';
};

serialise.object = function(val, options, seen, inline) {
  seen = seen || [];
  if (seen.indexOf(val) !== -1) return '"[Circular]"';

  var keys = Object.keys(val);
  if (keys.length === 0) return '{}';

  var unescapedKey = /^[a-z$_][a-z$_0-9]*$/i;
  var lines = keys.map(function(key, i) {
    var objectKey = (key.match(unescapedKey) ? key : serialise(key, options)) + ': ';
    var newInline = inline - (objectKey + options.indent).length;
    return objectKey + serialise(val[key], options, seen.concat([val]), newInline);
  });

  var inlineObject = '{ ' + lines.join(', ') + ' }';
  if (inline >= inlineObject.length) {
    return inlineObject;
  }
  return '{\n' + serialise._indent(lines.join(',\n'), options.indent) + '\n}';
};
