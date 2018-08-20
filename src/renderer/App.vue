<template>
  <div id="app">
    <router-view></router-view>
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
    name: 'wifidashboard'
  }
</script>

<style>
  /* CSS */
</style>
