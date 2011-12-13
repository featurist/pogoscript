var _ = require('underscore');

module.exports = new function () {
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
        throw this;
      };

      this.printError = function(sourceFile) {
        process.stdout.write(this.message + '\n');
        process.stdout.write('\n');
        sourceFile.printIndex(this.index);
      };
    };
    this.errors.push(e);
    return e;
  };
};