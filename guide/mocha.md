---
layout: doc
guide: Testing with Mocha
weight: 8
---

## Recognising Pogoscript

Place your pogoscript specs in the `test` directory:

    test/
      spec.pogo

Then invoke `mocha` with the `--compilers` switch:

    mocha --compilers pogo:pogo

Or alternatively, place those arguments in `test/mocha.opts` and Mocha will use them as defaults:

    --compilers pogo:pogo

You can place other arguments in there too, to select the `spec` reporter for example:

    --compilers pogo:pogo --reporter spec

## Promises

Testing asynchronous code in Mocha just works. Recent versions of Mocha support promises, so if you return a promise Mocha will wait for it to fulfill or be rejected. There's no need to have a `done` parameter on your mocha test functions, just write normal pogoscript.

    // test/spec.pogo

    expect = require 'chai'.expect
    express = require 'express'
    httpism = require 'httpism'

    describe 'api'
      api = nil
      server = nil

      beforeEach
        app = express()
        app.get '/' @(req, res)
          res.send { name = 'api', version = '2' }

        server := app.listen 12345

        api := httpism.api 'http://localhost:12345/'

      it 'can load root'
        expect (api.get '/'!.body).to.eql { name = 'api', version '1' }
