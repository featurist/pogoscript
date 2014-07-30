var prototype = exports._prototype = function(p) {
  function constructor() {}

  constructor.prototype = p;

  return function(derived) {
    var o = new constructor();

    if (derived) {
      var keys = Object.keys(derived);

      for (var n = 0; n < keys.length; n++) {
        var key = keys[n];
        o[key] = derived[key];
      }
    }

    return o;
  }
}

exports.prototypeExtending = function(p, obj) {
  return prototype(p(obj));
};
