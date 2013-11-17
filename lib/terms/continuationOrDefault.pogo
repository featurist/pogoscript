module.exports (terms) =
    continuation or default () =
        terms.module constants.define ['continuation', 'or', 'default'] as (
            terms.javascript "function(args){var c=args[args.length-1];if(c instanceof Function){return c;}else{return function(error,result){if(error){throw error;}else{return result;};}}}"
        )
