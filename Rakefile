require 'rubygems'
require 'erb'
require 'fileutils'
require 'rake/testtask'
require 'json'

desc "Build pogo-script-source gem"
task :gem do
  require 'rubygems'
  require 'rubygems/package'

  gemspec = Gem::Specification.new do |s|
    s.name      = 'pogo-script-source'
    s.version   = JSON.parse(File.read('package.json'))["version"]
    s.date      = Time.now.strftime("%Y-%m-%d")

    s.homepage    = "http://pogoscript.org/"
    s.summary     = "The PogoScript Compiler"
    s.description = <<-EOS
      PogoScript is a programming language that emphasises readability, is
      friendly to domain specific languages and compiles to regular Javascript.
    EOS

    s.files = [
      'lib/pogo_script/pogo-script.js',
      'lib/pogo_script/source.rb'
    ]

    s.authors           = ['Tim Macfarlane']
    s.email             = 'tim@featurist.co.uk'
    s.rubyforge_project = 'pogo-script-source'
    s.license           = "MIT"
  end

  file = File.open("pogo-script-source.gem", "w")
  Gem::Package.open(file, 'w') do |pkg|
    pkg.metadata = gemspec.to_yaml

    path = "lib/pogo_script/source.rb"
    contents = <<-ERUBY
module PogoScript
  module Source
    def self.bundled_path
      File.expand_path("../pogo-script.js", __FILE__)
    end
  end
end
    ERUBY
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end

    contents = File.read("extras/pogo-script.js")
    path = "lib/pogo_script/pogo-script.js"
    pkg.add_file_simple(path, 0644, contents.size) do |tar_io|
      tar_io.write(contents)
    end
  end
end