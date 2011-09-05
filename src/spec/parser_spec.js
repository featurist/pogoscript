require('cupoftea');
var assert = require('assert');
var _ = require('underscore');
var util = require('util');
var parser = require('../lib/parser');

spec('parser', function () {
  assert.containsFields = function (actual, expected, key, originalActual) {
    if (typeof(expected) == 'object') {
      assert.ok(typeof(actual) == 'object', 'expected ' + util.inspect(actual) + ' to be an object');
      
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
      var inspectedOriginalActual = util.inspect(originalActual);
      var inspectedActual = util.inspect(actual);
      var inspectedExpected = util.inspect(expected);
      var msg = 'in ' + inspectedOriginalActual + ', ' + key + ' ' + inspectedActual + ' should be equal to ' + inspectedExpected;
      assert.deepEqual(expected, actual, msg);
    }
  };
  
  assert.doesntParse = function (obj) {
    assert.strictEqual(obj, null);
  };
  
  spec('integer', function () {
    spec('parses integer', function () {
      assert.containsFields(parser.parse(parser.integer, '8'), {integer: 8, index: 1});
    });

    spec('parses big integer', function () {
      assert.containsFields(parser.parse(parser.integer, '888'), {integer: 888, index: 3});
    });

    spec("doesn't parse identifier", function () {
      assert.doesntParse(parser.parse(parser.integer, 'id'));
    });

    spec("parses integer followed by id", function () {
      assert.containsFields(parser.parse(parser.integer, '8 id'), {integer: 8, index: 1});
    });

    spec("parses integer within source", function () {
      assert.containsFields(parser.parse(parser.integer, 'id 8', 3), {integer: 8, index: 4});
    });

    spec("doesn't parse integer within source", function () {
      assert.doesntParse(parser.parse(parser.integer, 'id id 8', 3));
    });

    spec("parses one integer from many in source", function () {
      assert.containsFields(parser.parse(parser.integer, 'id 1 2 3 4 5 6 7 8', 9), {integer: 4, index: 10});
    });
  });
  
  spec('identifier parses identifier', function () {
    spec('parses identifier', function () {
      assert.containsFields(parser.parse(parser.identifier, 'one two tHrEe four five', 8), {identifier: 'tHrEe', index: 13});
    });
    
    spec('parses identifier with leading spaces', function () {
      assert.containsFields(parser.parse(parser.identifier, ' one'), {identifier: 'one', index: 4});
    });
  });
  
  spec('whitespace', function () {
    spec('parses some whitespace', function () {
      assert.containsFields(parser.parse(parser.whitespace, '   one'), {index: 3});
    });
    
    spec('even parses no whitespace', function () {
      assert.containsFields(parser.parse(parser.whitespace, 'one'), {index: 0});
    });
  });
  
  spec('float', function () {
    spec('parses floats', function () {
      assert.containsFields(parser.parse(parser.float, '5.6'), {float: 5.6, index: 3});
    });

    spec("doesn't parse floats", function () {
      spec("that terminate immediately after the point", function() {
        assert.doesntParse(parser.parse(parser.float, '5.'));
      });

      spec("that don't have digits after the point", function() {
        assert.doesntParse(parser.parse(parser.float, '5.d'));
      });

      spec("that are just integers", function() {
        assert.doesntParse(parser.parse(parser.float, '5'));
      });
    });
  });
  
  spec('keyword', function () {
    spec('parses keywords', function () {
      assert.containsFields(parser.parse(parser.keyword('object'), 'object'), {keyword: 'object', index: 6});
    });
  });
  
  spec('sequence', function () {
    var seq = parser.sequence(
        'type',
        ['name', parser.identifier],
        parser.keyword('to'),
        ['id', parser.integer]);

    spec('parses correct sequences', function () {
      assert.containsFields(parser.parse(seq, 'tank to 8'), {index: 9, termName: 'type', name: {identifier: 'tank', index: 4}, id: {integer: 8, index: 9}});
    });

    spec('should not parse sequence', function () {
      assert.doesntParse(parser.parse(seq, '9 to tank'));
    });
  });
  
  spec('choice (float or identifier)', function () {
    var floatOrIdentifier = parser.choice(parser.float, parser.identifier);
    
    spec('parses float', function () {
      assert.containsFields(parser.parse(floatOrIdentifier, '78.4'), {index: 4, float: 78.4});
    });
    
    spec('parses identifier', function () {
      assert.containsFields(parser.parse(floatOrIdentifier, 'xxy'), {index: 3, identifier: 'xxy'});
    });
    
    spec("doesn't parse integer", function () {
      assert.doesntParse(parser.parse(floatOrIdentifier, '45'));
    });
  });
});
