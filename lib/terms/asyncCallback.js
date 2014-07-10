(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var asyncCallback;
        return asyncCallback = function(body, gen1_options) {
            var resultVariable;
            resultVariable = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "resultVariable") && gen1_options.resultVariable !== void 0 ? gen1_options.resultVariable : void 0;
            var params;
            params = function() {
                if (resultVariable) {
                    return [ resultVariable ];
                } else {
                    return [];
                }
            }();
            return terms.closure(params, body, {
                isNewScope: false
            });
        };
    };
}).call(this);