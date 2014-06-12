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

exports.for = function (test, incr, loop) {
  return new Promise(function (success, failure) {
    function testAndLoop(loopResult) {
      Promise.resolve(test()).then(function (testResult) {
        if (testResult) {
          Promise.resolve(loop()).then(incrTestAndLoop, failure);
        } else {
          success(loopResult);
        }
      }, failure);
    }

    function incrTestAndLoop (loopResult) {
      Promise.resolve(incr()).then(function () {
        testAndLoop(loopResult);
      }, failure);
    }

    testAndLoop();
  });
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
