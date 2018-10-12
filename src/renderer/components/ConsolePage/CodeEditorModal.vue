<template>
  <b-modal :id="modalID"
           :ref="modalID"
           centered
           title="编辑脚本"
           size="lg"
           @ok.prevent="onCommOk"
           @shown="onShown">
	<div id="editor">
import {print, exit, sleep, listen, command2term, command2local} from '../test-helper'

// it's recommended to define a function and then execute it at the end
async function start () {
  // do the test
  exit()
}

start()</div>
  </b-modal>
</template>

<script>
  // import {mapState} from 'vuex'
  import path from 'path'
  import fs from 'fs'
  import ace from 'ace-builds/src-noconflict/ace'
  import 'ace-builds/webpack-resolver'
  import * as constant from '@utils/Constant'
  
  export default {
    name: 'codeEditor',
    props: [
      'eventHub',
      'modalID'
    ],
    data () {
      return {
        editor: null
      }
    },
    mounted () {
      this.editor = ace.edit('editor')
      this.editor.setTheme('ace/theme/twilight')
      this.editor.session.setMode('ace/mode/javascript')
      this.eventHub.$on(constant.EVENT_EDIT_SCRIPT, value => {
        let filePath = path.join(__static, 'scripts', value)
        let content = fs.readFileSync(filePath).toString()
        this.editor.setValue(content)
      })
    },
    computed: {
    },
    methods: {
      onShown (evt) {
      },
      onCommOk (evt) {
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