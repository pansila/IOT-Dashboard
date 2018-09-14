require('electron').app.on('ready', () => {
  process.on('message', (m) => {
    console.log('CHILD got message:', m)
  })

  console.log(process.send)
  console.log(process.version.node)
  // process.send('hello world')
})
