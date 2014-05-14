(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return function() {
            terms.moduleConstants.defineAs([ "Promise" ], terms.javascript('require("bluebird")'), {
                generated: false
            });
            return terms.moduleConstants.defineAs([ "promise" ], terms.javascript(asyncControl.promise.toString()));
        };
    };
}).call(this);