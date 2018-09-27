'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import {fork} from 'child_process'

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
function runScript (caller, script) {
  const child = fork(path.join(__static, 'test-runner.js'), {stdio: [0, 1, 2, 'ipc']})
  child.on('message', function (m) {
    caller.send('asynchronous-reply', m)
  })
  child.on('disconnect', function (m) {
    caller.send('asynchronous-reply', {type: 'listen-cleanup', data: null})
    stopScript(caller, script, false)
  })
  child.send({type: 'script', value: script})

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
  let found
  children.forEach((c, i) => {
    if (c.name === scriptName) {
      found = i
    }
  })
  if (found !== undefined) {
    children[found].child.send({type: 'listen-keyword-result', value: data})
  }
}

ipcMain.on('asynchronous-message', (event, arg) => {
  if (arg.script) {
    let {command, value} = arg.script
    switch (command) {
      case 'run':
        let child = runScript(event.sender, value)
        children.push({name: value, child: child})
        break
      case 'stop':
        if (stopScript(event.sender, value, true) < 0) {
          console.error('The script is not running')
        } else {
          event.sender.send('asynchronous-reply', {type: 'log', data: '<= stop the script "' + value.slice(0, -3) + '"'})
          event.sender.send('asynchronous-reply', {type: 'listen-cleanup', data: null})
        }
        break
      case 'listen-keyword-result':
        send2Script(event.sender, 'test.js', arg.script.data)
        break
      default:
        console.log('unknown script command')
    }
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
