# contextMenu
自由定制页面元素的右键菜单。

![demo](https://github.com/yuri2peter/contextMenu/blob/master/pre.png?raw=true)

> 是的同类的插件很多，作者造轮子是因为当初寻找右键菜单插件的时候，找了几个都有bug，要么经不起环境的考验，只能跑通demo。如果你也在寻找一款右键菜单插件，不如试试这一款，应该不会让你失望。

## 最新版本
v2.2.5
## 原理
该插件通过指定的参数，渲染出一个漂亮的右键菜单，并绑定菜单项点击事件。

需要的参数有：

1. 右键事件e。指定一个事件e，它可能是通过原生js、jq，甚至vue捕捉的；该插件将获取点击的位置，并阻止事件冒泡，屏蔽默认的右键菜单。
2. 菜单描述数组menu。menu数组决定了你想渲染出什么样的菜单。

## 特色

* 侵入性小，这个插件几乎不会影响全局，除了ContextMenu全局变量。
* 兼容性好，在各个屏幕尺寸和有无滚动条的场景都有不错的渲染效果。
* 支持多层嵌套的DOM触发的事件，以最里层为准（详见demo）。
* 支持二级菜单。

## 准备

1. 下载源码(并点赞)
2. 引入 jquery
3. 引入 contextMenu.css
4. 引入 contextMenu.js

## 典型用法

~~~js
            $('body').contextmenu(function (e) {
                var menu=[
                    'menu1', //合理的html或纯文字
                    'menu2',
                    '|', //分隔符
                    [
                        'click me', //title
                        function (dom) {alert('Hi')} // 点击菜单项的回调
                    ],
                ];
                ContextMenu.render(e,menu,this); //开始渲染
            });
~~~

## API
`ContextMenu.render(e,menu,param,theme)`

**e**:点击事件对象，如`$('body').contextmenu(function (e){})`。

**menu**:

menu为`true`代表禁用系统默认菜单，但是不渲染自定义菜单；

menu为数组表示渲染自定义右键菜单；
~~~js
var menu=[
    '文字1', //纯文字或html将直接被渲染，做为一个提示性菜单项
    '文字2',
    '|', //简单的一个分隔符
    ['功能1',function(param){alert("功能1点击")}], //这种格式说明这个菜单项可以被点击并产生回调
    [
        '子菜单',[
            '文字3',
            '文字4',
            '|',
            ['功能2',function(param){alert("功能2点击")}],
        ]
    ] //声明一个子菜单，子菜单内部的声明格式和父级一样
]
~~~

**param**:菜单点击回调的第一个参数

**theme**:主题（目前可选主题"light"）

## 其他
注意：为了获得正确的屏幕尺寸，添加了一个`html,body:{height:100%}`的样式，请确保该样式生效不被覆盖。

## 更多项目
[Yuri2'Projects](https://github.com/yuri2peter/)

## TOOD

* 右键菜单，二级垂直方向有可能溢出

## 更新记录

* v2.2.5 修复文字溢出（title提示）和子菜单底部溢出
* v2.2.3 优化css
* v2.2.2 新增第三个参数[bool] disable 临时禁用菜单点击功能 `['功能2',function(param){alert("功能2点击")},true]`
* v2.2.1 优化css
* v2.2.0 新增主题切换功能
* v2.1.1 修复了二级菜单溢出屏幕的问题，更好的兼容性