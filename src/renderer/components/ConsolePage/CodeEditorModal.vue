<template>
  <b-modal :id="modalID"
           :ref="modalID"
           centered
           :title="title"
           size="lg"
           @ok="onOk" >
    <div id="editor">import {print, exit, sleep, listen, command2term, command2local} from '../test-helper'

// it's recommended to define a function and then execute it at the end
async function start () {
  // print a message to the script terminal in the UI
  print('start to scan networks')

  // write a message/command to the console terminal in the UI
  command2term('wifi_scan')
  // listen to the keyword of interest, continue if found, throw an error if timeout
  try {
    let data = await listen('finished', 5000)
    print('found message: ' + data)
  } catch (err) {
    print(err.toString())
  }

  // sleep 3 seconds
  await sleep(1000)
  print('scan done')

  // synchronized call to local shell, return stdout if succeeded, throw an error if failed
  try {
    let data = await command2local('ping 127.0.0.1')
    print('command result: ' + data)
  } catch (err) {
    print(err.toString())
  }

  // should be always called at the end of the function, otherwise the process won't exit
  exit()
}

start()</div>
    <br/>
    <b-form-input v-model="scriptName"
                  type="text"
                  v-show="newFile"
                  placeholder="请输入要保存的文件名"></b-form-input>
  </b-modal>
</template>

<script>
  // import {mapState} from 'vuex'
  import path from 'path'
  import fs from 'fs'
  import ace from 'ace-builds/src-noconflict/ace'
  import setupAce from '@utils/ace-webpack-resolver'
  import * as constant from '@utils/Constant'
  import scripts from '@utils/Scripts'

  setupAce(ace)

  export default {
    name: 'codeEditor',
    props: [
      'eventHub',
      'modalID'
    ],
    data () {
      return {
        editor: null,
        script: null,
        title: null,
        codeTemplate: null,
        newFile: false,
        scriptName: null
      }
    },
    mounted () {
      this.editor = ace.edit('editor')
      this.editor.setTheme('ace/theme/twilight')
      this.editor.session.setMode('ace/mode/javascript')
      this.codeTemplate = this.editor.getValue()
      this.eventHub.$on(constant.EVENT_UPDATE_SCRIPT, value => {
        this.script = scripts.getScriptFilePath(value)
      })
      this.eventHub.$on(constant.EVENT_EDIT_SCRIPT, value => {
        if (!this.script) {
          this.title = 'New Script'
          this.scriptName = ''
          this.newFile = true
          return
        }
        this.newFile = false
        this.title = path.basename(this.script)
        let content = fs.readFileSync(this.script).toString()
        this.editor.setValue(content)
        this.editor.moveCursorTo(0, 0)
      })
      this.eventHub.$on(constant.EVENT_NEW_SCRIPT, value => {
        this.newFile = true
        this.title = 'New Script'
        this.scriptName = ''
        this.editor.setValue(this.codeTemplate)
        this.editor.moveCursorTo(0, 0)
      })
    },
    computed: {
    },
    methods: {
      onOk (evt) {
        if (this.newFile) {
          if (this.scriptName) {
            if (path.extname(this.scriptName) === '') {
              this.script = this.scriptName + '.js'
            } else if (path.extname(this.scriptName) !== '.js') {
              alert('请保存为js文件')
              evt.preventDefault()
              return
            }
            this.script = scripts.getScriptFilePath(this.script)
          } else {
            alert('请输入要保存的文件名')
            evt.preventDefault()
            return
          }
        }
        fs.writeFileSync(this.script, this.editor.getValue())
        this.eventHub.$emit(constant.EVENT_REFRESH_SCRIPT, this.script)
      }
    }
  }
</script>

<style>
#editor{
    width:100%;
    height:300px;
}
</style>