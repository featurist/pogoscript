(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        var continuationOrDefault;
        return continuationOrDefault = function() {
            return terms.moduleConstants.defineAs([ "continuation", "or", "default" ], terms.javascript("function(args){var c=args[args.length-1];if(c instanceof Function){return c;}else{return function(error,result){if(error){throw error;}else{return result;};}}}"));
        };
    };
}).call(this);