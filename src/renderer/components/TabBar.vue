<template>
  <div class="h-100">
    <b-card class="h-100" no-body>
      <b-tabs class="h-100 iot-d-flex-grow" card>
        <b-tab class="iot-d-flex-grow" no-body title="控制台" active>
          <iot-console/>
        </b-tab>
        <b-tab no-body title="调试">
          <b-card-header>Coming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=25" />
        </b-tab>
        <b-tab no-body title="自动测试">
          <webview ref="foo" :src="webURL" class="iot-d-flex-grow"></webview>
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
    <div>
      <b-modal ref="modalUpdate" title="升级提示" centered>
        <div>
          <p>发现新版本</p>
          <p>{{updateVersion}}</p>
          <p>更新内容</p>
          <div class="pl-3" v-html="updateDetails" />
        </div>
        <div slot="modal-footer" class="w-100">
          <b-btn size="sm" class="float-right ml-2" variant="primary" @click="onUpdateNow">
            立即更新
          </b-btn>
          <b-btn size="sm" class="float-right ml-2" @click="onUpdateOnQuit">
            退出时更新
          </b-btn>
          <b-btn size="sm" class="float-right" @click="onNoUpdate">
            不更新
          </b-btn>
       </div>
      </b-modal>
  </div>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import Console from '@components/ConsolePage/Console'
  import * as constant from '@utils/Constant'
  // import settings from '@utils/Settings'
  // import scripts from '@utils/Scripts'
  
  export default {
    name: 'tabbar',
    data () {
      return {
        updateVersion: '',
        updateDetails: '',
        webURL: 'http://localhost:8080/'
      }
    },
    mounted () {
      /** scripts is singleton, thus it needs to be initialized only once */
      // if (settings.has('customScriptPath')) {
      //   scripts.setPath(settings.get('customScriptPath'))
      // }
      // if (settings.has('testWebServer')) {
      //   this.webURL = settings.get('testWebServer')
      // }
      ipcRenderer.on(constant.EVENT_UPDATE, (event, info) => {
        this.updateVersion = ''
        this.updateDetails = ''
        if (info) {
          let {releaseDate, releaseName, releaseNotes} = info
          this.updateVersion = releaseName + ' released on ' + new Date(releaseDate).toLocaleString()
          this.updateDetails = releaseNotes
        }
        this.$refs.modalUpdate.show()
      })
    },
    methods: {
      onUpdateNow (evt) {
        ipcRenderer.send(constant.EVENT_UPDATE, constant.MSG_UPDATE_NOW)
        this.$refs.modalUpdate.hide()
      },
      onUpdateOnQuit (evt) {
        ipcRenderer.send(constant.EVENT_UPDATE, constant.MSG_UPDATE_ON_QUIT)
        this.$refs.modalUpdate.hide()
      },
      onNoUpdate (evt) {
        ipcRenderer.send(constant.EVENT_UPDATE, constant.MSG_NO_UPDATE)
        this.$refs.modalUpdate.hide()
      }
    },
    components: {
      'iot-console': Console
    }
  }
</script>

<style>
/* <style lang="sass" scoped> */
/* .tab-content {
  @extend .iot-d-flex;
} */
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
.iot-d-flex-grid {
  display: flex;
  flex-grow: 1;
}
.iot-d-flex {
  display: flex;
  flex-direction: column;
}
.iot-d-flex-grow {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.iot-close-btn {
  position: absolute;
  right: 0;
}
</style>
