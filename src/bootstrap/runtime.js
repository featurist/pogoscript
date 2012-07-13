((function() {
    var self, constructor;
    self = this;
    constructor = function(members) {
        if (members instanceof Function) {
            return function() {
                var self;
                self = this;
                members.call(self);
                return undefined;
            };
        } else {
            return function() {
                var self, member;
                self = this;
                for (member in members) {
                    (function(member) {
                        if (members.hasOwnProperty(member)) {
                            self[member] = members[member];
                        }
                    })(member);
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