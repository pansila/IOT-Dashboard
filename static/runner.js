const fs = require('fs')
const path = require('path')

let script

function exit () {
  printfLog('<= exit "' + script.slice(0, -3) + '"')
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
  printfLog('\n=> start "' + m.slice(0, -3) + '"')
  // console.log(m)
  const content = fs.readFileSync(path.join('static/scripts', m))
  eval(content.toString())
})
