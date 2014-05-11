exports.try = function(body, catchBody, finallyBody) {
  var p = Promise.resolve(body()).then(void 0, catchBody);

  if (catchBody) {
    p = p.then(void 0, catchBody);
  }

  if (finallyBody) {
    p = p.then(function (result) {
      return Promise.resolve(finallyBody()).then(function () {
        return result;
      });
    });
  }

  return p;
};

exports.fork = function (block) {
    block(function () {});
};

exports.while = function (conditionBody, body, cb) {
  var loop = function () {
    try {
      conditionBody(function (error, result) {
        if (error) {
          cb(error);
        } else if (result) {
          try {
            body(function (error, result) {
              if (error) {
                cb(error);
              } else {
                loop();
              }
            });
          } catch (error) {
            cb(error);
          }
        } else {
          cb();
        }
      });
    } catch (error) {
      cb(error);
    }
  };
  
  loop();
};

exports.for = function (test, incr, loop, cb) {
  try {
    var testAndLoop = function () {
      test(function (error, anotherLoop) {
        if (error) {
          cb(error);
        } else {
          if (anotherLoop) {
            loop(incrTestAndLoop);
          } else {
            cb();
          }
        }
      })
    };

    var incrTestAndLoop = function (error) {
      if (error) {
        cb(error);
      } else {
        incr(function (error) {
          if (error) {
            cb(error);
          } else {
            testAndLoop();
          }
        });
      }
    };

    testAndLoop();
  } catch (error) {
    cb(error);
  }
};

exports.future = function (action) {
    var operationComplete = false;
    var operationError, operationResult;
    var futureCallbacks = [];

    function callback (error, result) {
        operationComplete = true;
        operationError = error;
        operationResult = result;
        future.complete = true;

        for (var n = 0; n < futureCallbacks.length; n++) {
            futureCallbacks[n](operationError, operationResult);
        }
    }

    var future = function (callback) {
        if (operationComplete) {
            callback(operationError, operationResult);
        } else {
            futureCallbacks.push(callback);
        }
    };

    future.complete = false;
    callback.future = future;

    try {
      action(callback);
    } catch (error) {
      operationComplete = true;
      operationError = error;
    }

    return future;
};

exports.promisify = function (fn) {
  return new Promise(function (onFulfilled, onRejected) {
    fn(function (error, result) {
      if (error) {
        onRejected(error);
      } else {
        onFulfilled(result);
      }
    });
  });
};

exports.promise = function (block) {
  return new Promise(function (continuation, fail) {
    function resolve(p, block) {
      if (p !== void 0 && typeof p.then === 'function') {
        p.then(function (result) {
          try {
            block(result);
          } catch (e) {
            fail(e);
          }
        }, fail);
      } else {
        block(p);
      }
    }

    block(resolve, continuation);
  });
}

exports.promise2 = function (block) {
  var onFulfilled, onRejected;

  function resolve(p, block) {
    if (p !== void 0 && typeof p.then === 'function') {
      p.then(function (result) {
        try {
          block(result);
        } catch (e) {
          onRejected(e);
        }
      }, onRejected);
    } else {
      block(p);
    }
  }

  var finished;
  var passed = false;
  var result;

  block(resolve, function (_result) {
    finished = true;
    if (passed) {
      onFulfilled(_result);
    } else {
      result = _result;
    }
  });

  passed = true;

  var promise = new Promise(function (_onFulfilled, _onRejected) {
    onFulfilled = _onFulfilled;
    onRejected = _onRejected;
  });

  if (finished) {
    return result;
  } else {
    return promise;
  }
}

exports.listComprehension = function (items, areRanges, block) {
  return new Promise(function (onFulfilled, onRejected) {
    var indexes = [];
    var results = {};
    var completed = 0;
    var wasError = false;

    if (items.length > 0) {
      for (var n = 0; n < items.length; n++) {
        Promise.resolve(block(n, items[n], function (result, index) {
          indexes.push(index);
          results[index] = result;
        })).then(function (result) {
          completed++;

          if (completed == items.length && !wasError) {
            var sortedResults = [];

            indexes.sort();

            for (n = 0; n < indexes.length; n++) {
              if (areRanges) {
                sortedResults.push.apply(sortedResults, results[indexes[n]]);
              } else {
                sortedResults.push(results[indexes[n]]);
              }
            }

            onFulfilled(sortedResults);
          }
        }, onRejected);
      }
    } else {
      onFulfilled([]);
    }
  });
};
