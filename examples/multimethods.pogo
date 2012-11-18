require '../lib/parser/runtime'

generic method =
    generic method id = 0

    with last non nil constructor and index (constructors, block) =
        find last non nil constructor index () =
            for (n = constructors.length - 1, n >= 0, --n)
                if (constructors.(n))
                    return (n)
        
        last index = find last non nil constructor index ()
        last constructor = constructors.(last index)
        if (last constructor)
            block (last constructor, last index)

    for each constructor index next index in (constructors, block) =
        find next non nil constructor index after (n) =
            for (i = n + 1, i < constructors.length, ++i)
                if (constructors.(i))
                    return (i)

        for (n = 0, n < constructors.length - 1, ++n)
            constructor = constructors.(n)
            if (constructor)
                block (constructor, n, find next non nil constructor index after (n))

    gm () =
        name = "genericMethod$#(++generic method id)"
        gm body = "var method = void 0;
                for (var n = 0; n < arguments.length; n++) {
                    if (method = arguments[n][\"#(name)$\" + n]) {
                        break;
                    }
                }
                if (method) {
                    return method.apply(void 0, arguments);
                }
                throw new Error(\"no such method for arguments\")"
        fn = @new Function (gm body)

        fn.add method (constructors, ... , method) =
            for each constructor @(constructor) index @(index) next index @(next index) in (constructors)
                body = "return arguments[#(next index)][\"#(name)$#(next index)\"].apply(void 0, arguments);"
                constructor.prototype."#(name)$#(index)" = @new Function (body)

            with last non nil constructor @(constructor) and index @(index) (constructors)
                constructor.prototype."#(name)$#(index)" = method
        
        fn

point = class {
    to string () = "(#(self.x), #(self.y))"

    constructor (x, y) =
        self.x = x
        self.y = y
}

circle = class {
    to string () = "#(self.center) radius #(self.radius)"

    constructor (center: center, radius: radius) =
        self.center = center
        self.radius = radius
}

file = class {
    to string () = "`#(self.name)'"

    constructor (name) =
        self.name = name
}

move to = generic method ()

move to.add method @(w) (circle) @(p) (point)
    console.log "moving circle #(w), to point #(p)"

move (@new circle (center: @new point (0, 0), radius: 30)) to (@new point (3, 4))

move to.add method @(f) (file) @(dir) (nil)
    console.log "moving file #(f) to dir `#(dir)'"

move (@new file 'stuff.txt') to 'dir'

move to.add method @(a) (nil) @(f) (file)
    console.log "moving #(a) into file #(f)"

move (7) to (@new file '7.txt')

// is this a good idea?
