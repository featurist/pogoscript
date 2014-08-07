(function() {
    var prototype = function(p) {
        function constructor() {}
        p = p || {};
        constructor.prototype = p;
        function derive(derived) {
            var o = new constructor();
            if (derived) {
                var keys = Object.keys(derived);
                for (var n = 0; n < keys.length; n++) {
                    var key = keys[n];
                    o[key] = derived[key];
                }
            }
            return o;
        }
        derive.prototype = p;
        return derive;
    };
    var self = this;
    exports.class = function(prototype) {
        var self = this;
        var constructor;
        constructor = function() {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 0, arguments.length);
            prototype.constructor.apply(self, args);
            return void 0;
        };
        constructor.prototype = prototype;
        return constructor;
    };
    exports.classExtending = function(baseConstructor, prototypeMembers) {
        var self = this;
        var prototypeConstructor, prototype, constructor;
        prototypeConstructor = function() {
            var self = this;
            var field;
            for (field in prototypeMembers) {
                (function(field) {
                    if (prototypeMembers.hasOwnProperty(field)) {
                        self[field] = prototypeMembers[field];
                    }
                })(field);
            }
            return void 0;
        };
        prototypeConstructor.prototype = baseConstructor.prototype;
        prototype = new prototypeConstructor();
        constructor = function() {
            var self = this;
            var args = Array.prototype.slice.call(arguments, 0, arguments.length);
            prototype.constructor.apply(self, args);
            return void 0;
        };
        constructor.prototype = prototype;
        return constructor;
    };
}).call(this);