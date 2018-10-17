import Settings from 'electron-settings/lib/settings'
import findLogPath from 'electron-log/lib/transports/file/find-log-path'
import path from 'path'

const defaultSettingsFileName = 'Settings'

/*
 * Get around the wrong setting path in the development mode
 */
class MySettings extends Settings {
  _getSettingsFilePath () {
    if (this._customSettingsFilePath) return this._customSettingsFilePath
    const filePath = path.join(path.dirname(findLogPath()), defaultSettingsFileName)
    return filePath
  }
}

export default new MySettings()
