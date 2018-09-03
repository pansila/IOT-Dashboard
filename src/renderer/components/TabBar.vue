<template>
  <div class="h-100">
    <b-card class="h-100" no-body>
      <b-tabs class="h-100 my-d-flex" card>
        <b-tab class="my-d-flex" no-body title="控制台" active @click="onConsolePage(0)">
          <b-tabs pills card end class="my-d-flex">
            <b-tab no-body :title="commList[i]" v-for="i in tabs" :key="`console${i}`">
              <div class="my-d-flex">
                <my-terminal
                  class="my-d-flex"
                  :terminal="terminals[terminals.length - 1]"
                  :id="'terminal' + i"
                  :style="containerGeom">
                </my-terminal>
              </div>
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
                <b-form inline>
                  <label class="mr-sm-2">串口</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="commSelected"
                                 :options="commList"
                                 size='sm'>
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2">波特率</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="baudrateSelected"
                                 :options="baudrates"
                                 size='sm'>
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2">数据位</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="databitSelected"
                                 :options="databits"
                                 size='sm'>
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2">停止位</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="stopbitSelected"
                                 :options="stopbits"
                                 size='sm'>
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2">校验位</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="checksumSelected"
                                 :options="checksumbits"
                                 size='sm'>
                    <option slot="first" :value="1">Choose...</option>
                  </b-form-select>
                </b-form>
              </form>
            </b-modal>
            <!-- Render this if no tabs -->
            <div slot="empty" class="h-100 text-center text-muted">
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
        <b-tab no-body title="SDK发布" @click="onConsolePage(7)">
          <b-card-header>Comming Soon...</b-card-header>
          <b-card-img bottom src="https://picsum.photos/600/200/?image=30" />
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
  import serialport from 'serialport'
  import Console from './Console'
  import resizesensor from './ResizeSensor'
  
  export default {
    name: 'tabbar',
    data () {
      return {
        containerGeom: {
          // width: '600px',
          // height: '600px'
        },
        terminals: [],
        tabs: [],
        tabCounter: 0,
        commSelected: '1',
        commList: {},
        baudrateSelected: '115200',
        baudrates: [
          '4800',
          '9600',
          '38400',
          '115200'
        ],
        databitSelected: '8',
        databits: [
          '8',
          '9'
        ],
        stopbitSelected: '1',
        stopbits: [
          '0',
          '1'
        ],
        checksumSelected: '0',
        checksumbits: [
          '0',
          '1'
        ]
      }
    },
    computed: {
    },
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
      getCOMM () {
        return new Promise((resolve, reject) =>
          serialport.list((err, ports) => {
            let commList = {}
            let idx = 1
            // console.log(JSON.stringify(ports))
            if (err) {
              reject(err)
              console.log(err)
              return
            }
            //
            ports = [{'comName': 'COM1'}, {'comName': 'COM2'}, {'comName': 'COM3'}]
            ports.forEach(port => {
              commList[idx++ + ''] = port.comName
            })
            resolve(commList)
          })
        )
      },
      onShown () {
        this.getCOMM().then(commList => {
          this.commList = commList
        })
      },
      onCommOk (evt) {
        evt.preventDefault()
        if (!this.commSelected || !this.baudrateSelected ||
            !this.databitSelected || !this.stopbitSelected ||
            !this.checksumSelected) {
          alert('Please choose valid config for serial port')
          return
        }
        if (this.tabs.indexOf(this.commSelected) < 0) {
          let pid = this.commSelected
          this.terminals.push({
            pid: pid
          })
          this.tabs.push(this.commSelected)
          this.$refs.commModal.hide()
        } else {
          alert(`It's already opened, choose another one`)
        }
      }
    },
    components: {
      'my-terminal': Console,
      'resize-sensor': resizesensor
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
