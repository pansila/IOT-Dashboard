const fs = require('fs')
const path = require('path')

let script

function exit () {
  printfLog('<= script "' + script.slice(0, -3) + '" exits')
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
  let content
  let {type, value} = m
  if (type === 'script') {
    printfLog('\n=> start the script "' + value.slice(0, -3) + '"')
    // console.log(value)
    content = fs.readFileSync(path.join(__dirname, 'scripts', value))
    script = value
    eval(content.toString())
  }
})
