<template>
  <div class="h-100">
    <b-card class="h-100" no-body>
      <b-tabs class="h-100 iot-d-flex-grow" card>
        <b-tab class="iot-d-flex-grow" no-body title="控制台" active>
          <iot-console></iot-console>
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
  import Console from '@components/ConsolePage/Console'
  
  export default {
    name: 'tabbar',
    data () {
      return {
      }
    },
    computed: {
    },
    mounted () {
      console.log('node: ' + process.versions.node,
        'electron: ' + process.versions['atom-shell'],
        'platform: ' + require('os').platform(),
        'vue: ' + require('vue/package.json').version)
    },
    methods: {
    },
    components: {
      'iot-console': Console
    }
  }
</script>

<style>
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
