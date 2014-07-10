module.exports (terms) =
    asyncCallback (body, resultVariable: nil) =
        params =
          if (resultVariable)
            [resultVariable]
          else
            []

        terms.closure (
            params
            body
            isNewScope: false
        )
