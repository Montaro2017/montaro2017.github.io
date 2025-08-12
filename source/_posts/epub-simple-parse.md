---
title: EPUB文件格式简单解析
tags:
  - EPUB
categories:
  - 技术分享
date: 2025-08-12 14:31:50
---

最近热衷于看轻小说，奈何某些网站样式排版属实糟糕，移动端体验极度不友好，实在无法忍受，于是希望能将网站内容爬取下来制作成EPUB格式的电子书。
抛开爬取网站内容不谈，通过解析EPUB文件后，大致掌握了EPUB文件的基本格式内容。

## EPUB文件结构
EPUB文件本质是一个zip压缩文件。
将EPUB文件后缀改为zip解压即可一窥真相。
使用tree命令查看整个EPUB文件的目录结构和文件，其中部分文件被省略。
```
  mimetype
│
├─META-INF
│      container.xml
│
└─OEBPS
    │  chapter0001.xhtml
    │  chapter0002.xhtml
    │  chapter0003.xhtml
    │  chapter0004.xhtml
    │  chapter0005.xhtml
    │  chapter0006.xhtml
    |  ...
    │  content.opf
    │  toc.ncx
    │
    └─images
            39655.jpg
            39656.jpg
            39657.jpg
			...
```
## 固有文件
- mimetype
- META-INF/container.xml

### mimetype
mimetype是一个文本文件，内容固定为:`application/epub+zip`

### META-INF/container.xml
其中rootfile的属性full-path指定了此书的OPF文件路径。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
```

## OPF
> Open Package Format(OPF)，即包文件格式，其主要功能是用于组织 OPS 文档和提供相应的导航机制，并形成一个开放式的基于 XML 的打包文档，该文档的后缀名为 “.opf” 。

通过`META-INF/container.xml`即可定位到OPF文件。

查看文件内容，可以比较容易猜测每部分的作用。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookId" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="bookId">urn:uuid:9bfb698f-dfa3-45ca-bea4-d0fbc2ead4f3</dc:identifier>
    <dc:language>en</dc:language>
    <dc:title>第一卷 虚伪的王国</dc:title>
    <meta content="cover-image" name="cover"/>
  </metadata>
  <manifest>
    <item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
    <item href="chapter0001.xhtml" id="chapter0001.xhtml" media-type="application/xhtml+xml"/>
    <item href="chapter0002.xhtml" id="chapter0002.xhtml" media-type="application/xhtml+xml"/>
    <item href="chapter0003.xhtml" id="chapter0003.xhtml" media-type="application/xhtml+xml"/>
    <item href="chapter0004.xhtml" id="chapter0004.xhtml" media-type="application/xhtml+xml"/>
    <item href="chapter0005.xhtml" id="chapter0005.xhtml" media-type="application/xhtml+xml"/>
    <item href="chapter0006.xhtml" id="chapter0006.xhtml" media-type="application/xhtml+xml"/>
    ...
    <item href="images/39655.jpg" id="cover-image" media-type="image/jpeg"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter0001.xhtml"/>
    <itemref idref="chapter0002.xhtml"/>
    <itemref idref="chapter0003.xhtml"/>
    <itemref idref="chapter0004.xhtml"/>
    <itemref idref="chapter0005.xhtml"/>
    <itemref idref="chapter0006.xhtml"/>
    ...
  </spine>
</package>
```

### metadata
EPUB文件元数据

#### dc:identifier
书本的唯一标识符，需要和ncx文件中的identifier一致，虽然不一致也没问题。

#### dc:language
书本使用的语言 不是很重要。

#### dc:title
整本书的书名，重要性不言而喻。

#### meta
通过对部分EPUB进行解压，目前只发现设置封面的meta
```xml
<meta content="cover-image" name="cover"/>
```
一般没有需求不更改，如何设置封面查看下文。

### manifest
整本书的清单文件，一般会列出ncx文件和小说正文文件以及封面。
ncx文件是必须的，它定义了书籍的目录，具体格式查看下文。
封面是可选的，不过EPUB没有封面和插图就没有灵魂。

#### item
清单文件项目。
- href 文件的相对路径
- id 项目ID
- media-type 文件的MIME类型

**正文网页文件**
一般格式都为XHTML，可以使用样式图片音频各种各样的资源。

**指定封面图片**
- metadata中包含`name`为cover的`meta`标签
`<meta content="cover-image" name="cover"/>`
- manifest中包含id为上述meta的content属性的item
- 通过设置item的`href`即可指定封面路径 
`<item href="images/39655.jpg" id="cover-image" media-type="image/jpeg"/>`

### spine
翻译成中文就是书脊，通过引用的顺序来指定阅读顺序。
例如上文文件依次列出了chapter0001、chapter0002等，阅读完chapter0001就会开始阅读chapter0002。

#### itemref
引用的manifest中的文件，只需要引入正文网页文件。
- idref 需要与manifest中itme的id对应 代表此文件
- linear 表明该项是作为线性阅读顺序中的一项，与先后顺序无关，默认为yes

## NCX
NCX是Navigation Content eXtended的缩写，用于表示本书的目录。
```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/">
  <head>
    <meta content="urn:uuid:9bfb698f-dfa3-45ca-bea4-d0fbc2ead4f3" name="dtb:uid"/>
    <meta content="1" name="dtb:depth"/>
    <meta content="0" name="dtb:totalPageCount"/>
    <meta content="0" name="dtb:maxPageNumber"/>
  </head>
  <docTitle>
    <text>第一卷</text>
  </docTitle>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel>
        <text>插图</text>
      </navLabel>
      <content src="chapter0001.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-2" playOrder="2">
      <navLabel>
        <text>序章</text>
      </navLabel>
      <content src="chapter0002.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-3" playOrder="3">
      <navLabel>
        <text>第一章 前世</text>
      </navLabel>
      <content src="chapter0003.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-4" playOrder="4">
      <navLabel>
        <text>第二章 异世界</text>
      </navLabel>
      <content src="chapter0004.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-5" playOrder="5">
      <navLabel>
        <text>第三章 冤罪</text>
      </navLabel>
      <content src="chapter0005.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-6" playOrder="6">
      <navLabel>
        <text>第四章 入学王立学院</text>
      </navLabel>
      <content src="chapter0006.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-7" playOrder="7">
      <navLabel>
        <text>第五章 五年后</text>
      </navLabel>
      <content src="chapter0007.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-8" playOrder="8">
      <navLabel>
        <text>第六章 野外演习</text>
      </navLabel>
      <content src="chapter0008.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-9" playOrder="9">
      <navLabel>
        <text>第七章 虚伪的真相</text>
      </navLabel>
      <content src="chapter0009.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-10" playOrder="10">
      <navLabel>
        <text>末章</text>
      </navLabel>
      <content src="chapter0010.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-11" playOrder="11">
      <navLabel>
        <text>后记</text>
      </navLabel>
      <content src="chapter0011.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-12" playOrder="12">
      <navLabel>
        <text>特典 淑女空腹状态</text>
      </navLabel>
      <content src="chapter0012.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-13" playOrder="13">
      <navLabel>
        <text>特典 雾雨茫茫相思相爱伞</text>
      </navLabel>
      <content src="chapter0013.xhtml"/>
    </navPoint>
    <navPoint id="navPoint-14" playOrder="14">
      <navLabel>
        <text>特典 贵族千金们的茶会</text>
      </navLabel>
      <content src="chapter0014.xhtml"/>
    </navPoint>
  </navMap>
</ncx>
```

### meta

#### dtb:uid
`<meta content="urn:uuid:9bfb698f-dfa3-45ca-bea4-d0fbc2ead4f3" name="dtb:uid"/>`
这个和opf中的dc:identifier应该保持一致，不一致倒也没什么问题。

#### depth、totalPageCount和maxPageNumber
```xml
<meta content="1" name="dtb:depth"/>
<meta content="0" name="dtb:totalPageCount"/>
<meta content="0" name="dtb:maxPageNumber"/>
```
对于电子书不需要进行修改，使用这几个值就OK。

### docTitle
```xml
<docTitle>
  <text>第一卷</text>
</docTitle>
```
姑且认为应该与opf中的dc:title一致，书名以opf中的为准。

### navPoint
```xml
<navPoint id="navPoint-1" playOrder="1">
  <navLabel>
    <text>插图</text>
  </navLabel>
  <content src="chapter0001.xhtml"/>
</navPoint>
```
整书的目录，每个navPoint代表目录中的一项，包含标题和文件路径。


一个EPUB有以上这些文件就能被识别，通过创建文件然后压缩就可以完成一个EPUB文件的创建。

## 完成的项目

最后提一下开头的项目: [bili_novel_packer](https://github.com/Montaro2017/bili_novel_packer)