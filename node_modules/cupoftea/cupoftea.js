var _ = require('underscore');
var util = require('util');
var argv = require('optimist').argv;

var debug = function (msg) {
    //console.log(msg);
};

var d = function (msg) {
    console.log(msg);
};

var SpecDefinition = function (desc, parentSpec, index) {
    var childSpecs = [];
    var specsRun = 0;
    var firstRun = true;

    var findChildSpecByDescription = function (desc) {
        debug('childSpecs:');
        _(childSpecs).each(function (spec) {
            debug('spec: ' + spec.description() + ' === ' + desc + ': ' + (spec.description() === desc));
        });
        return _(childSpecs).detect(function (spec) {
            return spec.description() === desc;
        });
    };

    return {
        addSpec: function (desc, definition) {
            var existingSpec = findChildSpecByDescription(desc);
            if (existingSpec) {
                if (firstRun) {
                    throw new Error('this spec seems to be a duplicate: ' + desc);
                }
                debug('found spec: ' + existingSpec.description());
                debug('specs run: ' + specsRun);
                debug('spec index: ' + existingSpec.index());
                if (existingSpec.index() === specsRun) {
                    currentRunStack.pushCurrentSpec(existingSpec, definition);
                }
            } else {
                var childSpec = new SpecDefinition(desc, this, childSpecs.length);
                childSpecs.push(childSpec);
                debug('adding spec: ' + childSpec.description());
                debug('specs run: ' + specsRun);
                debug('spec index: ' + childSpec.index());
                if (childSpec.index() === specsRun) {
                    currentRunStack.pushCurrentSpec(childSpec, definition);
                }
            }
        },
        fullDescription: function () {
            var getParentDesc = function () {
                var parentDesc = parentSpec.fullDescription();
                if (parentDesc) {
                    return parentDesc + ' ';
                } else {
                    return '';
                }
            };

            return getParentDesc() + desc;
        },
        description: function () {
            return desc;
        },
        parent: function () {
            return parentSpec;
        },
        isFinished: function () {
            var finished = _(childSpecs).all(function (spec) {
                return spec.isFinished();
            });
            debug('spec: ' + desc + ' is finished: ' + finished);
            return finished && specsRun === childSpecs.length;
        },
        end: function () {
            firstRun = false;
            if (childSpecs.length > specsRun && childSpecs[specsRun].isFinished()) {
                specsRun++;
            }
        },
        index: function () {
            return index;
        }
    };
};

var TopSpec = function (runStack) {
    return {
        addSpec: function (desc, definition) {
            debug('starting with spec: ' + desc);
            var spec = new SpecDefinition(desc, this, 0);
            var timesRun = 0;
            do {
                timesRun++;
                debug('times run: ' + timesRun);
                runStack.runSpec(function () {
                    runStack.pushCurrentSpec(spec, definition);
                },function (spec, exception) {
                    results.print(spec, exception);
                });
            } while (!spec.isFinished());
        },
        end: function () {
        },
        fullDescription: function () {
            return undefined;
        },
        description: function () {
            return 'top level';
        }
    }
};

var OutstandingCallbacks = function () {
    var currentCallbackId = 0;
    var callbacks = {};

    this.add = function (error) {
        callbacks[currentCallbackId] = error;
        return currentCallbackId++;
    };

    this.remove = function (id) {
        delete callbacks[id];
    };

    this.isEmpty = function () {
        return _.isEmpty(callbacks);
    };
    
    this.first = function () {
        return callbacks[0];
    };
};

var Callbacks = function (runStack) {
    var outstandingCallbacks = new OutstandingCallbacks();
    var currentSpecResultsCalled = false;
    var hasCallbacks = false;

    var results = function (exception) {
        if (!currentSpecResultsCalled) {
            runStack.results(exception);
            currentSpecResultsCalled = true;
        }
    };

    this.shouldNotCall = function () {
        hasCallbacks = true;
        var error = new Error("shouldn't be called");
        return function () {
            results(error);
        };
    };

    this.shouldCall = function (f) {
        hasCallbacks = true;
        var callbackId = outstandingCallbacks.add(new Error('not called'));
        
        var runStack = currentRunStack;
        
        return function () {
            var oldRunStack = currentRunStack;
            currentRunStack = runStack;
            outstandingCallbacks.remove(callbackId);
            try {
                var result = f.apply(null, arguments);
            } catch (e) {
                results(e);
                expectedExceptions.push(e);
                throw e;
            }

            if (outstandingCallbacks.isEmpty()) {
                results();
            }
            
            currentRunStack = oldRunStack;

            return result;
        };
    };

    this.hasCallbacks = function () {
        return hasCallbacks;
    };

    this.assertCallbacks = function () {
        if (!outstandingCallbacks.isEmpty()) {
            results(outstandingCallbacks.first());
        } else if (hasCallbacks) {
            results();
        }
    };
};

var expectedExceptions = [];

var RunStack = function () {
    var callbacks = new Callbacks(this);
    var deepestSpec;
    var currentSpec;

    this.spec = function (desc, definition) {
        currentSpec.addSpec(desc, definition);
    };

    this.pushCurrentSpec = function (newSpec, definition) {
        var oldCurrentSpec = currentSpec;
        deepestSpec = currentSpec = newSpec;
        try {
            definition();
        } finally {
            currentSpec.end();
            currentSpec = oldCurrentSpec;
        }
    };

    this.run = function (spec, definition) {
        try {
            this.pushCurrentSpec(spec, definition);
            if (!callbacks.hasCallbacks()) {
                this.results();
            }
        } catch (e) {
            this.results(e);
        }
    };

    this.shouldCall = function (f) {
        return callbacks.shouldCall(f);
    };

    this.shouldNotCall = function () {
        return callbacks.shouldNotCall();
    };

    this.assertAllCallbacks = function () {
        callbacks.assertCallbacks();
    };

    this.results = function (exception) {
        results.print(deepestSpec, exception);
    };
};

var SimpleResults = function () {
    this.print = function (spec, exception) {
        var desc = spec.fullDescription();
        if (!exception) {
            process.stdout.write(desc + " [0;32mOK[0m\n");
        } else {
            process.stdout.write(desc + " [0;31mFAILED[0m\n");
            if (exception.stack) {
                process.stdout.write(exception.stack + "\n");
            } else {
                process.stdout.write(exception + "\n");
            }
            process.stdout.write("\n");
        }
    };
    
    this.wrapup = function () {
    };
};

var RspecResults = function () {
    var exceptions = [];
    var passes = 0;
    
    this.print = function (spec, exception) {
        if (!exception) {
            process.stdout.write('.');
            passes++;
        } else {
            process.stdout.write('F');
            exceptions.push({spec: spec, exception: exception});
        }
    };
    
    var indent = function (text) {
        return text.replace(/\n/g, '\n    ');
    };
    
    var printExceptions = function () {
        _(exceptions).each (function (ex) {
            process.stdout.write('\n');
            process.stdout.write(ex.spec.fullDescription() + ' [0;31mFAILED[0m\n\n');
            
            if (ex.exception.stack) {
                var stack = indent(ex.exception.stack);
                process.stdout.write('    ' + stack + "\n");
            } else {
                var msg = util.inspect(ex.exception);
                process.stdout.write('    ' + msg + "\n");
            }
        });
    };
    
    this.wrapup = function () {
        process.stdout.write("\n");
        
        printExceptions();
        
        process.stdout.write("\n");
        process.stdout.write('Specs: ' + (exceptions.length + passes) + ' Passed: ' + passes + ' Failed: ' + exceptions.length + '\n');
    };
};

var resultFormatters = {
  'simple': SimpleResults,
  'rspec': RspecResults
};

var results = new (resultFormatters[argv.format || 'rspec'])();

var TopLevelRunStack = function () {
    this.spec = function (desc, definition) {
        var spec = new SpecDefinition(desc, new TopSpec(this), 0);

        do {
            currentRunStack = new RunStack();
            runStacks.push(currentRunStack);
            currentRunStack.run(spec, definition);
        } while (!spec.isFinished());

        currentRunStack = this;
        
        results.wrapup();
    };
};

var currentRunStack = new TopLevelRunStack();
var runStacks = [];

spec = function (desc, definition) {
    currentRunStack.spec(desc, definition);
};

unused_spec = function () {
};

shouldNotCall = function () {
    return currentRunStack.shouldNotCall();
};

shouldCall = function (f) {
    return currentRunStack.shouldCall(f);
};

process.addListener('exit', function () {
    _(runStacks).each(function (runStack) {
        runStack.assertAllCallbacks();
    });
});

process.on('uncaughtException', function(err) {
    if (!_(expectedExceptions).contains(err)) {
        if (err.stack) {
            console.log(err.stack);
        } else {
            console.log(err);
        }
    }
});
