<template>
  <div class="h-100">
    <b-card class="h-100" no-body>
      <b-tabs class="h-100 my-d-flex" card>
        <b-tab class="my-d-flex" no-body title="控制台" active @click="onConsolePage(0)">
          <b-tabs pills card end class="my-d-flex">
            <b-tab no-body :title="commList[i]" v-for="i in tabs" :key="`console${i}`">
              <b-container fluid class="my-d-flex">
                <b-row>
                  <b-col>
                    <my-terminal
                      class="my-d-flex"
                      :terminal="terminals[terminals.length - 1]"
                      :id="'terminal' + i"
                      >
                    </my-terminal>
                  </b-col>
                  <b-col cols="1">
                    <b-card>
                      <b-card-header>Comming Soon...</b-card-header>
                      <b-card-img bottom src="https://picsum.photos/600/200/?image=35" />
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
            <b-modal id="comm-config-modal"
                     centered
                     ref="commModal"
                     title="配置串口信息"
                     @ok="onCommOk"
                     @shown="onShown"
                     size="lg">
              <form @submit.stop.prevent="handleSubmit">
                <b-form-group label="连接方式">
                  <b-form-radio-group v-model="connectionType" name="connectionType">
                    <b-form-radio value="local">本地连接</b-form-radio>
                    <b-form-radio value="remote">远程连接</b-form-radio>
                  </b-form-radio-group>
                </b-form-group>
                <b-card no-body v-show="connectionType === 'remote'">
                  <b-container fluid>
                    <b-row>
                      <b-col sm="3" class="mt-2"><label>远端串口地址</label></b-col>
                      <b-col sm="9">
                        <b-form-input
                          class="mb-2 mt-2"
                          size="sm"
                          v-model="remoteIP"
                          type="text"
                          :state="IPState"
                          aria-describedby="IPFeedback"
                          placeholder="192.168.1.1">
                        </b-form-input>
                        <b-form-invalid-feedback id="IPFeedback">
                          IP地址不正确
                        </b-form-invalid-feedback>
                      </b-col>
                      <b-col sm="3"><label>远端串口端口</label></b-col>
                      <b-col sm="9">
                        <b-form-input
                          class="mb-2"
                          size="sm"
                          v-model="remotePort"
                          type="text"
                          :state="portState"
                          aria-describedby="PortFeedback"
                          placeholder="8848">
                        </b-form-input>
                        <b-form-invalid-feedback id="PortFeedback">
                          IP端口不正确
                        </b-form-invalid-feedback>
                      </b-col>
                      <b-col sm="3"><label>远端串口名称</label></b-col>
                      <b-col sm="9">
                        <b-form-input
                          class="mb-2"
                          size="sm"
                          v-model="remoteComm"
                          type="text"
                          :formatter="commFormat"
                          placeholder="COM1">
                        </b-form-input>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-card>
                <b-card v-show="connectionType === 'local'">
                  <b-form inline>
                    <label class="mr-sm-2">串口</label>
                    <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                   v-model="commSelected"
                                   :options="commList"
                                   size='sm'>
                    </b-form-select>
                    <label class="mr-sm-2">波特率</label>
                    <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                   v-model="baudrateSelected"
                                   :options="baudrates"
                                   size='sm'>
                    </b-form-select>
                    <label class="mr-sm-2">数据位</label>
                    <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                   v-model="databitSelected"
                                   :options="databits"
                                   size='sm'>
                    </b-form-select>
                    <label class="mr-sm-2">停止位</label>
                    <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                   v-model="stopbitSelected"
                                   :options="stopbits"
                                   size='sm'>
                    </b-form-select>
                    <label class="mr-sm-2">校验位</label>
                    <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                   v-model="paritySelected"
                                   :options="parity"
                                   size='sm'>
                    </b-form-select>
                  </b-form>
                </b-card>
                <br/>
                <b-form-checkbox v-model="advancedComm" class="mb-2 mr-sm-2 mb-sm-0">显示高级选项</b-form-checkbox>
                <b-card no-body v-show="advancedComm === true">
                  <b-form inline>
                    <b-form-checkbox class="ml-2 mb-2 mr-sm-2 mb-sm-0"
                                   v-model="timestampEnabled"
                                   value="true"
                                   size='sm'>
                      时间戳
                    </b-form-checkbox>
                    <b-form-checkbox class="mb-2 mr-sm-2 mb-sm-0"
                                   v-model="highlightEnabled"
                                   value="true"
                                   size='sm'>
                      消息高亮
                    </b-form-checkbox>
                    <b-input-group size="sm" v-show="connectionType === 'local'">
                      <b-input-group-prepend>
                          <b-form-checkbox
                                 class="mb-2 mr-sm-2 mb-sm-0"
                                 size="sm"
                                 aria-label="Checkbox for following text input"
                                 v-model="sharedOverWebsocket">
                            远程共享该串口
                          </b-form-checkbox>
                      </b-input-group-prepend>
                      <b-form-input type="text" placeholder="共享名称(默认当前串口号)" v-show="sharedOverWebsocket === true"/>
                    </b-input-group>
                  </b-form>
                </b-card>
              </form>
            </b-modal>
            <!-- Render this if no tabs -->
            <div slot="empty" style="margin: auto" class="h-100 text-center text-muted">
              There are no open tabs
              <br> Open a new tab using + button.
            </div>
          </b-tabs>
        </b-tab>
        <b-tab no-body title="调试" @click="onConsolePage(1)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=25" />
        </b-tab>
        <b-tab no-body title="自动测试" @click="onConsolePage(2)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=23" />
        </b-tab>
        <b-tab no-body title="文档查询" @click="onConsolePage(3)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=24" />
        </b-tab>
        <b-tab no-body title="固件下载" @click="onConsolePage(4)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=26" />
        </b-tab>
        <b-tab no-body title="固件分析" @click="onConsolePage(5)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=27" />
        </b-tab>
        <b-tab no-body title="固件定制" @click="onConsolePage(7)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=29" />
        </b-tab>
        <b-tab no-body title="抓包分析" @click="onConsolePage(6)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=28" />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
  import SerialPort from 'serialport'
  import Console from './Console'
  
  export default {
    name: 'tabbar',
    data () {
      return {
        connectionType: 'local',
        advancedComm: false,
        remoteIP: null,
        remotePort: null,
        remoteComm: null,
        terminals: [],
        tabs: [],
        tabCounter: 0,
        commSelected: '1',
        commList: {},
        baudrateSelected: 115200,
        baudrates: [
          4800,
          9600,
          14400,
          19200,
          38400,
          57600,
          115200
        ],
        databitSelected: 8,
        databits: [
          8,
          7,
          6,
          5
        ],
        stopbitSelected: 1,
        stopbits: [
          1,
          2
        ],
        paritySelected: 'none',
        parity: [
          'none',
          'even',
          'mark',
          'odd',
          'space'
        ],
        timestampEnabled: true,
        highlightEnabled: true,
        sharedOverWebsocket: false
      }
    },
    computed: {
      IPState () {
        if (!this.remoteIP) return true
        let ip = this.remoteIP.split('.')
        if (!ip || ip.length !== 4 || ip[3] === '' ||
            !/^\d+$/.test(ip[0] + ip[1] + ip[2] + ip[3])) {
          return false
        }
        return true
      },
      portState () {
        if (!this.remotePort) return true
        return /^\d+$/.test(this.remotePort)
      }
    },
    // mounted () {
    // },
    methods: {
      onConsolePage (idx) {
      },
      closeTab (x) {
        for (let i = 0; i < this.tabs.length; i++) {
          if (this.tabs[i] === x) {
            this.tabs.splice(i, 1)
            this.terminals.splice(i, 1)
          }
        }
      },
      commFormat (value, event) {
        return value.toUpperCase()
      },
      getComm () {
        return new Promise((resolve, reject) =>
          SerialPort.list()
            .then(ports => {
              let commList = {}
              let idx = 1
              // ports = [{'comName': 'COM1'}, {'comName': 'COM2'}, {'comName': 'COM3'}]
              ports.forEach(port => {
                commList[idx++ + ''] = port.comName
              })
              resolve(commList)
            })
            .catch(reject)
        )
      },
      checkComm (comm) {
        return new Promise((resolve, reject) => {
          const port = new SerialPort(comm, {
            autoOpen: false // to catch opening error
          })
          port.open(err => {
            if (err === null) {
              port.close(err => { if (err === null) resolve() })
            } else {
              reject(err)
            }
          })
        })
      },
      onShown () {
        this.getComm()
          .then(commList => {
            this.commList = commList
          })
          .catch(alert)
      },
      onCommOk (evt) {
        evt.preventDefault()
        if (!this.commSelected || !this.baudrateSelected ||
            !this.databitSelected || !this.stopbitSelected ||
            !this.paritySelected) {
          alert('Please choose valid config for serial port')
          return
        }
        if (this.tabs.indexOf(this.commSelected) < 0) {
          this.checkComm(this.commList[this.commSelected]).then(() => {
            this.terminals.push({
              pid: this.commSelected,
              comm: this.commList[this.commSelected],
              baudRate: this.baudrateSelected,
              dataBits: this.databitSelected,
              stopBits: this.stopbitSelected,
              parity: this.paritySelected,
              timestampPrefix: this.timestampPrefix
            })
            this.tabs.push(this.commSelected)
            this.$refs.commModal.hide()
          }, alert)
        } else {
          alert(`It's already opened, choose another one`)
        }
      }
    },
    components: {
      'my-terminal': Console
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
