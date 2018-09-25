<template>
  <b-tabs pills card end class="iot-d-flex-grow">
    <b-tab @contextmenu="onRightClick" no-body :title="commList[t]" v-for="(t, i) in tabs" :key="`console${t}`">
      <b-container fluid class="iot-d-flex-grid">
        <b-row class="flex-grow-1">
          <b-col class="iot-d-flex-grid p-0">
            <iot-terminal
              :pid="i"
              class="iot-d-flex-grow"
              :containerID="'terminal' + i" 
              :id="'terminal' + i"
              :eventHub="terminalEventHub" />
          </b-col>
          <b-col cols="3" class="iot-d-flex">
            <b-row class="h-50">
              <b-card no-body class="flex-grow-1" style="overflow: auto;">
                <b-card-header class="text-center">历史命令</b-card-header>
                <b-list-group>
                  <b-list-group-item href="#"
                    @click="onHistoryClick(i, j)"
                    @dblclick="onHistoryDblClick(i)"
                    v-for="(c, j) in terminals[i].history"
                    :key="`${c}-${i}-${j}`">{{c}}</b-list-group-item>
                </b-list-group>
              </b-card>
            </b-row>
            <b-row>
              <b-card no-body class="flex-grow-1">
                <b-card-header class="text-center">脚本</b-card-header>
                <div class="m-2 iot-d-flex">
                  <b-form-select v-model="scriptSelected" :options="scripts" class="mb-2" />
                  <b-button-group size="sm">
                    <b-btn class="flex-grow-1" variant="primary" @click="onRunScript">运行</b-btn>
                    <b-btn class="flex-grow-1" variant="warning" @click="onStopScript">停止</b-btn>
                    <b-btn class="" @click="onEditScript">编辑</b-btn>
                    <b-btn class="" @click="onAddScript">添加</b-btn>
                    <b-btn variant="danger" @click="onDeleteScript">删除</b-btn>
                  </b-button-group>
                </div>
                <b-card-footer class="text-center">脚本运行结果</b-card-footer>
				        <iot-mini-terminal class="d-flex"
                  :containerID="'scriptTerminal' + i"
                  :id="'scriptTerminal' + i"
                  :eventHub="scriptEventHub"/>
              </b-card>
            </b-row>
          </b-col>
        </b-row>
      </b-container>
      <div style="position: relative;">
        <b-btn size="sm" variant="danger" class="iot-close-btn" @click="()=>closeTab(i)">
          x
        </b-btn>
      </div>
    </b-tab>
    <b-nav-item slot="tabs" v-b-modal.comm-config-modal href="#">
      +
    </b-nav-item>
    <iot-comm-config modalID="comm-config-modal"></iot-comm-config>
    <!-- Render this if no tabs -->
    <div slot="empty" style="margin: auto" class="h-100 text-center text-muted">
      没有打开的终端
      <br> 点击下方+按钮创建一个新的终端
    </div>
  </b-tabs>
</template>

<script>
  import Terminal from '@components/ConsolePage/Terminal'
  import ScriptTerminal from '@components/ConsolePage/ScriptTerminal'
  import CommConfigModal from '@components/ConsolePage/CommConfigModal'
  import {mapState} from 'vuex'
  import {ipcRenderer} from 'electron'
  import fs from 'fs'
  import path from 'path'
  import Vue from 'vue'

  export default {
    name: 'consolePage',
    data () {
      return {
        tabCounter: 0,
        scripts: [],
        scriptSelected: 0,
        terminalEventHub: new Vue(),
        scriptEventHub: new Vue()
      }
    },
    computed: {
      ...mapState({
        terminals: state => state.terminal.terminals,
        commList: state => state.terminal.commList,
        tabs: state => state.terminal.tabs
      })
    },
    mounted () {
      let scriptPath = path.join(__static, '/scripts')
      fs.readdir(scriptPath, (err, files) => {
        if (err) {
          alert(err)
          return
        }
        files.forEach(file => {
          fs.stat(path.join(scriptPath, file), (err, stats) => {
            if (err) {
              alert(err)
              return
            }
            if (stats.isFile()) {
              if (file.endsWith('.js')) file = file.slice(0, -3)
              this.scripts.push(file)
            }
          })
        })
      })

      ipcRenderer.on('asynchronous-reply', (event, value) => {
        if (value.type && value.type === 'terminal') {
          this.terminalEventHub.$emit('SCRIPT_OUTPUT', value.data)
        } else if (value.type && value.type === 'log') {
          this.scriptEventHub.$emit('SCRIPT_OUTPUT', value.data)
        }
      })

      this.scriptEventHub.$on('SCRIPT_INPUT', console.log)
      this.terminalEventHub.$on('SCRIPT_INPUT', console.log)
    },
    methods: {
      closeTab (i) {
        this.$store.commit('DEL_TAB', i)
        this.$store.commit('DEL_TERMINAL', i)
      },
      onHistoryClick (pid, cmdIdx) {
        this.$store.commit('SHOW_HISTORY_COMMAND', {pid: pid, cmdIdx: cmdIdx})
      },
      onHistoryDblClick (pid) {
        this.$store.commit('ISSUE_HISTORY_COMMAND', pid)
      },
      onRightClick (e) {
        console.log(e)
      },
      onRunScript (e) {
        if (!this.scriptSelected) return
        ipcRenderer.send('asynchronous-message', {
          script: {
            command: 'run',
            value: this.scriptSelected + '.js'
          }
        })
      },
      onStopScript (e) {
      },
      onEditScript (e) {
      },
      onAddScript (e) {
      },
      onDeleteScript (e) {
      }
    },
    components: {
      'iot-terminal': Terminal,
      'iot-mini-terminal': ScriptTerminal,
      'iot-comm-config': CommConfigModal
    }
  }
</script>

<style>
</style>
