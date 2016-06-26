NthsKeys 作业答案计划 - Node ver.
=========================

[![Join the chat at https://gitter.im/bdbai/nthskeys-node](https://badges.gitter.im/bdbai/nthskeys-node.svg)](https://gitter.im/bdbai/nthskeys-node?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## 目的
[省苏州十中官网](http://nths.cn/News/index.jsp)

某中学每年都把假期作业答案加密压缩并上传至其官网，且没有归类，这给学生带来了很大麻烦。我开启这个项目，目的是通过自动化的方式来简化答案下载、解压、归类这一过程。

## 架构
服务器端使用 Express 为服务框架， MongoDB 为数据库。前端使用 React 和 Bootstrap。

## 构建和运行
### 构建

```bash
npm run-script build
```

### 运行

```bash
# 指定环境变量
export NODE_ENV="development"
export MONGODB_CONNECTION="localhost:27017/nthskeys" # MongoDB 的路径、端口和 collection
export FILE_PATH="/var/data/nthskeys" # 压缩包、解压文档和访问日志目录

# 运行服务器
node server.js
```

