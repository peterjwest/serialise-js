var serialise = module.exports = function(val, options, seen) {
  options = options || {};
  options.indent = options.indent === undefined ? '  ' : options.indent;
  seen = seen || [];

  var type = serialise.type(val);
  return serialise[type](val, options, seen);
};

serialise.indent = function(string, indent) {
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

serialise.array = function(val, options, seen) {
  seen = seen || [];
  if (seen.indexOf(val) !== -1) return '"[Circular]"';

  if (val.length === 0) return '[]';

  return '[\n' + val.map(function(item, i) {
    return serialise.indent(serialise(item, options, seen.concat([val])), options.indent);
  }).join(',\n') + '\n]';
};

serialise.object = function(val, options, seen) {
  seen = seen || [];
  if (seen.indexOf(val) !== -1) return '"[Circular]"';

  var keys = Object.keys(val);

  if (keys.length === 0) return '{}';

  var unescapedKey = /^[a-z$_][a-z$_0-9]*$/i;
  return '{\n' + keys.map(function(key, i) {
    var escapedKey = key.match(unescapedKey) ? key : serialise(key, options);
    return serialise.indent(
      escapedKey + ': ' + serialise(val[key], options, seen.concat([val])),
      options.indent
    );
  }).join(',\n') + '\n}';
};
