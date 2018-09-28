'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import {fork} from 'child_process'
import * as constant from '@utils/Constant.js'
import { autoUpdater } from 'electron-updater'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    // autoHideMenuBar: true,
    // disableAutoHideCursor: true,
    frame: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.maximize()

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

let children = []
function runScript (caller, scriptName) {
  const child = fork(path.join(__static, 'test-runner.js'), {stdio: [0, 1, 2, 'ipc']})
  child.on('message', function (m) {
    caller.send('asynchronous-reply', m)
  })
  child.on('disconnect', function (m) {
    caller.send('asynchronous-reply', {event: constant.EVENT_LISTEN_CLEANUP, data: null})
    stopScript(caller, scriptName, false)
  })
  child.send({event: constant.EVENT_RUN_SCRIPT, data: scriptName})

  return child
}

function stopScript (caller, scriptName, kill) {
  let found = -1
  children.forEach((c, i) => {
    if (c.name === scriptName) {
      found = i
    }
  })
  if (found !== -1) {
    if (kill) process.kill(children[found].child.pid, 'SIGINT')
    children.splice(found, 1)
  }
  return found
}

function send2Script (caller, scriptName, data) {
  let found = -1
  children.forEach((c, i) => {
    if (c.name === scriptName) {
      found = i
    }
  })
  if (found !== -1) {
    children[found].child.send({event: constant.EVENT_LISTEN_KEYWORD_RESULT, data: data})
  } else {
    console.error('can\'t find the script to send')
  }
}

ipcMain.on('asynchronous-message', (ev, arg) => {
  let {event, data} = arg
  switch (event) {
    case constant.EVENT_RUN_SCRIPT:
      let child = runScript(ev.sender, data)
      children.push({name: data, child: child})
      break
    case constant.EVENT_STOP_SCRIPT:
      if (stopScript(ev.sender, data, true) < 0) {
        ev.sender.send('asynchronous-reply', {event: constant.EVENT_PRINT_LOG, data: '!= the script is not running'})
      } else {
        ev.sender.send('asynchronous-reply', {event: constant.EVENT_PRINT_LOG, data: '<= stop the script "' + data.slice(0, -3) + '"'})
        ev.sender.send('asynchronous-reply', {event: constant.EVENT_LISTEN_CLEANUP, data: null})
      }
      break
    case constant.EVENT_LISTEN_KEYWORD_RESULT:
      send2Script(ev.sender, 'test.js', data)
      break
    default:
      console.error(`unknown event ${event} from renderer process`)
  }
})

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
