const fs = require('fs')
const path = require('path')

let runningScript

function exit () {
  printfLog('<= exit the script "' + runningScript.slice(0, -3) + '"')
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
  let {env, script} = m
  printfLog('\n=> start the script "' + script.slice(0, -3) + '"')
  // console.log(script)
  if (env === 'production') {
    content = fs.readFileSync(path.join(__dirname, 'scripts', script))
  } else {
    content = fs.readFileSync(path.join('static/scripts', script))
  }
  runningScript = script
  eval(content.toString())
})
