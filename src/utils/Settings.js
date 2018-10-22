const Settings = require('electron-settings/lib/settings')
const findLogPath = require('electron-log/lib/transports/file/find-log-path')
const path = require('path')

const defaultSettingsFileName = 'Settings'

/*
 * Get around the wrong setting path in the development mode
 */
class MySettings extends Settings {
  _getSettingsFilePath () {
    if (this._customSettingsFilePath) return this._customSettingsFilePath
    return path.join(path.dirname(findLogPath()), defaultSettingsFileName)
  }
}

module.exports = new MySettings()
