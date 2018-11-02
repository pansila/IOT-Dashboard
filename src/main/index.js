'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import {fork} from 'child_process'
import * as constant from '@utils/Constant'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import settings from '@utils/Settings'

log.transports.file.level = 'debug'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\')
}

log.info(
  'app: ' + app.getVersion().toString(),
  'node: ' + process.versions.node,
  'electron: ' + process.versions.electron,
  'platform: ' + require('os').platform(),
  'arch: ' + require('os').arch(),
  'vue: ' + require('vue/package.json').version)

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
  let runnerPath
  if (process.env.NODE_ENV === 'production') {
    runnerPath = path.join(__dirname, 'testrunner.js')
  } else {
    runnerPath = path.join(__static, '../src/utils/test-runner.js')
  }

  const child = fork(runnerPath, {stdio: [0, 1, 2, 'ipc']})
  child.on('message', function (m) {
    caller.send(constant.EVENT_ASYNC_REPLY, m)
  })
  child.on('disconnect', function (m) {
    caller.send(constant.EVENT_ASYNC_REPLY, {event: constant.EVENT_LISTEN_CLEANUP, data: null})
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
    log.error('can\'t find the script to send')
  }
}

ipcMain.on(constant.EVENT_ASYNC_MSG, (ev, arg) => {
  let {event, data} = arg
  switch (event) {
    case constant.EVENT_RUN_SCRIPT:
      let child = runScript(ev.sender, data)
      children.push({name: data, child: child})
      break
    case constant.EVENT_STOP_SCRIPT:
      if (stopScript(ev.sender, data, true) < 0) {
        ev.sender.send(constant.EVENT_ASYNC_REPLY, {event: constant.EVENT_PRINT_LOG, data: '!= the script is not running'})
      } else {
        ev.sender.send(constant.EVENT_ASYNC_REPLY, {event: constant.EVENT_PRINT_LOG, data: '<= stop the script "' + data.slice(0, -3) + '"'})
        ev.sender.send(constant.EVENT_ASYNC_REPLY, {event: constant.EVENT_LISTEN_CLEANUP, data: null})
      }
      break
    case constant.EVENT_LISTEN_KEYWORD_RESULT:
      send2Script(ev.sender, 'test.js', data)
      break
    default:
      log.error(`unknown event ${event} from renderer process`)
  }
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') {
    let updateCheckTimer

    if (settings.has('updateServer')) {
      autoUpdater.setFeedURL(settings.get('updateServer'))
    }

    autoUpdater.logger = log
    autoUpdater.checkForUpdates()
    ipcMain.on(constant.EVENT_UPDATE, (e, action) => {
      switch (action) {
        case constant.MSG_UPDATE_NOW:
          autoUpdater.quitAndInstall()
          break
        case constant.MSG_UPDATE_ON_QUIT:
          if (updateCheckTimer) {
            clearInterval(updateCheckTimer)
            updateCheckTimer = undefined
          }
          autoUpdater.autoInstallOnAppQuit = true
          break
        case constant.MSG_NO_UPDATE:
          if (updateCheckTimer) {
            clearInterval(updateCheckTimer)
            updateCheckTimer = undefined
          }
          /* TODO: non-documented variable, may change in future */
          autoUpdater.quitAndInstallCalled = true
          break
      }
    })
    autoUpdater.on('update-downloaded', event => {
      log.debug(event)
      mainWindow.webContents.send(constant.EVENT_UPDATE, event)
    })

    ipcMain.on(constant.EVENT_CHECK_FOR_UPDATE, () => {
      autoUpdater.checkForUpdates()
    })

    let timeout = 3600000
    if (settings.has('updateInterval')) {
      timeout = parseInt(settings.get('updateInterval'))
    }

    updateCheckTimer = setInterval(() => {
      autoUpdater.checkForUpdatesAndNotify()
    }, timeout)
  }
})
