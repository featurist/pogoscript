(function() {
    var self = this;
    var target;
    target = function() {
        if (typeof window === "undefined") {
            return this;
        } else {
            return window;
        }
    }();
    target.pogoscript = require("./compiler");
}).call(this);