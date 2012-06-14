var _ = require('underscore');

exports.writeToBufferWithDelimiter = function (array, delimiter, buffer, scope) {
  var writer;
  if (typeof scope === 'function') {
    writer = scope;
  } else {
    writer = function (item) {
      item.generateJavaScript(buffer, scope);
    };
  }
  
  var first = true;
  _(array).each(function (item) {
    if (!first) {
      buffer.write(delimiter);
    }
    first = false;
    writer(item);
  });
};

var actualCharacters = [
  [/\\/g, '\\\\'],
  [new RegExp('\b', 'g'), '\\b'],
  [/\f/g, '\\f'],
  [/\n/g, '\\n'],
  [/\0/g, '\\0'],
  [/\r/g, '\\r'],
  [/\t/g, '\\t'],
  [/\v/g, '\\v'],
  [/'/g, "\\'"],
  [/"/g, '\\"']
];

exports.formatJavaScriptString = function(s) {
  for (var i = 0; i < actualCharacters.length; i++) {
    var mapping = actualCharacters[i];
    s = s.replace(mapping[0], mapping[1]);
  }
  
  return "'" + s + "'";
};
