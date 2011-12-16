var sourceIndexToLineAndColumn = exports.sourceIndexToLineAndColumn = function(source, index) {
  var lines = source.split(/\n/);
  var accumulatedIndex = 0;
  
  for (var l = 0; l < lines.length; l++) {
    var line = lines[l];
    var newAccumulatedIndex = accumulatedIndex + line.length + 1;
    
    if (index >= accumulatedIndex && index < newAccumulatedIndex) {
      return {
        lineNumber: l + 1,
        line: line,
        columnNumber: index - accumulatedIndex + 1
      };
    }
    
    accumulatedIndex = newAccumulatedIndex;
  }
};

var sourceIndexToLineAndColumn = exports.sourceLocationToLineAndColumn = function(source, location) {
  var lines = source.split(/\n/);
  
  if (location.first_line == location.last_line) {
    return {
      
    }
  } else {
    
  }
};
