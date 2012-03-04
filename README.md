# Whaa?

PogoScript is a readable dialect of JavaScript.

Well, that’s the idea anyway. It’s also a bit of an experiment in making a DSL friendly programming language, ala Ruby, but faster, stronger, better.

# Installation

Pogoscript requires [node.js](http://nodejs.org/) and [npm](http://npmjs.org/) to be installed.

As its still a little bit experimental pogoscript is not in npm yet, but you can still have npm install it for you from the git repo.

    git clone https://github.com/featurist/pogoscript.git
    cd pogoscript
    npm link

npm will track the latest changes when you `git pull`

# Usage

## Running

    pogo helloWorld.pogo

## Compiling

    pogo -c helloWorld.pogo

Will produce `helloWorld.js`.

## Watching and Compiling

    pogo -cw helloWorld.pogo

# More

There's more on the [pogoscript home page](http://pogoscript.org/), and you can find some Pogoscript -> Javascript examples [here](http://featurist.github.com/pogo-examples/).
