<template>
  <div>
    <b-card no-body>
      <b-tabs card>
        <b-tab no-body title="控制台" active @click="onConsolePage(0)">
          <b-tabs pills card end>
            <b-tab no-body :title="commList[i]" v-for="i in tabs" :key="i">
              <b-card-header>Tab header {{i}}</b-card-header>
              <b-card-img bottom src="https://picsum.photos/600/200/?image=25" />
              <b-btn size="sm" variant="danger" class="float-right" @click="()=>closeTab(i)">
                Close
              </b-btn>
              <b-card-footer>Tab footer {{i}}</b-card-footer>
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
              <!-- <b-container fluid>
                <b-row class="mb-1 text-center">
                  <b-col cols="3"> </b-col>
                  <b-col>Background</b-col>
                  <b-col>Text</b-col>
                </b-row>
              </b-container> -->
              <form @submit.stop.prevent="handleSubmit">
                <b-form inline>
                  <label class="mr-sm-2" for="inlineFormCustomSelectPref">串口</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="commSelected"
                                 :options="commList"
                                 id="inlineFormCustomSelectPref">
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2" for="inlineFormCustomSelectPref">波特率</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="baudrateSelected"
                                 :options="baudrates"
                                 id="inlineFormCustomSelectPref">
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2" for="inlineFormCustomSelectPref">数据位</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="databitSelected"
                                 :options="databits"
                                 id="inlineFormCustomSelectPref">
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2" for="inlineFormCustomSelectPref">停止位</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="stopbitSelected"
                                 :options="stopbits"
                                 id="inlineFormCustomSelectPref">
                    <option slot="first" :value="null">Choose...</option>
                  </b-form-select>
                  <label class="mr-sm-2" for="inlineFormCustomSelectPref">校验位</label>
                  <b-form-select class="mb-2 mr-sm-2 mb-sm-0"
                                 v-model="checksumSelected"
                                 :options="checksumbits"
                                 id="inlineFormCustomSelectPref">
                    <option slot="first" :value="1">Choose...</option>
                  </b-form-select>
                </b-form>
              </form>
            </b-modal>
            <!-- Render this if no tabs -->
            <div slot="empty" class="text-center text-muted">
              There are no open tabs
              <br> Open a new tab using + button.
            </div>
          </b-tabs>
        </b-tab>
        <b-tab no-body title="调试" @click="onConsolePage(1)">
          <b-card-img bottom src="https://picsum.photos/600/200/?image=25" />
          <b-card-footer>Picture 2 footer</b-card-footer>
        </b-tab>
        <b-tab no-body title="自动测试" @click="onConsolePage(2)">
          <b-card-img bottom src="https://picsum.photos/600/200/?image=23" />
          <b-card-footer>Picture 2 footer</b-card-footer>
        </b-tab>
        <b-tab no-body title="文档查询" @click="onConsolePage(3)">
          <b-card-img bottom src="https://picsum.photos/600/200/?image=24" />
          <b-card-footer>Picture 2 footer</b-card-footer>
        </b-tab>
        <b-tab no-body title="固件下载" @click="onConsolePage(4)">
          <b-card-img bottom src="https://picsum.photos/600/200/?image=26" />
          <b-card-footer>Picture 2 footer</b-card-footer>
        </b-tab>
        <b-tab no-body title="固件分析" @click="onConsolePage(5)">
          <b-card-img bottom src="https://picsum.photos/600/200/?image=27" />
          <b-card-footer>Picture 2 footer</b-card-footer>
        </b-tab>
        <b-tab no-body title="抓包分析" @click="onConsolePage(6)">
          <b-card-img bottom src="https://picsum.photos/600/200/?image=28" />
          <b-card-footer>Picture 2 footer</b-card-footer>
        </b-tab>
      </b-tabs>
    </b-card>
    <router-view></router-view>
  </div>
</template>

<script>
  import serialport from 'serialport'
  
  export default {
    name: 'tabbar',
    data () {
      return {
        tabs: [],
        tabCounter: 0,
        name: '',
        names: [],
        commSelected: '2',
        commList: {},
        baudrateSelected: '4',
        baudrates: {
          '1': '4800',
          '2': '9600',
          '3': '38400',
          '4': '115200'
        },
        databitSelected: '1',
        databits: {
          '1': '8',
          '2': '9'
        },
        stopbitSelected: '1',
        stopbits: {
          '1': '1',
          '2': '0'
        },
        checksumSelected: '2',
        checksumbits: {
          '1': '1',
          '2': '0'
        }
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
        // evt.preventDefault()
        console.log(this.commList[this.commSelected])
        this.tabs.push(this.commSelected)
        this.$refs.commModal.hide()
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
