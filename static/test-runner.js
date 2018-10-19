const path = require('path')
const fs = require('fs')

require('babel-register')({
  'presets': [
    ['env', {
      'targets': { 'node': 8 }
    }],
    'stage-0'
  ]
})

let constant
let scripts
try {
  constant = require('../../../../app.asar/src/utils/Constant')
  scripts = require('../../../../app.asar/src/utils/Scripts')
} catch (err) {
  constant = require('../src/utils/Constant')
  scripts = require('../src/utils/Scripts').default
}
let {print, scriptInit} = require('./test-helper')

process.on('message', function (m) {
  let {event, data} = m
  if (event === constant.EVENT_RUN_SCRIPT) {
    print('\n=> start the script "' + data + '"')
    scriptInit(data)

    // require(scripts.getScriptFilePath(data))
    const tempScript = path.join(process.cwd(), 'static', 'scripts', data)

    try {
      fs.unlinkSync(tempScript)
    } catch (err) {
    }

    // console.log(tempScript, scripts.getScriptFilePath(data))
    fs.createReadStream(scripts.getScriptFilePath(data)).pipe(fs.createWriteStream(tempScript)).on('close', () => {
      require(tempScript)
    }).on('error', print)
  }
})
