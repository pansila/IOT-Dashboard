import path from 'path'
import fs from 'fs'
import * as constant from './Constant'
import scripts from './Scripts'
import {print, scriptInit} from './test-helper'
import log from 'electron-log'
// import requirejs from 'requirejs'

log.transports.file.level = 'debug'

require('babel-register')({
  'presets': [
    ['env', {
      'targets': { 'node': 8 }
    }],
    'stage-0'
  ]
})

const logStream = fs.createWriteStream('d:/test.log', {flags: 'a'})
process.stdout.write = process.stderr.write = logStream.write.bind(logStream)

// requirejs.config({
//   // Use node's special variable __dirname to
//   // get the directory containing this file.
//   // Useful if building a library that will
//   // be used in node but does not require the
//   // use of node outside
//   baseUrl: 'junk', // anything to overshadow the file
//   // Pass the top-level main.js/index.js require
//   // function to requirejs so that node modules
//   // are loaded relative to the top-level JS file.
//   nodeRequire: require
// })

process.on('message', function (m) {
  const {event, data} = m
  if (event === constant.EVENT_RUN_SCRIPT) {
    print('\n=> start the script "' + data + '"')
    scriptInit(data)

    const scriptPath = path.join(process.cwd(), 'scripts')
    const tempScript = path.join(scriptPath, data)
    const helperPathSrc = path.join(__dirname, '../../dist/electron/testhelper.js')
    const helperPathDst = path.join(process.cwd(), 'test-helper.js')
    log.debug(tempScript, helperPathSrc, helperPathDst)

    fs.createReadStream(helperPathSrc).pipe(fs.createWriteStream(helperPathDst)).on('close', () => {
      try {
        fs.unlinkSync(tempScript)
      } catch (err) {
        // print(JSON.stringify(err))
      }

      const { build: { productName: appName } } = require('../../package.json')
      const testScript = scripts.getScriptFilePath(data, appName)

      // try {
      //   // requirejs(test)
      //   // script ends in .js will ignore baseURL
      //   requirejs(data.slice(0, -3))
      // } catch (err) {
      //   log.error(err)
      // }

      fs.createReadStream(testScript).pipe(fs.createWriteStream(tempScript)).on('close', () => {
        try {
          // script ends in .js will ignore baseURL
          // requirejs('./scripts/' + data.slice(0, -3))
          const scriptEval = tempScript.replace(/\\/g, '\\$&')
          log.debug(scriptEval)
          eval(`require('${scriptEval}')`)
          // requirejs(tempScript.slice(0, -3))
        } catch (err) {
          log.error(err)
        }
      }).on('error', log.error)
    }).on('error', log.error)
  }
})
