((function() {
    var self;
    self = this;
    module.exports = function(terms) {
        var self, asyncResult;
        self = this;
        return asyncResult = function() {
            var resultVariable;
            resultVariable = terms.generatedVariable([ "async", "result" ]);
            resultVariable.isAsyncResult = true;
            return resultVariable;
        };
    };
})).call(this);