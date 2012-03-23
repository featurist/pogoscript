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
          contains: [
            hljs.BACKSLASH_ESCAPE,
            {
              begin: '#\\(',
              end: '\\)',
              className: 'interpolated'
            }
          ]
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