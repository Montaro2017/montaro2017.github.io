---
title: ElasticSearch、Kibana的安装
toc: true
tags:
  - elasticsearch
categories:
  - ElasticSearch
date: 2025-08-28 14:18:10
---


## 背景

因工作需要，需搭建一个elasticsearch环境，并向其中导入数据库数据，然后编写程序从ES中查询数据。

这里就先写es的环境安装，后续摸索出来了再写。

## 下载ElasticSearch

Github： [elasticsearch](https://github.com/elastic/elasticsearch)

![ES Github](es-github.png)

ES项目主页看到的最新版本是8.19.2，但是在release页面看最新版本是9.1.2，我这里选择8.18.1，原因是目前Spring Date ElasticSearch最多支持到8.18.1。

![ES Github Release](es-release.png)

Release这里没有直接文件下载，需要点击说明文字的链接进去下载，默认下载的版本是9.1.2，这里点击右边的View past release下载其他版本。

![ES下载页面](download-es.png)

选版本下载就行了。

![选择版本下载](es-version-download.png)

## 安装分词器

下载完了还要安装中文的分词器：[analysis-ik](https://github.com/infinilabs/analysis-ik)

项目主页有安装说明。

![IK分词器安装](ik-install.png)


先把之前下载的es解压了，进入bin目录，输入指令：

```shell
elasticsearch-plugin install https://get.infini.cloud/elasticsearch/analysis-ik/8.18.1
```

虽然项目主页给的命令行是8.4.1版本，但是如果和es版本不匹配，是安装不上的，而且analysis-ik有8.18.1版本，只是没有更新Github了。

如果新版没有，就只能降es版本。

## 启动es

和之前一样，进入bin目录，执行，注意不要用root账号运行。

```shell
elasticsearch -d
```

-d是后台模式，不需要可以去掉。

由于还没有修改配置，需要使用https访问。

访问 https://localhost:9200 提示需要密码。

默认的用户名是`elastic`，密码需要重置，
进入bin目录，执行`elasticsearch-reset-password -u elastic -i`重置密码。

设定好密码后登录，可以正常访问。

![es信息](es-9200.png)

## 修改配置

找到配置文件进行编辑: `config/elasticsearch.yml`

由于之前运行了一次es，自动生成了一些配置，把生成的配置删除，使用下面的配置:

```yaml
network.host: 0.0.0.0
discovery.type: single-node
xpack.security.enabled: true
xpack.security.http.ssl.enabled: false
xpack.security.enrollment.enabled: true
xpack.license.self_generated.type: basic
xpack.security.transport.ssl.enabled: false
```

然后重启es，`elasticsearch -d`。

由于更改了配置，禁用了https，所以需要访问 http://localhost:9200。

## 安装kibana

如果说es像数据库，那么kibana就像是数据库管理工具。

[下载kibana](https://www.elastic.co/downloads/past-releases#kibana)

这里选择和es一样的版本8.18.1。

下载解压后需要修改配置文件： config/kibana.yaml

找到图上的配置，把注释打开，然后修改es地址以及用户名和密码，我这里使用了默认的kibana_system用户，在elasticsearch中重置了密码。

![Kibana配置文件](kibana-config.png)

如果需要中文，可以修改

```yaml
i18n.locale: "zh-CN"
```

同样的，进入bin目录，启动kibana。

启动后访问： http://localhost:5601

需要输入账号密码，用es的elastic账号和密码登录。

> kibana登录使用的是elasticsearch的账号和密码。

## 分词器使用

前面安装了analysis_ik分词器，可以试着调用一下看看效果。

进入kibana首页，找到开发工具。

![kibana首页](kibana-1.png)

![kibana菜单](kibana-2.png)

在左侧输入，然后点击执行

```
GET _analyze
{
  "analyzer": "ik_smart",
  "text": "elasticsearch IK分词器的安装、使用与扩展原创"
}
```

![使用分词器](kibana-3.png)


右侧就出现了分词的结果。

![分词结果](kibana-4.png)