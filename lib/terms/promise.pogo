module.exports (terms) =
  @()
    terms.moduleConstants.define ['Promise'] as (
      terms.javascript('require("bluebird")')
      generated: false
    )

    terms.moduleConstants.define ['promise'] as (
      terms.javascript(asyncControl.promise.toString())
    )
