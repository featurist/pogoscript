var cg = require('../lib/parser/codeGenerator').codeGenerator();
var closure = require('../lib/terms/closure');
var shouldContainFields = require('./containsFields.js').containsFields;

describe('closure term', function () {
  describe('parseSplatParameters', function () {
    it('no splat', function () {
      var splat = closure.parseSplatParameters(cg, [cg.variable(['a'])]);
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: undefined,
        lastParameters: []
      });
    });
    
    it('only splat', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.splat()
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [],
        splatParameter: {variable: ['a']},
        lastParameters: []
      });
    });
    
    it('splat start', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.splat(),
        cg.variable(['b'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [],
        splatParameter: {variable: ['a']},
        lastParameters: [{variable: ['b']}]
      });
    });
    
    it('splat end', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat()
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: []
      });
    });
    
    it('splat middle', function () {
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat(),
        cg.variable(['c'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: [{variable: ['c']}]
      });
    });
    
    it('two splats', function () {
      var secondSplat = cg.splat();
      secondSplat.secondSplat = true;
      
      var splat = closure.parseSplatParameters(cg, [
        cg.variable(['a']),
        cg.variable(['b']),
        cg.splat(),
        cg.variable(['c']),
        secondSplat,
        cg.variable(['d'])
      ]);
      
      shouldContainFields(splat, {
        firstParameters: [{variable: ['a']}],
        splatParameter: {variable: ['b']},
        lastParameters: [
          {variable: ['c']},
          {variable: ['d']}
        ]
      });
    });
  });
});
