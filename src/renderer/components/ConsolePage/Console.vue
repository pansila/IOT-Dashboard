<template>
  <b-tabs pills card end class="iot-d-flex-grow">
    <b-tab @contextmenu="onRightClick" no-body :title="commList[t]" v-for="(t, i) in tabs" :key="`console${t}`">
      <b-container fluid class="iot-d-flex-grid">
        <b-row class="flex-grow-1">
          <b-col class="iot-d-flex-grid p-0">
            <iot-terminal
              :pid="i"
              class="iot-d-flex-grow"
              :id="'terminal' + i" >
            </iot-terminal>
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
                    <b-btn class="flex-grow-1" variant="success">运行</b-btn>
                    <b-btn class="flex-grow-1">编辑</b-btn>
                    <b-btn class="flex-grow-1">添加</b-btn>
                    <b-btn variant="danger">删除</b-btn>
                  </b-button-group>
                </div>
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
  import CommConfigModal from '@components/ConsolePage/CommConfigModal'
  import {mapState} from 'vuex'

  export default {
    name: 'consolePage',
    data () {
      return {
        tabCounter: 0,
        scripts: [
          { value: '1', text: 'test1 for abc' },
          { value: '2', text: 'test2 for abc' },
          { value: '3', text: 'test3 for abc' },
          { value: '4', text: 'test4 for abc' }
        ],
        scriptSelected: 0
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
      }
    },
    components: {
      'iot-terminal': Terminal,
      'iot-comm-config': CommConfigModal
    }
  }
</script>

<style>
</style>
