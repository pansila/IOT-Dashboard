<template>
  <div class="h-100">
    <b-card class="h-100" no-body>
      <b-tabs class="h-100 my-d-flex" card>
        <b-tab class="my-d-flex" no-body title="控制台" active>
          <b-tabs pills card end class="my-d-flex">
            <b-tab no-body :title="commList[t]" v-for="(t, i) in tabs" :key="`console${t}`">
              <b-container fluid class="my-d-flex-grid">
                <b-row class="flex-grow-1">
                  <b-col class="my-d-flex-grid p-0">
                    <my-terminal
                      :pid="i"
                      class="my-d-flex"
                      :id="'terminal' + i" >
                    </my-terminal>
                  </b-col>
                  <b-col cols="3" class="p-0">
                    <b-card no-body>
                      <b-card-header>历史命令</b-card-header>
                      <b-list-group>
                        <b-list-group-item href="#"
                          @click="onHistoryClick(i, j)"
                          @dblclick="onHistoryDblClick(i)"
                          v-for="(c, j) in terminals[i].history"
                          :key="`${c}-${i}-${j}`">{{c}}</b-list-group-item>
                      </b-list-group>
                    </b-card>
                  </b-col>
                </b-row>
              </b-container>
              <div style="position: relative;">
                <b-btn size="sm" variant="danger" class="my-close-btn" @click="()=>closeTab(i)">
                  x
                </b-btn>
              </div>
            </b-tab>
            <b-nav-item slot="tabs" v-b-modal.comm-config-modal href="#">
              +
            </b-nav-item>
            <my-comm-config modalID="comm-config-modal"></my-comm-config>
            <!-- Render this if no tabs -->
            <div slot="empty" style="margin: auto" class="h-100 text-center text-muted">
              There are no open tabs
              <br> Open a new tab using + button.
            </div>
          </b-tabs>
        </b-tab>
        <b-tab no-body title="调试">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=25" />
        </b-tab>
        <b-tab no-body title="自动测试">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=23" />
        </b-tab>
        <b-tab no-body title="文档查询">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=24" />
        </b-tab>
        <b-tab no-body title="固件下载">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=26" />
        </b-tab>
        <b-tab no-body title="固件分析">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=27" />
        </b-tab>
        <b-tab no-body title="固件定制">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=29" />
        </b-tab>
        <b-tab no-body title="抓包分析">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=28" />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
  import Console from '@components/Console'
  import CommConfigModal from '@components/CommConfigModal'
  import {mapState} from 'vuex'
  
  export default {
    name: 'tabbar',
    data () {
      return {
        tabCounter: 0
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
      console.log('node: ' + process.versions.node,
        'electron: ' + process.versions['atom-shell'],
        'platform: ' + require('os').platform(),
        'vue: ' + require('vue/package.json').version)
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
      }
    },
    components: {
      'my-terminal': Console,
      'my-comm-config': CommConfigModal
    }
  }
</script>

<style>
.tab-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.tab-content > .active {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.my-d-flex-grid {
  display: flex;
  flex-grow: 1;
}
.my-d-flex {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.my-close-btn {
  position: absolute;
  right: 0;
}
</style>
