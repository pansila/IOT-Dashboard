<template>
  <div>
    <b-card no-body>
      <b-tabs card>
        <b-tab no-body title="控制台" active @click="onConsolePage(0)">
          <b-tabs pills card end>
            <b-tab no-body :title="`COM ${i}`" v-for="i in tabs" :key="i">
              <b-card-header>Tab header {{i}}</b-card-header>
              <b-card-img bottom src="https://picsum.photos/600/200/?image=25" />
              <b-btn size="sm" variant="danger" class="float-right" @click="()=>closeTab(i)">
                Close
              </b-btn>
              <b-card-footer>Tab footer {{i}}</b-card-footer>
            </b-tab>
            <b-nav-item slot="tabs" @click.prevent="newTab" href="#">
              +
            </b-nav-item>
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
        <b-tab no-body title="自动化测试" @click="onConsolePage(2)">
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
        tabCounter: 0
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
      newTab () {
        this.getCOMM().then(commList => {
          console.log(commList)
          this.tabs.push(this.tabCounter++)
        })
      },
      getCOMM () {
        return new Promise((resolve, reject) =>
          serialport.list((err, ports) => {
            let commList
            // console.log(JSON.stringify(ports))
            if (err) {
              reject(err)
              console.log(err)
              return
            }
            commList = ports.map(port => {
              return port.comName
            })
            resolve(commList)
          })
        )
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
