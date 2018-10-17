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

import Helpers from 'electron-settings/lib/settings-helpers'
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
    this._customScriptsFilePath = path

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
   * Returns the parsed contents of the scripts file.
   *
   * @returns {Object}
   * @private
   */
  _readScripts () {
    this._ensureScripts()

    try {
      let files = fs.readdirSync(this._getScriptsFilePath())
      this.scripts = files.filter(v => {
        if (!v.endsWith('.js')) {
          return false
        }
        return true
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
   * Returns a boolean indicating whether the scripts object contains
   * the given key path.
   *
   * @param {string} keyPath
   * @returns {boolean}
   * @private
   */
  _checkKeyPathExists (keyPath) {
    const obj = this._readScripts()
    const exists = Helpers.hasKeyPath(obj, keyPath)

    return exists
  }

  /**
   * Sets the value at the given key path, or the entire scripts object if
   * an empty key path is given.
   *
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} opts
   * @private
   */
  _setValueAtKeyPath (keyPath, value, opts) {
    let obj = value

    if (keyPath !== '') {
      obj = this._readScripts()

      Helpers.setValueAtKeyPath(obj, keyPath, value)
    }

    this._writeScripts(obj, opts)
  }

  /**
   * Returns the value at the given key path, or sets the value at that key
   * path to the default value, if provided, if the key does not exist. If an
   * empty key path is given, the entire scripts object will be returned.
   *
   * @param {string} keyPath
   * @param {any} defaultValue
   * @param {Object} opts
   * @returns {any}
   * @private
   */
  _getValueAtKeyPath (keyPath, defaultValue, opts) {
    const obj = this._readScripts()

    if (keyPath !== '') {
      const exists = Helpers.hasKeyPath(obj, keyPath)
      const value = Helpers.getValueAtKeyPath(obj, keyPath)

      // The key does not exist but a default value does. Set the value at the
      // key path to the default value and then get the new value.
      if (!exists && typeof defaultValue !== 'undefined') {
        this._setValueAtKeyPath(keyPath, defaultValue, opts)

        // Get the new value now that the default has been set.
        return this._getValueAtKeyPath(keyPath)
      }

      return value
    }

    return obj
  }

  /**
   * Deletes the key and value at the given key path, or clears the entire
   * scripts object if an empty key path is given.
   *
   * @param {string} keyPath
   * @param {Object} opts
   * @private
   */
  _deleteValueAtKeyPath (keyPath, opts) {
    if (keyPath === '') {
      this._writeScripts({}, opts)
    } else {
      const obj = this._readScripts()
      const exists = Helpers.hasKeyPath(obj, keyPath)

      if (exists) {
        Helpers.deleteValueAtKeyPath(obj, keyPath)
        this._writeScripts(obj, opts)
      }
    }
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
   * Returns a boolean indicating whether the scripts object contains
   * the given key path.
   *
   * @param {string} keyPath
   * @returns {boolean}
   * @public
   */
  has (keyPath) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string')

    return this._checkKeyPathExists(keyPath)
  }

  /**
   * Sets the value at the given key path.
   *
   * @param {string} keyPath
   * @param {any} value
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Scripts}
   * @public
   */
  set (keyPath, value, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string. Did you mean to use `setAll()` instead?')
    assert.strictEqual(typeof opts, 'object', 'Second parameter must be an object')

    this._setValueAtKeyPath(keyPath, value, opts)

    return this
  }

  /**
   * Sets all scripts.
   *
   * @param {Object} obj
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Scripts}
   * @public
   */
  setAll (obj, opts = {}) {
    assert.strictEqual(typeof obj, 'object', 'First parameter must be an object')
    assert.strictEqual(typeof opts, 'object', 'Second parameter must be an object')

    this._setValueAtKeyPath('', obj, opts)

    return this
  }

  /**
   * Returns the value at the given key path, or sets the value at that key
   * path to the default value, if provided, if the key does not exist.
   *
   * @param {string} keyPath
   * @param {any} [defaultValue]
   * @param {Object} [opts={}]
   * @returns {any}
   * @public
   */
  get (keyPath, defaultValue, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string. Did you mean to use `getAll()` instead?')

    return this._getValueAtKeyPath(keyPath, defaultValue, opts)
  }

  /**
   * Returns all scripts.
   *
   * @returns {Object}
   * @public
   */
  getAll () {
    return this._getValueAtKeyPath('')
  }

  /**
   * Deletes the key and value at the given key path.
   *
   * @param {string} keyPath
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Scripts}
   * @public
   */
  delete (keyPath, opts = {}) {
    assert.strictEqual(typeof keyPath, 'string', 'First parameter must be a string. Did you mean to use `deleteAll()` instead?')
    assert.strictEqual(typeof opts, 'object', 'Second parameter must be an object')

    this._deleteValueAtKeyPath(keyPath, opts)

    return this
  }

  /**
   * Deletes all scripts.
   *
   * @param {Object} [opts={}]
   * @param {boolean} [opts.prettify=false]
   * @returns {Scripts}
   * @public
   */
  deleteAll (opts = {}) {
    assert.strictEqual(typeof opts, 'object', 'First parameter must be an object')

    this._deleteValueAtKeyPath('', opts)

    return this
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
