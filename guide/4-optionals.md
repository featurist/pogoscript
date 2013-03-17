---
layout: doc
guide: Optional Arguments
permalink: optionals.html
---

Some function calls can get away with just having good defaults, and not require everything to be configured ad tedium. For these sorts of functions, optional arguments can be used.

Say we have a function to transcode CD quality audio into bandwidth friendly MP3:

    convert (audio file) into mp3

This function would come with some useful defaults for bitrate, say 128kbps. But no doubt at some point we'd like to be able to override that, so we could call it like this:

    convert (audio file) into mp3 (bitrate: 320 kbps)

This passes an additional named argument to the function. This is indeed a JavaScript hash object, which we'll see covered shortly. To accept this argument, for example, if we were defining this function ourselves, we'd write something like this:

    convert (audio file) into mp3 (bitrate: 128 kbps) =
        // code to convert an audio file into mp3 with bitrate

When the function is defined, the default value can be specified, as the value of the function call `128 kbps` is above.
