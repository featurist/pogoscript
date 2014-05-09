module.exports (terms) =
  @()
    terms.moduleConstants.define ['promise'] as (
      terms.javascript(asyncControl.promise.toString())
    )
