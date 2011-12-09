module.exports = function(terms, message) {
  return new function () {
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
};
