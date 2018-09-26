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

function scriptInit (data) {
  script = data
}

export {exit, print2term, print2log, scriptInit, sleep}
