import {exec} from 'child_process'
import constant from './Constant'

let script

function exit () {
  print('<= script "' + script.slice(0, -3) + '" exits')
  process.disconnect()
  process.exit()
}

function print (data) {
  process.send({event: constant.EVENT_PRINT_LOG, data: data})
}

function command2term (command) {
  process.send({event: constant.EVENT_PRINT_TERMINAL, data: command})
}

function command2local (command, codePage = '65001') {
  return new Promise((resolve, reject) => {
    command = `@chcp ${codePage} > nul && ` + command
    // const env = Object.assign({chcp: '65001'}, process.env)
    exec(command,
      // {env: env},
      (err, stdout, stderr) => {
        if (err) reject(err)
        resolve(stdout)
      }
    )
  })
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

export {exit, command2term, command2local, print, scriptInit, sleep, listen}
