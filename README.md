# IOT Dashboard

> 一个方便强大的IOT嵌入式设备集成调试工具

For English users: [IOT Dashboard Introduction](https://github.com/pansila/IOT-Dashboard/blob/master/README_EN.md)

### 特点
#### 基于electron开发
* 跨平台支持，Windows, Linux, macOS
* 自动在线更新
#### 一个强化的串口工具
* 关键字高亮，可自定义规则
* 可编程脚本(javascript)与串口交互，方便自动测试
* 串口可在局域网内共享，方便设备不在手边的调试需求
#### 调试数据可视化
* 在满足一定的数据交换格式后，设备报上来的数据可以在页面可视化
* 串口或者jtag
#### 分布式自动化测试环境
* 基于[Robot自动测试框架](http://robotframework.org/)
* 提供一个集中的任务控制服务器，任务调度，生成报表，等等
* 支持树莓派和本地PC Slaves
#### 固件下载
* 可以从配置好的文件服务器上下载固件
* 将固件烧写到IOT设备上（先支持STM系列，后续扩展）
#### 固件map内存分配可视化
#### 文档查询
* 支持常见CPU的官方文档
* 支持内部文档，json, markdown, word格式，需要满足一定格式
* 串口直接超链接跳转查询
#### 抓包分析
* 该功能针对IOT WiFi设备，抓取空包
* 自动分析sniffer log，帮助筛查问题
#### slack即使通讯
* 供各位IOT开发人员和爱好者交流

### 任务列表
- [ ] 跨平台
  - [x] Windows
  - [ ] Linux
  - [ ] macOS
- [x] 自动在线更新
- [ ] 强化串口工具
  - [x] 可编程脚本交互
  - [x] 关键字高亮
  - [ ] 脚本编辑工具
  - [ ] 串口网络共享
- [ ] 调试数据可视化
- [ ] 分布式自动化测试
- [ ] 固件可视化
- [ ] 文档查询
- [ ] 抓包分析
- [ ] slack即使通讯

### 开发者说明
#### 编译步骤

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build

# run unit & end-to-end tests
npm test


# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[4c6ee7b](https://github.com/SimulatedGREG/electron-vue/tree/4c6ee7bf4f9b4aa647a22ec1c1ca29c2e59c3645) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
