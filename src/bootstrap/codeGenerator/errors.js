var _ = require('underscore');

exports.errors = function (cg) {
  return new function () {
    this.errors = [];
  
    this.clear = function () {
      this.errors = [];
    };
  
    this.hasErrors = function () {
      return this.errors.length > 0;
    };
  
    this.printErrors = function (sourceFile) {
      _.each(this.errors, function (error) {
        error.printError(sourceFile);
      });
    };
  
    this.addTermWithMessage = function (term, message) {
      return this.addTermsWithMessage([term], message);
    };
  
    this.addTermsWithMessage = function (terms, message) {
      var e = new function () {
        this.isSemanticFailure = true;
        this.terms = terms;
        this.message = message;

        this.generateJavaScript = function(buffer, scope) {
        };
      
        this.generateJavaScriptStatement = this.generateJavaScript;
        this.generateJavaScriptHashEntry = this.generateJavaScript;
      
        this.definitions = function (scope) {
          return [];
        };
      
        this.walkEachSubterm = function () {};

        this.printError = function(sourceFile) {
          sourceFile.printLocation(this.terms[0].location());
          process.stdout.write(this.message + '\n');
        };
      };
      this.errors.push(e);
      return e;
    };
  };
};
