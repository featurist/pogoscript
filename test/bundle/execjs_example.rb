require 'execjs'
contents = File.read("./html/pogo.js").to_s
context = ExecJS.compile(contents)
puts context.call("pogoscript.compile", "1 + 1", {'ugly' => true})
