<template>
  <div class="console">
    <resize-sensor @resize="onResize"></resize-sensor>
  </div>
</template>

<script>
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
// import * as attach from 'xterm/lib/addons/attach/attach'
import 'xterm/dist/xterm.css'
import resizesensor from './ResizeSensor'
import SerialPort from 'serialport'
import Highlighter from '@utils/Highlighter'
import {TimestampPrefix} from '@utils/Common.js'
import {PassThrough} from 'stream'

Terminal.applyAddon(fit)
// Terminal.applyAddon(attach)

export default {
  name: 'Console',
  props: {
    terminal: {
      type: Object,
      default: {}
    }
  },
  data () {
    return {
      term: null,
      // terminalSocket: null
      terminalSerialPort: null,
      serialport: null,
      highlightOptions: {
        highlightOptions: [
          {
            colorText: 'red.bold',
            patternArray: ['error', 'fail', 'failed'],
            modifiers: {}
          },
          {
            colorText: 'yellow.bold',
            patternArray: ['warn', 'warning'],
            modifiers: {}
          },
          {
            colorText: 'blue.bold',
            patternArray: ['succeed', 'succeeded', 'successfully'],
            modifiers: {}
          },
          {
            colorText: 'green.bold',
            patternArray: ['\\bstart', '\\bstop', '\\bcreate', '\\bcreated', '\\bcomplete', '\\bcompleted', '\\bfinish', '\\bfinished', '\\bend'],
            modifiers: {}
          },
          {
            colorText: 'bgBlue',
            patternArray: ['\\d+(\\.\\d+){3}', '[0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){3,5}', '0x[0-9a-fA-F]+'],
            modifiers: {}
          }
        ],
        caseSensitive: false,
        defaultStyle: 'white'
      }
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
      console.log('pid : ' + this.terminal.pid + ' is on ready')
      let terminalContainer = document.getElementById('terminal' + this.terminal.pid)
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
      this.term.on('key', (data, ev) => {
        // if (ev.keyCode === 8) {
        //   this.term.write()
        // }
        this.term.write(data)
        this.serialport.write(data)
      })
      console.log(this.terminal.comm + ' mounted is going on')
    },
    setupSerialport () {
      return new Promise((resolve, reject) => {
        SerialPort.list()
          .then(ports => {
            ports.forEach(port => {
              if (this.terminal.comm === port.comName) {
                console.log(this.terminal)
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
    onResize (size) {
      if (this.term) {
        console.log('resize to fit:', size)
        this.term.fit()
        return
      }

      this.setupSerialport()
        .then(port => {
          this.serialport = port
          this.setupTerminal()

          const parser = new SerialPort.parsers.Readline()
          const highlighter = Highlighter(this.highlightOptions)
          const timestampPrefix = this.terminal.timestampPrefix ? TimestampPrefix() : new PassThrough()

          port.on('close', e => { this.serialport = null; console.log('Close', e) })
          port.on('error', console.log)
          port.pipe(parser).pipe(highlighter).pipe(timestampPrefix).on('data', data => {
            this.term.writeln(data)
          })
        })
        .catch(alert)
    }
  },
  mounted () {
    // this.setupTerminal()
  },
  beforeDestroy () {
    // this.term.detach(this.terminalSocket)
    // this.terminalSocket.close()
    // this.terminalSerialPort.close()
    if (this.serialport) this.serialport.close()
    if (this.term) this.term.destroy()
  },
  components: {
    'resize-sensor': resizesensor
  }
}
</script>

<style>
</style>