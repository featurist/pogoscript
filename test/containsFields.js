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

  var originalActual = (originalActual || actual);
  var message = function () {
    var inspectedOriginalActual = inspect(originalActual);
    var inspectedActual = inspect(actual);
    var inspectedExpected = inspect(expected);
    return 'in ' + inspectedOriginalActual + ', ' + key + ' ' + inspectedActual + ' should be equal to ' + inspectedExpected;
  };

  if (_.isArray(expected)) {
    assert.ok(actual, message());

    containsFields(actual.length, expected.length, field('length'), originalActual);
    for (var n in expected) {
      containsFields(actual[n], expected[n], index(n), originalActual);
    }
  } else if (_.isObject(expected)) {
    assert.ok(actual, message());

    for (var n in expected) {
      if (expected.hasOwnProperty(n)) {
        containsFields(actual[n], expected[n], field(n), originalActual);
      }
    }
  } else {
    assert.deepEqual(actual, expected, message());
  }
};
