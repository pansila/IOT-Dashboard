<template>
  <div class="">
    <resize-sensor @resize="onResize"></resize-sensor>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
// import * as attach from 'xterm/lib/addons/attach/attach'
import 'xterm/dist/xterm.css'
import resizesensor from '@components/ResizeSensor'
import SerialPort from 'serialport'
import Highlighter from '@utils/Highlighter'
import {LineParser, LineBuffer, TimestampPrefix, KeywordFilter} from '@utils/Common.js'
import {PassThrough} from 'stream'
import fs from 'fs'
import path from 'path'
import * as constant from '@utils/Constant'

Terminal.applyAddon(fit)
// Terminal.applyAddon(attach)

export default {
  name: 'Console',
  props: [
    'containerID',
    'pid',
    'eventHub'
  ],
  computed: {
    ...mapState({
      terminals: state => state.terminal.terminals
    }),
    terminal () {
      return this.terminals[this.pid]
    },
    history () {
      return this.terminal.history
    },
    historyIdx () {
      return this.terminal.historyIdx
    },
    commandIndex () {
      return this.terminal.historyRecallIdx
    }
  },
  watch: {
    commandIndex (newVal, oldVal) {
      if (newVal !== null) {
        this.term.write('\b'.repeat(this.input.length) +
                        ' '.repeat(this.input.length) +
                        '\b'.repeat(this.input.length))
        this.input = this.history[newVal]
        this.term.write(this.input)
      } else if (this.input !== '') {
        this.term.write('\b'.repeat(this.input.length))
        this.serialport.write(this.input + '\r')
        this.input = ''
      }
    }
  },
  data () {
    return {
      term: null,
      // terminalSocket: null
      serialport: null,
      input: '',
      lookupHistory: false,
      // promptOffset: 0,
      highlightConfig: null,
      /* pipes */
      lineParser: null,
      lineBuffer: null,
      highlighter: null,
      timestampPrefix: null,
      keywordFilter: null
    }
  },
  methods: {
    runRealTerminal () {
      console.log('webSocket is finished')
    },
    errorRealTerminal () {
      console.log('error')
    },
    closeRealTerminal () {
      console.log('close')
    },
    setupTerminal () {
      let terminalContainer = document.getElementById(this.containerID)
      this.term = new Terminal({
        rendererType: 'dom'
      })
      this.term.open(terminalContainer)
      // open websocket
      // this.terminalSocket = new WebSocket('ws://127.0.0.1:3000/terminals/')
      // this.terminalSocket.onopen = this.runRealTerminal
      // this.terminalSocket.onclose = this.closeRealTerminal
      // this.terminalSocket.onerror = this.errorRealTerminal
      // this.term.attach(this.terminalSocket)
      this.term.fit()
      this.term._initialized = true
      this.term.attachCustomKeyEventHandler(function (e) {
        if (e.ctrlKey && (e.keyCode === 67)) {
          document.execCommand('copy')
          return false
        }
      })
      this.term.on('key', (data, ev) => {
        const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey

        if (ev.code === 'ArrowUp' || ev.code === 'ArrowDown') {
          if (!this.terminal.localHistoryEnabled) {
            this.serialport.write(data)
            return
          }

          if (!this.lookupHistory && this.historyIdx === this.history.length - 1 && this.input) {
            this.$store.commit('ADD_HISTORY', {pid: this.pid, input: this.input})
          }
          if (ev.code === 'ArrowDown') {
            if (this.historyIdx !== this.history.length - 1) {
              this.$store.commit('INCREMENT_HISTORY_IDX', this.pid)
            } else if (this.input !== '') {
              this.term.write('\b'.repeat(this.input.length) +
                              ' '.repeat(this.input.length) +
                              '\b'.repeat(this.input.length))
              this.input = ''
              return
            } else {
              return
            }
          }
          this.lookupHistory = true
          this.term.write('\b'.repeat(this.input.length) +
                          ' '.repeat(this.input.length) +
                          '\b'.repeat(this.input.length))
          this.input = this.history[this.historyIdx]
          this.term.write(this.input)
          if (ev.code === 'ArrowUp' && this.historyIdx > 0) {
            this.$store.commit('DECREMENT_HISTORY_IDX', this.pid)
          }
          return
        }

        if (ev.code === 'ArrowLeft' || ev.code === 'ArrowRight') {
          return
        }

        if (ev.keyCode === 13) {
          if (this.terminal.localHistoryEnabled) {
            if (this.input) {
              this.$store.commit('ADD_HISTORY', {pid: this.pid, input: this.input})
            }
            this.lookupHistory = false
          }

          if (this.terminal.localEchoEnabled) {
            this.term.write('\b'.repeat(this.input.length))
            this.serialport.write(this.input + '\r')
          } else {
            this.serialport.write('\r')
            // this.term.write('\r')
          }
          this.input = ''
          this.lineBuffer.expectPrompt()
        } else if (ev.keyCode === 8) {
          if (this.input.length > 0) {
            this.term.write('\b \b')
            this.input = this.input.slice(0, -1)
          }
        } else if (printable) {
          this.input += data
          if (this.terminal.localEchoEnabled) {
            this.term.write(data)
          } else {
            this.serialport.write(data)
          }
        }
      })
    },
    setupSerialport () {
      return new Promise((resolve, reject) => {
        SerialPort.list()
          .then(ports => {
            ports.forEach(port => {
              if (this.terminal.comm === port.comName) {
                const port = new SerialPort(this.terminal.comm, {
                  autoOpen: false, // to catch opening error
                  baudRate: this.terminal.baudRate,
                  dataBits: this.terminal.dataBits,
                  stopBits: this.terminal.stopBits,
                  parity: this.terminal.parity
                })
                port.open(err => {
                  if (err === null) {
                    resolve(port)
                  } else {
                    reject(err)
                  }
                })
              }
            })
          })
          .catch(reject)
      })
    },
    setup (port) {
      this.serialport = port
      this.setupTerminal()

      this.lineParser = new LineParser(this.terminal.implicitCarriageEnabled, this.terminal.implicitLineFeedEnabled)
      this.lineBuffer = new LineBuffer()
      this.highlighter = this.terminal.highlightEnabled ? Highlighter(this.highlightConfig) : new PassThrough()
      this.timestampPrefix = this.terminal.timestampEnabled ? new TimestampPrefix() : new PassThrough()
      this.keywordFilter = new KeywordFilter()

      port.on('close', e => { this.serialport = null; console.log('Close', e) })
      port.on('error', alert)
      port
        .pipe(this.lineParser)
        .pipe(this.timestampPrefix)
        .pipe(this.lineBuffer)
        .pipe(this.keywordFilter)
        .pipe(this.highlighter)
        .on('data', data => {
          // console.log(Array.from(data).map(ch => ch.charCodeAt()))
          this.term.write(data)
        })

      this.eventHub.$on(constant.EVENT_TERMINAL_OUTPUT, e => {
        // this.term.writeln(e)
        this.serialport.write(e + '\r')
      })
      this.eventHub.$on(constant.EVENT_LISTEN_KEYWORD, e => {
        this.keywordFilter.keywordInstall(e)
        this.keywordFilter.listen().then(x => {
          this.eventHub.$emit(constant.EVENT_LISTEN_KEYWORD_RESULT, x)
        }).catch(x => {
          this.eventHub.$emit(constant.EVENT_LISTEN_KEYWORD_RESULT, null)
        })
      })
      this.eventHub.$on(constant.EVENT_LISTEN_CLEANUP, e => {
        this.keywordFilter.keywordUninstall()
      })
    },
    onResize (size) {
      if (this.term) {
        this.term.fit()
        return
      }

      this.setupSerialport()
        .then(this.setup)
        .catch(console.log)
    }
  },
  mounted () {
    let content = fs.readFileSync(path.join(__static, 'config', 'highlight.json'))
    this.highlightConfig = JSON.parse(content)
  },
  beforeDestroy () {
    // this.term.detach(this.terminalSocket)
    // this.terminalSocket.close()
    if (this.serialport) this.serialport.close()
    if (this.term) this.term.destroy()
  },
  components: {
    'resize-sensor': resizesensor
  }
}
</script>

<style>
/* let xterm-screen not to shade the scroll-bar of xterm-viewport */
/* .xterm .xterm-screen {
    margin-right: 20px;
} */
</style>