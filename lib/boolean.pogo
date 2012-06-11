terms = require './terms'

module.exports = terms.term {
    constructor (value) =
        self.boolean = value
        self.is boolean = true

    generate java script (buffer, scope) =
      if (self.boolean)
        buffer.write 'true'
      else
        buffer.write 'false'
}
