#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var opn = require('opn')
var chokidar = require('chokidar')
var convert = require('./')
var server = require('./server')
var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    's': 'server',
    'p': 'port',
    'w': 'watch',
    'o': 'output',
    'h': 'help'
  },
  boolean: ['server', 'watch']
})

if (!argv._.length || argv.help) {
  var usage = '' +
    'Usage: github-markdown-preview <markdown-file> [options]\n\n' +
    'outputs html of markdown with github styles to stdout\n\n' +
    'Options:\n\n' +
    '  -h, --help     output usage information\n' +
    '  -s, --server   watch file and server changes. This overrides -w and -o.\n' +
    '  -w, --watch    watch markdown file and convert on changes\n' +
    '  -p, --port     optional TCP port to start the server at, defaults to $PORT or 9999\n' +
    '  -o, --output   optional file path for output. stdout is used by default.\n' +
    '                 required when using --watch.'
  return console.log(usage)
}

if (argv.watch && !argv.output) {
  return console.log('You must specify --output path when using --watch')
}

var markdownPath = path.resolve(argv._[0])

if (argv.server) {
  chokidar
    .watch(markdownPath, {persistent: true})
    .on('change', updateServerHTML)

  var port = argv.port || process.env.PORT || 9999

  return updateServerHTML(function() {
    server.listen(port)
    console.log('Preview now being served at http://localhost:' + port)
    opn('http://localhost:' + port)
  })
}

if (argv.watch) {
  chokidar
    .watch(markdownPath, {persistent: true})
    .on('change', logHTML)
}

logHTML()

function generateHTML(callback) {
  var md = fs.readFileSync(markdownPath)
  convert(md, callback)
}

function logHTML() {
  generateHTML(function(err, html) {
    if (err) throw err
    if (argv.o) return fs.writeFileSync(path.resolve(argv.o), html)
    console.log(html)
  })
}

function updateServerHTML(cb) {
  generateHTML(function(err, html) {
    server.update(html)
    if (typeof cb === 'function') cb()
  })
}
