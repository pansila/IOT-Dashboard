<template>
  <div role='navigation'>
    <b-nav tabs>
      <b-nav-item :class='{active: isPage0Active}' @click="onConsolePage(0)">控制台</b-nav-item>
      <b-nav-item :class='{active: isPage1Active}' @click="onConsolePage(1)">调试</b-nav-item>
      <b-nav-item :class='{active: isPage2Active}' @click="onConsolePage(2)">自动化测试</b-nav-item>
      <b-nav-item :class='{active: isPage3Active}' @click="onConsolePage(3)">文档查询</b-nav-item>
      <b-nav-item :class='{active: isPage4Active}' @click="onConsolePage(4)">固件下载</b-nav-item>
      <b-nav-item :class='{active: isPage5Active}' @click="onConsolePage(5)">固件分析</b-nav-item>
      <b-nav-item :class='{active: isPage6Active}' @click="onConsolePage(6)">抓包分析</b-nav-item>
    </b-nav>
  </div>
</template>

<script>
  import serialport from 'serialport'
  
  serialport.list((err, ports) => {
    console.log(JSON.stringify(ports))
    if (err) {
      console.log(err)
      return
    }
    var outStr = ports.map(port => {
      return port.comName
    }).join(', ')
    console.log(outStr)
  })
  
  export default {
    name: 'nav',
    data () {
      return {
        pageNum: 7,
        lastActive: 0,
        pageActive: [true, false, false, false, false, false, false]
      }
    },
    computed: {
      isPage0Active () {
        return this.pageActive[0]
      },
      isPage1Active () {
        return this.pageActive[1]
      },
      isPage2Active () {
        return this.pageActive[2]
      },
      isPage3Active () {
        return this.pageActive[3]
      },
      isPage4Active () {
        return this.pageActive[4]
      },
      isPage5Active () {
        return this.pageActive[5]
      },
      isPage6Active () {
        return this.pageActive[6]
      }
    },
    methods: {
      onConsolePage (idx) {
        this.pageActive[this.lastActive] = false
        this.pageActive[idx] = true
        this.lastActive = idx
        console.log(this.pageActive)
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
