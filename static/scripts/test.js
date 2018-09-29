import {print, exit, sleep, listen, command2term, command2local} from '../test-helper'

// it's recommended to define a function and then execute it at the end
async function start () {
  // print a message to the script terminal in the UI
  print('start to scan networks')

  // write a message/command to the console terminal in the UI
  command2term('wifi_scan')
  // listen to the keyword of interest, continue if found, throw an error if timeout
  try {
    let data = await listen('complete', 5000)
    print('found message: ' + data)
  } catch (err) {
    print(err.toString())
  }

  // sleep 3 seconds
  await sleep(1000)
  print('scan done')

  // synchronized call to local shell, return stdout if succeeded, throw an error if failed
  try {
    let data = await command2local('ping 127.0.0.1')
    print('command result: ' + data)
  } catch (err) {
    print(err.toString())
  }

  // should be always called at the end of the function, otherwise the process won't exit
  exit()
}

start()
