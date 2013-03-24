(function() {
    var self = this;
    var _;
    _ = require("underscore");
    exports.isLessThan = function(a, b) {
        var self = this;
        var parseVersion, compare, gen1_items, gen2_i, gen3_forResult;
        parseVersion = function(v) {
            if (v[0] === "v") {
                v = v.substring(1);
            }
            return _.map(v.split("."), function(n) {
                return parseInt(n);
            });
        };
        compare = function(v1, v2) {
            if (v1 > v2) {
                return 1;
            } else if (v2 > v1) {
                return -1;
            } else {
                return 0;
            }
        };
        gen1_items = _.zip(parseVersion(a), parseVersion(b));
        for (gen2_i = 0; gen2_i < gen1_items.length; ++gen2_i) {
            gen3_forResult = void 0;
            if (function(gen2_i) {
                var versionNumbers, comparison;
                versionNumbers = gen1_items[gen2_i];
                comparison = compare(versionNumbers[0], versionNumbers[1]);
                if (comparison) {
                    gen3_forResult = comparison < 0;
                    return true;
                }
            }(gen2_i)) {
                return gen3_forResult;
            }
        }
        return false;
    };
}).call(this);