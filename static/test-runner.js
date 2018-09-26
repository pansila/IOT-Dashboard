const path = require('path')

require('babel-register')({
  'presets': [
    ['env', {
      'targets': { 'node': 7 }
    }],
    'stage-3'
  ]
})

let {print2log, scriptInit} = require('./test-helper')

process.on('message', function (m) {
  let {type, value} = m
  if (type === 'script') {
    print2log('\n=> start the script "' + value.slice(0, -3) + '"')
    scriptInit(value)
    // require(path.join(__dirname, 'scripts', value))
    require('./scripts/' + value)
  }
})
