module.exports (terms) =
  @()
    if (terms.promisesModule)
      promisesModule = JSON.stringify(terms.promisesModule)
      js = "require(#(promisesModule))"
      terms.moduleConstants.define ['Promise'] as (
        terms.javascript(js)
        generated: false
      )
    else
      terms.javascript 'Promise'
