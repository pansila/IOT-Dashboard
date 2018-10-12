<template>
  <b-modal :id="modalID"
           ref="editorModal"
           centered
           title="编辑脚本"
           size="lg"
           @ok.prevent="onCommOk"
           @shown="onShown">
	<div id="editor">function foo(items) {
	var x = "All this is syntax highlighted";
	return x;
}
    </div>
  </b-modal>
</template>

<script>
  // import {mapState} from 'vuex'
  import ace from 'ace-builds/src-noconflict/ace'
  import 'ace-builds/webpack-resolver'
  
  export default {
    name: 'codeEditor',
    props: [
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