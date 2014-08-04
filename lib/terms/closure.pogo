_ = require 'underscore'
codegenUtils = require "./codegenUtils"

module.exports (terms) =
    optionalParameters (optionalParameters, next) =
      if (optionalParameters.length > 0)
        {
          options = terms.generatedVariable ['options']

          parameters () =
            next.parameters ().concat [self.options]

          statements () =
            optionalStatements = _.map(optionalParameters) @(parm)
              terms.definition (terms.variable (parm.field), optional (self.options, parm.field, parm.value), shadow: true)

            optionalStatements.concat (next.statements ())

          hasOptionals = true
        }
      else
        next

    optional = terms.term {
      constructor (options, name, defaultValue) =
        self.options = options
        self.name = name
        self.defaultValue = defaultValue

      properDefaultValue () =
        if (self.defaultValue == nil)
          terms.variable ['undefined']
        else
          self.defaultValue

      generate (scope) =
        self.code (
          '('
          self.options.generate (scope)
          '&&'
          self.options.generate (scope)
          ".hasOwnProperty('" + codegenUtils.concatName (self.name) + "')&&"
          self.options.generate (scope)
          "." + codegenUtils.concatName (self.name) + "!==void 0)?"
          self.options.generate (scope)
          '.' + codegenUtils.concatName (self.name) + ':'
          self.properDefaultValue ().generate (scope)
        )
    }

    asyncParameters (closure, next) = {
        parameters () =
            next.parameters ()

        statements () =
            next.statements ()
    }

    (closure) containsSplatParameter =
        _.any (closure.parameters) @(parameter)
            parameter.isSplat

    createSplatParameterStrategyFor (closure) =
        nonSplatParams = takeFrom (closure.parameters) while @(parameter)
            !parameter.isSplat

        before = nonSplatParams.slice (0, nonSplatParams.length - 1)
        splat = nonSplatParams.(nonSplatParams.length - 1)
        after = closure.parameters.slice (nonSplatParams.length + 1)

        terms.closureParameterStrategies.splatStrategy (
            before: before
            splat: splat
            after: after
        )

    createOptionalParameterStrategyFor (closure) =
        terms.closureParameterStrategies.optionalStrategy (
            before: closure.parameters
            options: closure.optionalParameters
        )

    terms.term {
        constructor (
          parameters
          body
          returnLastStatement: true
          redefinesSelf: false
          async: false
          definesModuleConstants: false
          returnPromise: false
          callsFulfillOnReturn: false
          isNewScope: true
        ) =
          self.isBlock = true
          self.isClosure = true
          self.isNewScope = isNewScope
          self.setParameters(parameters)

          self.body = if (returnPromise)
            body.promisify(statements: true)
          else
            body

          self.redefinesSelf = redefinesSelf
          self.makeAsync (async || self.body.isAsync)
          self.returnLastStatement = returnLastStatement
          self.definesModuleConstants = definesModuleConstants
          self.callsFulfillOnReturn = callsFulfillOnReturn

        blockify (parameters, returnPromise: false, redefinesSelf: nil) =
          self.setParameters(parameters)

          if (returnPromise)
            self.body = self.body.promisify(statements: true)

          if (redefinesSelf != nil)
            self.redefinesSelf = redefinesSelf

          self

        setParameters(parameters) =
          self.parameters = terms.argumentUtils.positionalArguments(parameters)
          self.optionalParameters = terms.argumentUtils.optionalArguments(parameters)

        makeAsync (a) =
          self.isAsync = a

        scopify () =
          if ((self.parameters.length == 0) @and (self.optionalParameters.length == 0) @and @not self.notScope)
            if (self.body.returnsPromise)
              terms.resolve (terms.functionCall (self, []))
            else
              terms.scope (self.body.statements, async: false)
          else
            self

        parameterTransforms () =
          if (self._parameterTransforms)
            return (self._parameterTransforms)

          optionals = optionalParameters (
            self.optionalParameters
            selfParameter (
              terms
              self.redefinesSelf
              blockParameters (self)
            )
          )

          splat = splatParameters (
            terms
            optionals
          )

          if (optionals.hasOptionals && splat.hasSplat)
            terms.errors.addTerms (self.optionalParameters) withMessage 'cannot have splat parameters with optional parameters'

          self._parameterTransforms = splat

        transformedStatements () =
          terms.statements (self.parameterTransforms ().statements ())

        transformedParameters () =
          self.parameterTransforms ().parameters ()

        defineParameters (scope, parameters) =
          for each @(parameter) in (parameters)
            parameter.declare (scope)

        generate (scope) =
          self.generateIntoBuffer @(buffer)
            parametersStrategy = self.parametersStrategy ()

            self.rewriteResultTermToReturn ()

            buffer.write ('function(')
            definedParameters = parametersStrategy.definedParameters ()
            parametersStrategy.generateJavaScriptParameters (buffer, scope)
            buffer.write ('){')
            bodyScope = scope.subScope ()
            self.defineParameters (bodyScope, definedParameters)

            if (self.definesModuleConstants)
              buffer.write (terms.moduleConstants.generate (scope))

            buffer.write (self.generateSelfAssignment ())

            parametersStrategy.generateJavaScriptParameterStatements (buffer, scope, terms.variable ['arguments'])
            buffer.write (self.body.generateStatements (bodyScope, isScope: self.isNewScope))

            buffer.write ('}')

        generateFunction (scope) =
          self.code (
            '('
            self.generate (scope)
            ')'
          )

        generateSelfAssignment () =
          if (self.redefinesSelf)
            'var self=this;'
          else
            ''

        rewriteResultTermToReturn () =
          if (self.returnLastStatement)
            self.body.rewriteLastStatementToReturn (async: self.callsFulfillOnReturn)

        asyncify () =
          self.body.asyncify (returnCallToContinuation: self.returnLastStatement)
          self.makeAsync (true)

        parametersStrategy () =
          strategy = if ((self) containsSplatParameter)
            createSplatParameterStrategyFor (self)
          else if (self.optionalParameters.length > 0)
            createOptionalParameterStrategyFor (self)
          else
            terms.closureParameterStrategies.normalStrategy (self.parameters)

          terms.closureParameterStrategies.functionStrategy (strategy)
    }

blockParameters (block) = {
  parameters () =
    block.parameters

  statements () =
    block.body.statements
}

selfParameter (cg, redefinesSelf, next) =
  if (redefinesSelf)
    {
      parameters () =
        next.parameters ()

      statements () =
        [cg.definition (cg.selfExpression (), cg.variable ['this'], shadow: true)].concat (next.statements ())
    }
  else
    next

splatParameters (cg, next) =
  parsedSplatParameters = parseSplatParameters (cg, next.parameters ())

  {
    parameters () =
      parsedSplatParameters.firstParameters

    statements () =
      splat = parsedSplatParameters

      if (splat.splatParameter)
        lastIndex = 'arguments.length'

        if (splat.lastParameters.length > 0)
          lastIndex := lastIndex + ' - ' + splat.lastParameters.length

        splatParameter =
          cg.definition (
            splat.splatParameter
            cg.javascript ('Array.prototype.slice.call(arguments, ' + splat.firstParameters.length + ', ' + lastIndex + ')')
            shadow: true
          )

        lastParameterStatements = [splatParameter]
        for (n = 0, n < splat.lastParameters.length, ++n)
          param = splat.lastParameters.(n)
          lastParameterStatements.push (
            cg.definition (
              param
              cg.javascript('arguments[arguments.length - ' + (splat.lastParameters.length - n) + ']')
              shadow: true
            )
          )

        lastParameterStatements.concat (next.statements ())
      else
        next.statements ()

    hasSplat = parsedSplatParameters.splatParameter
  }

parseSplatParameters = module.exports.parseSplatParameters (cg, parameters) =
  firstParameters = takeFrom (parameters) while @(param)
    !param.isSplat

  maybeSplat = parameters.(firstParameters.length)
  splatParam = nil
  lastParameters = nil

  if (maybeSplat && maybeSplat.isSplat)
    splatParam := firstParameters.pop ()
    splatParam.shadow = true
    lastParameters := parameters.slice (firstParameters.length + 2)

    lastParameters := _.filter(lastParameters) @(param)
      if (param.isSplat)
        cg.errors.addTerm (param) withMessage 'cannot have more than one splat parameter'
        false
      else
        true
  else
    lastParameters := []

  {
    firstParameters = firstParameters
    splatParameter = splatParam
    lastParameters = lastParameters
  }

takeFrom (list) while (canTake) =
  takenList = []

  for each @(item) in (list)
    if (canTake (item))
      takenList.push (item)
    else
      return (takenList)

  takenList
