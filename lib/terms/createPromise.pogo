asyncControl = require '../asyncControl'

module.exports (terms) =
  @()
    terms.promise()

    terms.moduleConstants.define ['promise'] as (
      terms.javascript(asyncControl.promise.toString())
    )
