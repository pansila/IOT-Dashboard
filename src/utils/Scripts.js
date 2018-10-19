/**
 * A module that handles read and writing to the disk.
 * Model after electron-settings
 */

import assert from 'assert'
import { EventEmitter } from 'events'
import fs from 'fs'
import jsonfile from 'jsonfile'
import path from 'path'
import findLogPath from 'electron-log/lib/transports/file/find-log-path'

import Observer from 'electron-settings/lib/settings-observer'

/**
 * The name of the scripts file.
 *
 * @type {string}
 */
const defaultScriptsFileName = 'scripts'

/**
 *
 * @extends EventEmitter
 * @class
 */
class Scripts extends EventEmitter {
  constructor () {
    super()

    /**
     * The absolute path to the custom scripts file on the disk.
     *
     * @type {string}
     * @default null
     * @private
     */
    this._customScriptsFilePath = null

    /**
     * The FSWatcher instance. This will watch if the scripts file and
     * notify key path observers.
     *
     * @type {FSWatcher}
     * @default null
     * @private
     */
    this._fsWatcher = null

    /**
     * Called when the scripts file is changed or renamed.
     *
     * @type {Object}
     * @private
     */
    this._handleScriptsFileChange = this._onScriptsFileChange.bind(this)
  }

  /**
   * Returns the scripts file path.
   *
   * @returns {string}
   * @private
   */
  _getScriptsFilePath () {
    if (this._customScriptsFilePath) return this._customScriptsFilePath
    const filePath = path.join(path.dirname(findLogPath()), defaultScriptsFileName)
    return filePath
  }

  /**
   * Returns the scripts file path.
   *
   * @returns {string}
   * @private
   */
  getScriptFilePath (file) {
    return path.join(this._getScriptsFilePath(), file)
  }

  /**
   * Sets a custom scripts file path.
   *
   * @param {string} filePath
   * @private
   */
  _setScriptsFilePath (filePath) {
    this._customScriptsFilePath = filePath

    // Reset FSWatcher.
    this._unwatchScripts(true)
  }

  /**
   * Clears the custom scripts file path.
   *
   * @private
   */
  _clearScriptsFilePath () {
    this._setScriptsFilePath(null)
  }

  /**
   * Watches the scripts file for changes using the native `FSWatcher`
   * class in case the scripts file is changed outside of
   * ElectronScripts' jursidiction.
   *
   * @private
   */
  _watchScripts () {
    if (!this._fsWatcher) {
      try {
        this._fsWatcher = fs.watch(this._getScriptsFilePath(), this._handleScriptsFileChange)
      } catch (err) {
        // File may not exist yet or the user may not have permission to
        // access the file or directory. Fail gracefully.
      }
    }
  }

  /**
   * Unwatches the scripts file by closing the FSWatcher and nullifying its
   * references. If the `reset` parameter is true, attempt to watch the
   * scripts file again.
   *
   * @param {boolean} [reset=false]
   * @private
   */
  _unwatchScripts (reset = false) {
    if (this._fsWatcher) {
      this._fsWatcher.close()
      this._fsWatcher = null

      if (reset) {
        this._watchScripts()
      }
    }
  }

  /**
   * Ensures that the scripts file exists, then initializes the FSWatcher.
   *
   * @private
   */
  _ensureScripts () {
    const scriptsFilePath = this._getScriptsFilePath()

    try {
      const stat = fs.statSync(scriptsFilePath)
      if (!stat.isDirectory()) {
        fs.unlinkSync(scriptsFilePath)
        fs.mkdirSync(scriptsFilePath)
      }
    } catch (err) {
      fs.mkdirSync(scriptsFilePath)
    }

    this._watchScripts()
  }

  /**
   * Writes the scripts to the disk.
   *
   * @param {Object} [obj={}]
   * @param {Object} [opts={}]
   * @private
   */
  _writeScripts (obj = {}, opts = {}) {
    this._ensureScripts()

    try {
      const spaces = opts.prettify ? 2 : 0

      jsonfile.writeFileSync(this._getScriptsFilePath(), obj, { spaces })
    } catch (err) {
      // Could not write the file. The user may not have permission to
      // access the file or directory. Throw error.
      throw err
    }
  }

  /**
   * Returns the scripts file under the specified directory
   *
   * @returns {Object}
   * @private
   */
  getScripts () {
    this._ensureScripts()

    try {
      let files = fs.readdirSync(this._getScriptsFilePath())
      this.scripts = files.filter(v => {
        return v.endsWith('.js')
      })
      return this.scripts
    } catch (err) {
      // Could not read the file. The user may not have permission to
      // access the file or directory. Throw error.
      throw err
    }
  }

  /**
   * Called when the scripts file has been changed or
   * renamed (moved/deleted).
   *
   * @type {string} eventType
   * @private
   */
  _onScriptsFileChange (eventType) {
    switch (eventType) {
      case Scripts.FSWatcherEvents.CHANGE: {
        this._emitChangeEvent()
        break
      }
      case Scripts.FSWatcherEvents.RENAME: {
        this._unwatchScripts(true)
        break
      }
    }
  }

  /**
   * Broadcasts the internal "change" event.
   *
   * @emits ElectronScripts:change
   * @private
   */
  _emitChangeEvent () {
    this.emit(Scripts.Events.CHANGE)
  }

  /**
   * Watches the given key path for changes and calls the given handler
   * if the value changes. To unsubscribe from changes, call `dispose()`
   * on the Observer instance that is returned.
   *
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Observer}
   * @private
   */
  _watchValueAtKeyPath (keyPath, handler) {
    const currentValue = this._getValueAtKeyPath(keyPath)

    return new Observer(this, keyPath, handler, currentValue)
  }

  /**
   * Watches the given key path for changes and calls the given handler
   * if the value changes. To unsubscribe from changes, call `dispose()`
   * on the Observer instance that is returned.
   *
   * @param {string} keyPath
   * @param {Function} handler
   * @returns {Observer}
   * @public
   */
  watch (keyPath, handler) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string')
    assert.strictEqual(typeof handler, 'function', 'Second parameter must be a function')

    return this._watchValueAtKeyPath(keyPath, handler)
  }

  /**
   * Sets a custom scripts file path.
   *
   * @param {string} filePath
   * @returns {Scripts}
   * @public
   */
  setPath (filePath) {
    assert.strictEqual(typeof filePath, 'string', 'First parameter must be a string')

    this._setScriptsFilePath(filePath)

    return this
  }

  /**
   * Clears the custom scripts file path.
   *
   * @returns {Scripts}
   * @public
   */
  clearPath () {
    this._clearScriptsFilePath()

    return this
  }

  /**
   * Returns the absolute path to where the scripts file is or will be stored.
   *
   * @returns {string}
   * @public
   */
  file () {
    return this._getScriptsFilePath()
  }
}

/**
 *
 * @enum {string}
 * @readonly
 */
Scripts.FSWatcherEvents = {
  CHANGE: 'change',
  RENAME: 'rename'
}

/**
 *
 * @enum {string}
 * @readonly
 */
Scripts.Events = {
  CHANGE: 'change'
}

export default new Scripts()
