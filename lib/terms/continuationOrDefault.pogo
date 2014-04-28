module.exports (terms) =
    continuation or default () =
        terms.module constants.define ['continuation', 'or', 'default'] as (
            terms.javascript "function(args){var c=args[args.length-1];if(typeof c === 'function'){return {continuation: c, arguments: Array.prototype.slice.call(args, 0, args.length - 1)};}else{return { continuation: function(error, result) { if (error) { throw error; } else { return result; } }, arguments: args }}}"
        )
