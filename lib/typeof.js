exports.typeof = function (expression, type) {
  return this.term(function () {
    this.isInstanceOf = true;
    this.expression = expression;
    this.type = type;

    this.generateJavaScript = function (buffer, scope) {
        buffer.write("(typeof(");
        this.expression.generateJavaScript(buffer, scope);
        buffer.write(") === '" + this.type + "')");
    };
  });
};
