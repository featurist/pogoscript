var _ = require('underscore');

exports.errors = function (terms) {
  return new function () {
    this.errors = [];
  
    this.clear = function () {
      this.errors = [];
    };
  
    this.hasErrors = function () {
      return this.errors.length > 0;
    };
  
    this.printErrors = function (sourceFile, buffer) {
      _.each(this.errors, function (error) {
        error.printError(sourceFile, buffer);
      });
    };
  
    this.addTermWithMessage = function (term, message) {
      return this.addTermsWithMessage([term], message);
    };
  
    this.addTermsWithMessage = function (errorTerms, message) {
      var e = terms.semanticError (errorTerms, message);
      this.errors.push(e);
      return e;
    };
  };
};
