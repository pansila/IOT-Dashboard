'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import {spawn} from 'child_process'

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
    // title: 'Vmail',
    // disableAutoHideCursor: true,
    frame: false // 没有边框
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

function runScript (caller, script) {
  let scriptPath = path.join(__static, 'scripts')
  const child = spawn(process.execPath, [path.join(scriptPath, script)], {stdio: [0, 1, 2, 'ipc']}, (error, stdout, stderr) => {
    if (error) {
      throw error
    }
    // console.log(stdout)
    // console.log(stderr)
  })
  child.on('message', function (m) {
    console.log('Yes it works!')
    caller.send('asynchronous-reply', m)
  })
  child.send({hello: 'world'})
}

ipcMain.on('asynchronous-message', (event, arg) => {
  // console.log(arg)
  if (arg.script) {
    let {command, value} = arg.script
    switch (command) {
      case 'run':
        runScript(event.sender, value)
        break
      default:
        console.log('unknown script command')
    }
  }
  // event.sender.send('asynchronous-reply', arg)
})

ipcMain.on('synchronous-message', (event, arg) => {
  // console.log(arg)
  event.returnValue = arg
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
