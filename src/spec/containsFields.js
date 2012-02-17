var util = require('util');
var assert = require('assert');
var _ = require('underscore');

var inspect = function (o) {
  return util.inspect(o, false, 10, true);
};

var containsFields = exports.containsFields = function (actual, expected, key, originalActual) {
  var index = function (i) {
    return key + '[' + i + ']';
  };

  var field = function (f) {
    if (key) {
      return key + '.' + f;
    } else {
      return f;
    }
  };

  if (_.isArray(expected)) {
    var originalActual = (originalActual || actual);
    containsFields(expected.length, actual.length, field('length'), originalActual);
    for (var n in expected) {
      containsFields(actual[n], expected[n], index(n), originalActual);
    }
  } else if (_.isObject(expected)) {
    var originalActual = (originalActual || actual);
    for (var n in expected) {
      containsFields(actual[n], expected[n], field(n), originalActual);
    }
  } else {
    var inspectedOriginalActual = inspect(originalActual);
    var inspectedActual = inspect(actual);
    var inspectedExpected = inspect(expected);
    var msg = 'in ' + inspectedOriginalActual + ', ' + key + ' ' + inspectedActual + ' should be equal to ' + inspectedExpected;
    assert.deepEqual(expected, actual, msg);
  }
};
