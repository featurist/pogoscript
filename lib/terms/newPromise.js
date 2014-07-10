(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return function(gen1_options) {
            var closure, statements, term, callsFulfillOnReturn;
            closure = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "closure") && gen1_options.closure !== void 0 ? gen1_options.closure : void 0;
            statements = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "statements") && gen1_options.statements !== void 0 ? gen1_options.statements : void 0;
            term = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "term") && gen1_options.term !== void 0 ? gen1_options.term : void 0;
            callsFulfillOnReturn = gen1_options !== void 0 && Object.prototype.hasOwnProperty.call(gen1_options, "callsFulfillOnReturn") && gen1_options.callsFulfillOnReturn !== void 0 ? gen1_options.callsFulfillOnReturn : true;
            return terms.newOperator(terms.functionCall(terms.promise(), [ closure || terms.closure([ terms.onFulfilledFunction ], statements || terms.statements([ term ]), {
                isNewScope: false,
                callsFulfillOnReturn: callsFulfillOnReturn
            }) ])).alreadyPromise();
        };
    };
}).call(this);