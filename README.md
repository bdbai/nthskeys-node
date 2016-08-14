NthsKeys 作业答案计划 - Node ver.
=========================

[![Join the chat at https://gitter.im/bdbai/nthskeys-node](https://badges.gitter.im/bdbai/nthskeys-node.svg)](https://gitter.im/bdbai/nthskeys-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/bdbai/nthskeys-node.svg)](https://travis-ci.org/bdbai/nthskeys-node)
## 目的
[省苏州十中官网](http://nths.cn/News/index.jsp)

某中学每年都把假期作业答案加密压缩并上传至其官网，且没有归类，这给学生带来了很大麻烦。我开启这个项目，目的是通过自动化的方式来简化答案下载、解压、归类这一过程。

## 功能
 - [x] 浏览已解压文件
 - [x] 一键解压压缩包
 - [x] 自动整理和归类

## 架构
服务器端使用 Node.js 6 + Express 为服务框架， MongoDB 为数据库。前端使用 React 和 Bootstrap。

## 环境变量
```bash
# MongoDB 连接字符串
export MONGODB_CONNECTION="localhost:27017/nthskeys"

# 数据目录
export FILE_PATH="/var/data/nthskeys"

# 服务器监听端口，默认 9004，非必需
export PORT="9004"

# 百度统计的独立 ID，非必需
export BDTJ_ID="909044fbc84468a4ab64fc9544d428ea"

# DaoVoice ID，非必需
export DAOVOICE_ID="5e97ea9b"
```

## 后端模块测试
```
npm install
npm test
```

## 构建和运行
### 调试
```bash
export NODE_ENV="development"
npm install -g webpack webpack-dev-server # Linux 和 macOS 需要 `sudo`
npm run build
node server.js # 启动后端服务器于端口 9004
cd ./app
npm start # 启动前端热调试服务器于端口 8080
```

## 生产环境
```bash
export NODE_ENV="production"
sudo npm install -g webpack
npm run build
node server.js
```
