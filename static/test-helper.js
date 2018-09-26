let script

function exit () {
  print2log('<= script "' + script.slice(0, -3) + '" exits')
  process.disconnect()
  process.exit()
}

function print2log (data) {
  process.send({type: 'log', data: data})
}

function print2term (data) {
  process.send({type: 'terminal', data: data})
}

function sleep (ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve()
    }, ms)
  })
}

function listen (keyword, timeout) {
  return new Promise(function (resolve, reject) {
    process.send({type: 'listen-keyword', data: keyword})
    process.on('message', function (m) {
      let {type, value} = m
      if (type === 'listen-keyword-result') {
        resolve(value)
      }
    })
    setTimeout(() => reject(new Error('timeout')), timeout)
  })
}

function scriptInit (data) {
  script = data
}

export {exit, print2term, print2log, scriptInit, sleep, listen}
