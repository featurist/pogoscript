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
