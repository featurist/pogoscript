var MemoryStream = function () {
  var buffer = [];
  
  this.write = function (str) {
    if (typeof str == 'undefined') {
      throw new Error('wrote undefined');
    }
    buffer.push(str);
  };
  
  var totalSizeOfBuffer = function () {
    var size = 0;
    
    for (var n in buffer) {
      size += buffer[n].length;
    }
    
    return size;
  };
  
  this.toString = function () {
    var b = new Buffer(totalSizeOfBuffer());
    var offset = 0;
    
    for (var n in buffer) {
      offset += b.write(buffer[n], offset);
    }
    
    return b.toString();
  };
};

exports.MemoryStream = MemoryStream;