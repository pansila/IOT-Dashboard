import path from 'path'
import fs from 'fs'
import constant from './Constant'
import scripts from './Scripts'
import {print, scriptInit} from './test-helper'
import log from 'electron-log'
import findLogPath from 'electron-log/lib/transports/file/find-log-path'

log.transports.file.level = 'debug'

require('babel-register')({
  'presets': [
    ['env', {
      'targets': { 'node': 8 }
    }],
    'stage-0'
  ]
})

process.on('message', function (m) {
  let {event, data} = m
  if (event === constant.EVENT_RUN_SCRIPT) {
    print('\n=> start the script "' + data + '"')
    scriptInit(data)

    const tempScriptPath = path.join(process.cwd(), 'scripts')
    try {
      fs.mkdirSync(tempScriptPath)
    } catch (err) {
    }

    const tempScript = path.join(tempScriptPath, data)
    const helperPathSrc = path.join(__dirname, '../../dist/electron/testhelper.js')
    const helperPathDst = path.join(process.cwd(), 'test-helper.js')
    log.debug(tempScript, helperPathSrc, helperPathDst)

    fs.createReadStream(helperPathSrc).pipe(fs.createWriteStream(helperPathDst)).on('close', () => {
      try {
        fs.unlinkSync(tempScript)
      } catch (err) {
        // print(JSON.stringify(err))
      }

      log.debug(findLogPath())
      let testScript = scripts.getScriptFilePath(data)
      try {
        fs.accessSync(testScript, fs.constants.R_OK)
      } catch (err) {
        log.error(testScript + " doesn't exist")
        return
      }
      fs.createReadStream(testScript).pipe(fs.createWriteStream(tempScript)).on('close', () => {
        try {
          require(tempScript)
        } catch (err) {
          log.error(err)
          print(tempScript)
          print(JSON.stringify(err))
        }
      }).on('error', log.error)
    }).on('error', log.error)
  }
})
