<template>
    <div class="console"></div>
</template>

<script>
import {Terminal} from 'xterm'
import * as fit from 'xterm/lib/addons/fit/fit'
import * as attach from 'xterm/lib/addons/attach/attach'
import 'xterm/dist/xterm.css'

Terminal.applyAddon(fit)
Terminal.applyAddon(attach)

Terminal.prototype.proposeGeometry = function () {
  if (!this.element.parentElement) {
    return null
  }

  var cellWidth = this.renderer.dimensions.actualCellWidth || 9
  var cellHeight = this.renderer.dimensions.actualCellHeight || 17
  var parentElementStyle = window.getComputedStyle(this.element.parentElement)
  var parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height'))
  var parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')))
  var elementStyle = window.getComputedStyle(this.element)
  var elementPadding = {
    top: parseInt(elementStyle.getPropertyValue('padding-top')),
    bottom: parseInt(elementStyle.getPropertyValue('padding-bottom')),
    right: parseInt(elementStyle.getPropertyValue('padding-right')),
    left: parseInt(elementStyle.getPropertyValue('padding-left'))
  }
  var elementPaddingVer = elementPadding.top + elementPadding.bottom
  var elementPaddingHor = elementPadding.right + elementPadding.left
  var availableHeight = parentElementHeight - elementPaddingVer
  var availableWidth = parentElementWidth - elementPaddingHor - this.viewport.scrollBarWidth
  var geometry = {
    cols: Math.floor(availableWidth / cellWidth),
    rows: Math.floor(availableHeight / cellHeight)
  }
  // This is still sometimes NaN, NaN !?
  return geometry
}

Terminal.prototype.fit = function () {
  var geometry = this.proposeGeometry()

  if (geometry) {
    if (this.rows !== geometry.rows || this.cols !== geometry.cols) {
      this.renderer.clear()
      this.resize(geometry.cols, geometry.rows)
    }
  }
}

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
    let terminalContainer = document.getElementById('terminal' + this.terminal.pid)
    this.term = new Terminal()
    this.term.open(terminalContainer)
    // open websocket
    // this.terminalSocket = new WebSocket('ws://127.0.0.1:3000/terminals/')
    // this.terminalSocket.onopen = this.runRealTerminal
    // this.terminalSocket.onclose = this.closeRealTerminal
    // this.terminalSocket.onerror = this.errorRealTerminal
    // this.term.attach(this.terminalSocket)
    this.term.fit()
    // fit(this.term)
    this.term._initialized = true
    this.term.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    console.log('mounted is going on')
  },
  beforeDestroy () {
    // this.term.detach(this.terminalSocket)
    // this.terminalSocket.close()
    // this.terminalSerialPort.close()
    this.term.destroy()
  }
}
</script>

<style>
</style>