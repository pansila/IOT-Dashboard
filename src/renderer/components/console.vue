<template>
    <div class="console" id="terminal"></div>
</template>

<script>
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import 'xterm/dist/xterm.css'

Terminal.applyAddon(fit)
Terminal.applyAddon(attach)

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
      terminalSerialPort: null
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
    }
  },
  mounted () {
    console.log('pid : ' + this.terminal.pid + ' is on ready')
    let terminalContainer = document.getElementById('terminal')
    this.term = new Terminal()
    this.term.open(terminalContainer)
    // open websocket
    // this.terminalSocket = new WebSocket('ws://127.0.0.1:3000/terminals/')
    // this.terminalSocket.onopen = this.runRealTerminal
    // this.terminalSocket.onclose = this.closeRealTerminal
    // this.terminalSocket.onerror = this.errorRealTerminal
    // this.term.attach(this.terminalSocket)
    this.term._initialized = true
    this.term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    console.log('mounted is going on')
  },
  beforeDestroy () {
    // this.terminalSocket.close()
    this.terminalSerialPort.close()
    this.term.destroy()
  }
}
</script>