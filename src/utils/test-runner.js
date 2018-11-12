/* use commonjs module syntax to work both in the development and production mode */
const path = require('path')
const fs = require('fs')
const log = require('electron-log')

// log.transports.file.level = 'debug'

/* ugly: point the path of babel presets to the right position in the production mode */
const presetEnv = path.join(__dirname, '../../node_modules/babel-preset-env')
const presetStage0 = path.join(__dirname, '../../node_modules/babel-preset-stage-0')

require('babel-register')({
  'presets': [
    [presetEnv, {
      'targets': { 'node': 8 }
    }],
    presetStage0
  ]
})

/* require them after registration of babel to work in the development mode */
const constant = require('./Constant').default
const scripts = require('./Scripts').default
const print = require('./test-helper').print
const scriptInit = require('./test-helper').scriptInit

// const logStream = fs.createWriteStream('d:/test.log', {flags: 'a'})
// process.stdout.write = process.stderr.write = logStream.write.bind(logStream)

process.on('message', function (m) {
  const {event, data} = m

  if (event === constant.EVENT_RUN_SCRIPT) {
    print('\n=> start the script "' + data + '"')

    scriptInit(data)

    const scriptPath = path.join(process.cwd(), 'scripts')
    const tempScript = path.join(scriptPath, data)
    const helperPathSrc = path.join(__dirname, '../../dist/electron/testhelper.js')
    const helperPathDst = path.join(process.cwd(), 'test-helper.js')
    // log.debug(tempScript, helperPathSrc, helperPathDst)

    fs.createReadStream(helperPathSrc).pipe(fs.createWriteStream(helperPathDst)).on('close', () => {
      try {
        fs.unlinkSync(tempScript)
      } catch (err) {
        // log.error(err)
      }

      const { build: { productName: appName } } = require('../../package.json')
      const testScript = scripts.getScriptFilePath(data, appName)

      fs.createReadStream(testScript).pipe(fs.createWriteStream(tempScript)).on('close', () => {
        try {
          const scriptEval = tempScript.replace(/\\/g, '\\$&')
          eval(`require('${scriptEval}')`)
        } catch (err) {
          log.error(err)
        }
      }).on('error', log.error)
    }).on('error', log.error)
  }
})
