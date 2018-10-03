# IOT Dashboard

> 一个方便强大的IOT嵌入式设备集成调试工具

For English users: [IOT Dashboard Introduction](https://github.com/pansila/IOT-Dashboard/blob/master/README_EN.md)

1. [软件特点](#软件特点)
2. [用户说明](#用户说明)
3. [开发者说明](#开发者说明)
4. [开发进度](#开发进度)

### 软件特点
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
* 可以从配置好的文件服务器上下载历史版本，方便回归测试
* 将固件烧写到IOT设备上（先支持STM系列，后续扩展）
#### 固件map内存分配可视化
* 方便检查内存使用情况
#### 文档查询
* 支持常见CPU的官方文档
* 支持内部文档，json, markdown, word格式，需要满足一定格式
* 串口直接超链接跳转查询
#### 抓包分析
* 该功能针对IOT WiFi设备，抓取空包
* 自动分析sniffer log，帮助筛查问题
#### slack即时通讯
* 供各位嵌入式开发人员和爱好者交流

### 用户说明
#### 报告问题
如果有问题请提issue，描述清楚问题，并附上log.log内容。

Issue格式
* 标题：一句话描述
* 现象：文字详细描述，有图片更好
* 平台：操作系统(Windows 7/10, Ubuntu 18.xx, macOS 10.xx)，平台(x64/x86)
* 复现步骤：能复现才能更快地解决问题

log.log位置
* Windows: %USERPROFILE%\AppData\Roaming\IOT-Dashboard\log.log
* macOS: ~/Library/Logs/IOT-Dashboard/log.log
* Linux: ~/.config/IOT-Dashboard/log.log

#### 用户配置
所有以下划线"_"开头的都是注释字段，将下划线去掉后，字段生效。
* updateServer
  
  指定更新服务器，默认的github国内网速不佳，可以候选服务器Amazon S3, DigitalOcean Spaces, Bintray甚至自建的HTTP(s)服务器(最简单的python -m SimpleHTTPServer)
* updateInterval
  
  检查更新的时间间隔，默认1小时，单位毫秒

* highlight

  高亮规则
* serialports
  
  串口配置信息，为指定串口保存配置信息以便下次重新使用，包括串口本身配置，如波特率，数据位，停止位等，以及历史命令等

#### 脚本系统
测试脚本支持ES6+语法，自带的test.js脚本有基本的使用例子。推荐在每个脚本的开头，引入test-helper.js模块，该模块提供了一些辅助函数来帮助更容易地编写测试用例，尤其是通过引入async/await语法，将嵌入式开发者不熟悉的js回调编程方式，转换成了类似C语言的过程式编程方式，更易于理解和编写。

### 开发者说明
软件采用electron + vue + bootstrap框架开发，开发者需要熟悉javascript和vue框架，推荐使用VS Code开发

#### 脚本系统
执行脚本时，由console页面从renderer process发送消息给main process，main process收到消息后会fork一个进程去执行test-runner.js，并且main process会把要执行的脚本通过ipc通道发给test-runner.js，test-runner.js启动后收到消息会接着从同级的script目录下，查找并执行指定的脚本，在执行前会用babel处理测试脚本中的ES6+语法。

#### 开发设置步骤

``` bash
# 安装yarn，一个比npm更好的包管理工具
npm install -g yarn

# 鉴于国内糟糕的出国带宽，建议使用国内的源
npm install -g nrm
nrm use cnpm

# 安装依赖模块
yarn

# 在localhost:9080启动热更新调试服务器
npm run dev

# 如果你碰到VCBuild/MSBuild问题，执行下面命令，可能需要开启VPN或者出国代理，安装完可能要重启电脑
npm install -g windows-build-tools

# 编译electron量产版本，首次编译需要从国外服务器下载文件，可能需要开启VPN或者出国代理
npm run build

# 单元测试
npm test
```

### 开发进度
- [x] 自动在线更新
  - [x] github
  - [x] local server
- [ ] 强化串口工具
  - [x] 可编程脚本交互
  - [x] 关键字高亮
  - [ ] 脚本编辑工具
  - [ ] 串口网络共享
- [ ] Travis CI集成
- [ ] 分布式自动化测试
- [ ] slack聊天客户端
- [ ] 国际化
- [ ] 单元测试
- [ ] 跨平台
  - [x] Windows
  - [ ] Linux
  - [ ] macOS
- [ ] 调试数据可视化
- [ ] 固件可视化
- [ ] 文档查询
- [ ] 抓包分析

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[4c6ee7b](https://github.com/SimulatedGREG/electron-vue/tree/4c6ee7bf4f9b4aa647a22ec1c1ca29c2e59c3645) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
