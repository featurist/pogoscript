(function() {
    var self = this;
    var commandLine;
    commandLine = require("./lib/parser/commandLine");
    module.exports = commandLine;
    require.extensions[".pogo"] = function(module, filename) {
        var self = this;
        return commandLine.runFileInModule(filename, module);
    };
}).call(this);
