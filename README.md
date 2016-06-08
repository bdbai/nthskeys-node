NthsKeys 作业答案计划 - Node ver.
=========================

## 目的
[省苏州十中官网](http://nths.cn/News/index.jsp)

某中学每年都把假期作业答案加密压缩并上传至其官网，且没有归类，这给学生带来了很大麻烦。我开启这个项目，目的是通过自动化的方式来简化答案下载、解压、归类这一过程。

## 内容

### `DataModel`

Entity Framework (Code First) 结构化数据模型。数据库使用 MySQL。

### `KeyCrawler`

爬虫，用于爬取所有答案存档，并自动下载、存档。

### `Uncompress`

调用 7z 解压并自动归类的类库。

### `PasswordEntrance`

收集密码并进行解压的 GUI。