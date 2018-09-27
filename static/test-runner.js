// const path = require('path')

require('babel-register')({
  'presets': [
    ['env', {
      'targets': { 'node': 7 }
    }],
    'stage-3'
  ]
})

let constant
try {
  constant = require('../../../../app.asar/src/utils/Constant')
} catch (err) {
  constant = require('../src/utils/Constant')
}
let {print2log, scriptInit} = require('./test-helper')

process.on('message', function (m) {
  let {event, data} = m
  if (event === constant.EVENT_RUN_SCRIPT) {
    print2log('\n=> start the script "' + data.slice(0, -3) + '"')
    scriptInit(data)
    require('./scripts/' + data)
  }
})
