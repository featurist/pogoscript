(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var asyncResult;
        return asyncResult = function() {
            var resultVariable;
            resultVariable = terms.generatedVariable([ "async", "result" ]);
            resultVariable.isAsyncResult = true;
            return resultVariable;
        };
    };
}).call(this);