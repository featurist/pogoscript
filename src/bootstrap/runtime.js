((function() {
    var self;
    self = this;
    constructor = function(members) {
        if (members instanceof Function) {
            var c;
            return c = function() {
                members.call(this);
                return undefined;
            };
        } else {
            return c = function() {
                var member;
                for (var member in members) {
                    if (members.hasOwnProperty(member)) {
                        this[member] = members[member];
                    }
                }
            };
        }
    };
    global.object = function(members) {
        var self, c;
        self = this;
        c = constructor(members);
        return new c;
    };
    global.objectExtending = function(base, members) {
        var self, c;
        self = this;
        c = constructor(members);
        c.prototype = base;
        return new c;
    };
})).call(this);