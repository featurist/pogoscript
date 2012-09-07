var atry = function(body, catchBody, finallyBody, cb) {
  try {
    body(function (error, result) {
      if (error) {
        if (finallyBody) {
          catchBody(error, function (error, result) {
            finallyBody(cb);
          });
        } else {
          catchBody(error, cb);
        }
      } else {
        cb(undefined, result);
      }
    });
  } catch (error) {
    catchBody(error, function (error, result) {
      
    });
  }
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

var awhile = function (conditionBody, body, cb) {
  var loop = function () {
    conditionBody(function (error, result) {
      if (error) {
        cb(error);
      } else if (result) {
        body(function (error, result) {
          if (error) {
            cb(error);
          } else {
            loop();
          }
        });
      } else {
        cb();
      }
    });
  };
  
  loop();
};
