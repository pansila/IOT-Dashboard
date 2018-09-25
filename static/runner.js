const fs = require('fs')
const path = require('path')

let script

function exit () {
  printfLog('<= exit ' + script)
  process.disconnect()
  process.exit()
}

function printfLog (data) {
  process.send({type: 'log', data: data})
}

function printfTerm (data) {
  process.send({type: 'terminal', data: data})
}

process.on('message', function (m) {
  script = m
  printfLog('\n=> start ' + m)
  // console.log(m)
  const content = fs.readFileSync(path.join('static/scripts', m))
  eval(content.toString())
})
