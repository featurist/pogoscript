(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return function() {
            return terms.moduleConstants.defineAs([ "promise" ], terms.javascript(asyncControl.promise.toString()));
        };
    };
}).call(this);