((function() {
    var self;
    self = this;
    global.object = function(members) {
        var self, c;
        self = this;
        c = function() {
            members.call(this);
            return undefined;
        };
        return new c;
    };
    global.objectExtending = function(base, members) {
        var self, c;
        self = this;
        c = function() {
            members.call(this);
            return undefined;
        };
        c.prototype = base;
        return new c;
    };
})).call(this);