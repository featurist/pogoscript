---
layout: doc
guide: Optional Arguments
weight: 4
---

Some function calls can get away with just having good defaults, and not require everything to be configured ad tedium. For these sorts of functions, optional arguments can be used.

Say we have a function to transcode CD quality audio into bandwidth friendly MP3:

    convert (audioFile) intoMp3

This function would come with some useful defaults for bitrate, say 128kbps. But no doubt at some point we'd like to be able to override that, so we could call it like this:

    convert (audioFile) intoMp3 (bitrate = 320kbps)

This passes an additional named argument to the function. We write `320kbps`, which is a call to a function called `kbps`:

    (n)kbps = n * 1024

The optional argument is passed in an object as the last argument, so you could write it like this:

    convert (audioFile) intoMp3 { bitrate = 320kbps }

In fact named arguments are _always_ passed as the last argument, so this:

    (bitrate = 320kbps) convert (audioFile) intoMp3

Is identical to the original call.

This helps if we're calling a function with a block:

    time
      someLongOperation()

Or

    time (message = 'the long operation')
      someLongOperation()

The order of the arguments passed is identical, with the difference being an additional trailing **options** argument.

We'll cover objects in more detail in the next session.

To accept this argument, for example, if we were defining this function, we'd write something like this:

    convert (audioFile) intoMp3 (bitrate = 128kbps) =
        // code to convert an audio file into mp3 with bitrate

When the function is defined, the default value can be specified, as the value of the function call `128kbps` is above.
