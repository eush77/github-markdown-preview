var fs = require('fs')
var convert = require('./')

var md = fs.readFileSync('path/to/your.markdown').toString()

convert(md, function(err, html) {
  console.log(html)
})
