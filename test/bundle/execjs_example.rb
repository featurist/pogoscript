require 'execjs'
contents = File.read("./html/pogo.js").to_s
context = ExecJS.compile("var window = {};" + contents)
puts context.call("window.pogoscript.compile", "1 + 1", {'ugly' => true})
