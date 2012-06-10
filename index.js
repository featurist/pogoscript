((function() {
    var self;
    self = this;
    module.exports = require("src/bootstrap/commandLine.js");
    require.extensions[".pogo"] = function(module, filename) {
        var self;
        self = this;
        return exports.runFileInModule(filename, module);
    };
})).call(this);