exports.create interpolation () = {
    stack = []

    start interpolation () =
        self.stack.unshift {brackets = 0}

    open bracket () =
        self.stack.0.brackets = self.stack.0.brackets + 1

    close bracket () =
        self.stack.0.brackets = self.stack.0.brackets - 1

    finished interpolation () =
        self.stack.0.brackets < 0

    stop interpolation () =
        self.stack.shift ()

    interpolating () =
        self.stack.length > 0
}
