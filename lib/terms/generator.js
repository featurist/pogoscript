(function() {
    var self = this;
    module.exports = function(terms) {
        var self = this;
        return terms.term({
            constructor: function(variable, list) {
                var self = this;
                self.operator = "<-";
                self.isOperator = true;
                self.isGenerator = true;
                self.variable = variable;
                self.list = list;
                return self.operatorArguments = [ variable, list ];
            }
        });
    };
}).call(this);