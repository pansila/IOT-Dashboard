let constant
try {
  constant = require('../../../../app.asar/src/utils/Constant')
} catch (err) {
  constant = require('../src/utils/Constant')
}

let script

function exit () {
  print2log('<= script "' + script.slice(0, -3) + '" exits')
  process.disconnect()
  process.exit()
}

function print2log (data) {
  process.send({event: constant.EVENT_PRINT_LOG, data: data})
}

function print2term (data) {
  process.send({event: constant.EVENT_PRINT_TERMINAL, data: data})
}

function sleep (ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve()
    }, ms)
  })
}

function listen (keyword, timeout = -1) {
  return new Promise(function (resolve, reject) {
    process.send({event: constant.EVENT_LISTEN_KEYWORD, data: keyword})
    process.on('message', function (m) {
      let {event, data} = m
      if (event === constant.EVENT_LISTEN_KEYWORD_RESULT) {
        resolve(data)
      }
    })
    if (timeout >= 0) setTimeout(() => reject(new Error('timeout')), timeout)
  })
}

function scriptInit (data) {
  script = data
}

export {exit, print2term, print2log, scriptInit, sleep, listen}
