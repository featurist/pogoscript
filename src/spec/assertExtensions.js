var util = require('util');
var assert = require('assert');

assert.containsFields = function (actual, expected, key, originalActual) {
  var inspectedOriginalActual = util.inspect(originalActual);
  
  if (typeof(expected) === 'object') {
    assert.ok(typeof(actual) === 'object', 'in ' + inspectedOriginalActual + ', expected ' + key + ' ' + util.inspect(actual) + ' to be an object');
    
    var parentKey;
    if (key) {
      parentKey = key + '.';
    } else {
      parentKey = '';
    }
    
    var originalActual = (originalActual || actual);
    for (var key in expected) {
      assert.containsFields(actual[key], expected[key], parentKey + key, originalActual);
    }
  } else {
    var inspectedActual = util.inspect(actual);
    var inspectedExpected = util.inspect(expected);
    var msg = 'in ' + inspectedOriginalActual + ', ' + key + ' ' + inspectedActual + ' should be equal to ' + inspectedExpected;
    assert.deepEqual(expected, actual, msg);
  }
};
