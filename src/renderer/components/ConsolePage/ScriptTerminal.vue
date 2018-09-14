<template>
  <div class="">
    <resize-sensor @resize="onResize"></resize-sensor>
  </div>
</template>

<script>
  import {Terminal} from 'xterm'
  import * as fit from 'xterm/lib/addons/fit/fit'
  import 'xterm/dist/xterm.css'
  import resizesensor from '@components/ResizeSensor'
  import {execFile} from 'child_process'

  Terminal.applyAddon(fit)

  export default {
    name: 'miniTerminal',
    props: [
      'containerID'
    ],
    data () {
      return {
      }
    },
    mounted () {
    },
    methods: {
      execScript (scriptPath) {
        const script = execFile(process.execPath, [scriptPath])

        script.stdout.on('data', (data) => {
          console.log(`stdout: ${data}`)
        })

        script.stderr.on('data', (data) => {
          console.log(`stderr: ${data}`)
        })

        script.on('close', (code) => {
          console.log(`child process exited with code ${code}`)
        })
      },
      onResize (size) {
        if (this.term) {
          this.term.fit()
          return
        }

        let terminalContainer = document.getElementById(this.containerID)
        this.term = new Terminal({
          rendererType: 'dom'
        })
        this.term.open(terminalContainer)
        this.term.fit()
        this.term._initialized = true
        this.term.on('key', (data) => {
          const child = execFile(process.execPath, ['test.js'], (error, stdout, stderr) => {
            if (error) {
              throw error
            }
            console.log(child, process)
            child.on('message', function (m) {
              console.log('Yes it works!')
            })
            child.send({hello: 'world'})
            console.log(stdout)
            console.log(stderr)
            this.term.write(data)
          })
        })
      }
    },
    beforeDestroy () {
      if (this.term) this.term.destroy()
    },
    components: {
      'resize-sensor': resizesensor
    }
  }
</script>

<style>

</style>
