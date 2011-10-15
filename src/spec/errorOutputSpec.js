require('cupoftea');
var assert = require('assert');
var _ = require('underscore');
var util = require('util');
var errorOutput = require('../lib/errorOutput');
require('./assertExtensions');

spec('error output', function () {
  spec('source index to line number', function() {
    spec('one first line', function() {
      var source = 'one\ntwo\nthree\n';
      assert.containsFields(errorOutput.sourceIndexToLineAndColumn(source, 2), {
        lineNumber: 1,
        line: 'one',
        columnNumber: 3
      });
    });
    
    spec('one third line', function() {
      var source = 'one\ntwo\nthree\n';
      assert.containsFields(errorOutput.sourceIndexToLineAndColumn(source, 11), {
        lineNumber: 3,
        line: 'three',
        columnNumber: 4
      });
    });
    
    spec('beginning of third line', function() {
      var source = 'one\ntwo\nthree\n';
      assert.containsFields(errorOutput.sourceIndexToLineAndColumn(source, 8), {
        lineNumber: 3,
        line: 'three',
        columnNumber: 1
      });
    });
    
    spec('end of second line', function() {
      var source = 'one\ntwo\nthree\n';
      assert.containsFields(errorOutput.sourceIndexToLineAndColumn(source, 7), {
        lineNumber: 2,
        line: 'two',
        columnNumber: 4
      });
    });
  });
});
