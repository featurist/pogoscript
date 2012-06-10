((function() {
    var self, commandLine;
    self = this;
    commandLine = require("./src/bootstrap/commandLine");
    module.exports = commandLine;
    require.extensions[".pogo"] = function(module, filename) {
        var self;
        self = this;
        return commandLine.runFileInModule(filename, module);
    };
})).call(this);