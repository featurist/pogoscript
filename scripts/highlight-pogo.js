/*
Language: Pogoscript
*/
hljs.LANGUAGES.pogoscript = function() {
  var operator = function (op) {
    return {
      className: 'operator',
      begin: op
    };
  };
  
  return {
    defaultMode: {
      keywords: {
        'keyword': {'if': 1, 'else': 1, 'for': 1, 'do': 1, 'while': 1, 'self': 1},
        'literal': {'true': 1, 'false': 1, 'null': 1, 'undefined': 1}
      },
      contains: [
        hljs.C_NUMBER_MODE,
        {
          className: 'string',
          begin: "'",
          end: "'",
          contains: [{
            begin: "''", relevance: 0
          }]
        },
        {
          className: 'string',
          begin: '"',
          end: '"',
          contains: [hljs.BACKSLASH_ESCAPE]
        },
        operator(','),
        operator(':'),
        operator(';'),
        operator('=>'),
        operator('=')
      ]
    }
  };
}();