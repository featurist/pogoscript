exports.try = function(body, catchBody, finallyBody, cb) {
  var callbackCalled = false;

  var callback = function (error, result) {
    if (!callbackCalled) {
      callbackCalled = true;
      cb(error, result);
    }
  };

  try {
    body(function (error, result) {
      if (error) {
        if (finallyBody && catchBody) {
          try {
            catchBody(error, function (error, result) {
              try {
                finallyBody(function (finallyError) {
                  callback(finallyError || error, finallyError || error? undefined: result);
                });
              } catch (error) {
                callback(error);
              }
            });
          } catch (error) {
            try {
              finallyBody(function (finallyError) {
                callback(finallyError || error);
              });
            } catch (error) {
              callback(error);
            }
          }
        } else if (catchBody) {
          try {
            catchBody(error, callback);
          } catch (error) {
            callback(error);
          }
        } else {
          try {
            finallyBody(function (finallyError) {
              callback(finallyError || error, finallyError? undefined: result);
            });
          } catch (error) {
            callback(error);
          }
        }
      } else {
        if (finallyBody) {
          try {
            finallyBody(function (finallyError) {
              callback(finallyError, finallyError? undefined: result);
            });
          } catch (error) {
            callback(error);
          }
        } else {
          callback(undefined, result);
        }
      }
    });
  } catch (error) {
    if (finallyBody && catchBody) {
      try {
        catchBody(error, function (error, result) {
          try {
            finallyBody(function (finallyError) {
              callback(finallyError || error, finallyError? undefined: result);
            });
          } catch (error) {
            callback(error);
          }
        });
      } catch (error) {
        try {
          finallyBody(function (finallyError) {
            callback(finallyError || error);
          });
        } catch (error) {
          callback(error);
        }
      }
    } else if (catchBody) {
      try {
        catchBody(error, callback);
      } catch (error) {
        callback(error);
      }
    } else {
      try {
        finallyBody(function (finallyError) {
          callback(finallyError || error);
        });
      } catch (error) {
        callback(error);
      }
    }
  }
};

exports.fork = function (block) {
    block(function () {});
};

exports.if = function (condition, thenBody, cb) {
  if (condition) {
    try {
      thenBody(cb);
    } catch (ex) {
      cb(ex);
    }
  } else {
    cb();
  }
};

exports.ifElse = function (condition, thenBody, elseBody, cb) {
  if (condition) {
    try {
      thenBody(cb);
    } catch (ex) {
      cb(ex);
    }
  } else {
    try {
      elseBody(cb);
    } catch (ex) {
      cb(ex);
    }
  }
};

exports.ifElseIfElse = function (cases, cb) {
    for (var n = 0; n < cases.length; n++) {
        var _case = cases[n];
        if (_case.condition) {
            try {
                _case.body (cb)
            } catch (error) {
                cb(error);
            }
            return;
        }
    }

    cb();
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

        for (var n = 0; n < futureCallbacks.length; n++) {
            futureCallbacks[n](operationError, operationResult);
        }
    }

    try {
      action(callback);
    } catch (error) {
      operationComplete = true;
      operationError = error;
    }

    return function (callback) {
        if (operationComplete) {
            callback(operationError, operationResult);
        } else {
            futureCallbacks.push(callback);
        }
    };
};
