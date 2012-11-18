(function() {
    var self = this;
    exports.createInterpolation = function() {
        var self = this;
        return {
            stack: [],
            startInterpolation: function() {
                var self = this;
                return self.stack.unshift({
                    brackets: 0
                });
            },
            openBracket: function() {
                var self = this;
                return self.stack[0].brackets = self.stack[0].brackets + 1;
            },
            closeBracket: function() {
                var self = this;
                return self.stack[0].brackets = self.stack[0].brackets - 1;
            },
            finishedInterpolation: function() {
                var self = this;
                return self.stack[0].brackets < 0;
            },
            stopInterpolation: function() {
                var self = this;
                return self.stack.shift();
            },
            interpolating: function() {
                var self = this;
                return self.stack.length > 0;
            }
        };
    };
}).call(this);