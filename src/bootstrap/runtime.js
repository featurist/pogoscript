(function() {
    var self;
    self = this;
    global.object = function(members) {
        var c;
        c = function() {
            members.call(this);
            return undefined;
        };
        return new c;
    };
    global.objectExtending = function(base, members) {
        var c;
        c = function() {
            members.call(this);
            return undefined;
        };
        c.prototype = base;
        return new c;
    };
})();