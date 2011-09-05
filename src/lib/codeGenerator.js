exports.identifier = function (name) {
  return {
    identifier: name
  };
};

exports.integer = function (value) {
  return {
    integer: value
  };
};

exports.float = function (value) {
  return {
    float: value
  };
};

exports.variable = function (name) {
  return {
    variable: name
  };
};

exports.functionCall = function (fun, arguments) {
  return {
    termName: 'functionCall',
    function: fun,
    arguments: arguments
  };
};