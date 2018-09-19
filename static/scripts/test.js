console.log('hello world')
setTimeout(() => console.log('hello kitty'), 1000)

process.on('message', console.log)
process.send('sdfsdf')
