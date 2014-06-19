(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var promisesModule, js;
        return function() {
            var promisesModule, js;
            if (terms.promisesModule) {
                promisesModule = JSON.stringify(terms.promisesModule);
                js = "require(" + promisesModule + ")";
                return terms.moduleConstants.defineAs([ "Promise" ], terms.javascript(js), {
                    generated: false
                });
            } else {
                return terms.javascript("Promise");
            }
        };
    };
}).call(this);