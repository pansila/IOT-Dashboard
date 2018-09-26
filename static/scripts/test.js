import {print2log, print2term, exit, sleep} from '../test-helper'

async function start () {
  print2log('start to scan networks')
  print2term('wifi_scan')

  await sleep(10000)

  print2log('scan done')
  exit()
}

start()
