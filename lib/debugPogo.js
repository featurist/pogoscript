(function() {
    var self = this;
    var removeFrom, moveToHeadOf, nodeArguments;
    removeFrom = function(arg, args) {
        var index, rest, gen1_o;
        index = args.indexOf(arg);
        if (index > -1) {
            rest = args.slice(index + 1);
            args.length = index;
            gen1_o = args;
            return gen1_o.push.apply(gen1_o, rest);
        }
    };
    moveToHeadOf = function(arg, args) {
        removeFrom(arg, args);
        return args.unshift(arg);
    };
    nodeArguments = function() {
        var args;
        args = process.argv.slice(1);
        if (options.debug) {
            moveToHeadOf("--debug", args);
        }
        if (options.debugBrk) {
            moveToHeadOf("--debug-brk", args);
        }
        if (options._[0] === "debug") {
            moveToHeadOf("debug", args);
        }
        return args;
    }();
    exports.debugPogo = function() {
        var self = this;
        var childProcess;
        childProcess = require("child_process");
        return childProcess.spawn(process.argv[0], nodeArguments, {
            customFds: [ 0, 1, 2 ]
        });
    };
}).call(this);