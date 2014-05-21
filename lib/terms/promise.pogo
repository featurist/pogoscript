module.exports (terms) =
  @()
    terms.moduleConstants.define ['Promise'] as (
      terms.javascript('require("bluebird")')
      generated: false
    )
