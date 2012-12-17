(function(continuation) {
    var self = this;
    var gen1_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
    continuation = arguments[arguments.length - 1];
    if (!(continuation instanceof Function)) {
        throw new Error("asynchronous function called synchronously");
    }
    var browserify, fs, glob, root, bundle, require;
    browserify = require("browserify");
    fs = require("fs");
    glob = require("glob");
    root = function(dir) {
        return __dirname + "/../../" + dir;
    };
    bundle = browserify();
    require = function(pattern, continuation) {
        var gen2_arguments = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
        continuation = arguments[arguments.length - 1];
        if (!(continuation instanceof Function)) {
            throw new Error("asynchronous function called synchronously");
        }
        pattern = gen2_arguments[0];
        glob(root(pattern), function(gen3_error, gen4_asyncResult) {
            var libFiles, gen5_items, gen6_i, file;
            if (gen3_error) {
                continuation(gen3_error);
            } else {
                try {
                    libFiles = gen4_asyncResult;
                    console.log(libFiles);
                    gen5_items = libFiles;
                    for (gen6_i = 0; gen6_i < gen5_items.length; ++gen6_i) {
                        file = gen5_items[gen6_i];
                        bundle.require(file);
                    }
                    continuation(void 0, void 0);
                } catch (gen7_exception) {
                    continuation(gen7_exception);
                }
            }
        });
    };
    require("lib/terms/*.js", function(gen8_error, gen9_asyncResult) {
        if (gen8_error) {
            continuation(gen8_error);
        } else {
            try {
                gen9_asyncResult;
                require("lib/*.js", function(gen10_error, gen11_asyncResult) {
                    var js;
                    if (gen10_error) {
                        continuation(gen10_error);
                    } else {
                        try {
                            gen11_asyncResult;
                            bundle.require(__dirname + "/../parser/browser");
                            js = bundle.bundle();
                            fs.writeFile("pogo.js", js, continuation);
                        } catch (gen12_exception) {
                            continuation(gen12_exception);
                        }
                    }
                });
            } catch (gen13_exception) {
                continuation(gen13_exception);
            }
        }
    });
}).call(this, function(gen14_error) {
    if (gen14_error) {
        return setTimeout(function() {
            throw gen14_error;
        }, 0);
    }
});