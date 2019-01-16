window.YL = {
  info: {
    softwareName: 'YLUI',
    version: window.yluiVersion,
    iconBtnStart: 'yoast',
    author: 'Yuri2',
    contactInformation: 'yuri2peter@qq.com',
    officialWebsite: 'https://ylui.yuri2.cn',
    copyrightDetail: 'YLUI已授权本产品使用。YLUI禁止任何未经作者授权的使用、修改、二次发布，包括从本产品中剥离YLUI独立使用等侵权行为，违者将追究法律责任。',
    otherStatements: '',
  },
  data: {},
  lang: function (key) {
    return YL.static.languages[YL.static.lang] ? YL.static.languages[YL.static.lang][key] : '';
  },
  readyStack: [],
  loadStack: [],
  _baseData: function () {
    return {
      // YL:YL,
      configs: {
        topTaskBar: true, //顶部任务栏？默认底部
        sound: false,//开启声音
        wallpaper: './res/img/wallpapers/bg1.jpg',
        wallpaperBlur: false, //壁纸模糊（影响性能）
        wallpaperSlide: false, //壁纸幻灯片
        wallpaperSlideRandom: false, //壁纸幻灯片顺序随机（否则顺序播放）
        wallpaperSlideItv: 0.1, //壁纸幻灯片播放切换间隔（单位：分钟）
        wallpaperSlideTime: Date.now(), //记录最近一次切换壁纸的时刻
        wallpaperSlideIndex: 0, //记录最近一次切换壁纸的index
        openMax: 9,//最多开启N个app
        idCounter: 0,//ID的下标起始
        themeColor: "black",
        autoThemeColor: true,
        wallpapers: [],
      },
      runtime: {
        ready: false,
        clientSize: {
          width: 0,
          height: 0,
        },
        desktopSize: {
          width: 0,
          height: 0,
        },
        startMenu: {
          width: 0,
          height: 0,
          drag: {
            x: 0,
            y: 0,
            mDown: false,
          }
        },
        isSmallScreen: false,
        isHorizontalScreen: true,
        lang: 'zh-cn',
        winActive: null, //激活的窗口号
        winActiveTime: Date.now(), //上一次激活的时间戳（惰性检查）
        drag: false, //窗口拖拽中
        time: '', //时钟
        winOpenCounter: 0, //总计窗口数
        winOpened: 0, //目前打开的窗口数
        data: {}, //数据
        shortcutsShow: true,//图标刷新动画辅助
        pluginIconsOpen: false,//插件小图标打开/关闭
        CalendarOpen: false,//日历打开/关闭
        tileSize: 0,//磁贴的尺寸（动态计算）
        tilesWidth: 0,//磁贴框的尺寸（动态计算）
        tilesGroupNum: 1,//磁贴框每一行最多几个组（计算得出）
        wallpaper: '',
        wallpaperScale: 1, //壁纸宽高比
        shortcutNewParamName: "",//图标的新参数input name
        shortcutNewParamValue: "",//图标的新参数input val
        isIE: false,//是否IE,
        menuItemCut: null,//菜单项的剪切板
        tileMoved: false, //记录磁贴移动状态，防止移动触发点击
        customTileRandomToken: YL.util.randInt(1000, 9999),//自定义磁贴iframe的随机token
        shortcutsGrid: { x: 0, y: 0 },//桌面图标网格的宽高(int)
        shortcutInsert: null,//即将插入在前的图标（视觉效果）
        shortcutOver: null,//即将拖动覆盖的图标（视觉效果）
        menuOnLeft: true,//移动端：菜单在左（反之在右）
        shortcutWidth: 0,//移动端响应式的图标尺寸
        shortcutHeight: 0,//移动端响应式的图标尺寸
        shortcutOpenedAt: Date.now(),
      },
      appStore: [],
      apps: {},
      shortcuts: [],
      tiles: [],
      startMenu: { //开始菜单
        open: false,
        width: 800,
        height: 600,
        sidebar: {
          open: false,
          btns: [],
        },
        menu: {}
      },
      center: {
        open: false,
        unread: 0,
        msgNum: 0,
        msg: {}
      },
      wins: {},
      msgPres: {},
      drawer: null,
      shortSetting: null,
    };
  },
  init: function (data) {
    //数据处理
    data = data ? data : (localStorage.getItem(YL.static.localStorageName) ? (JSON.parse(localStorage.getItem(YL.static.localStorageName))) : this._baseData());
    data = YL.format(data);
    $("#loading").remove();
    YL.render(data);
    //ready调用
    this.readyStack.forEach(function (t) {
      t();
    })
  },
  reset: function () {
    //清空vue数据
    var data = this._baseData();
    var vue = YL.vue;
    for (var i in data) {
      if (i !== 'apps') {
        vue.$set(vue, i, data[i]);
      }
    }
    vue.$set(vue, 'apps', {});
  },
  msg: function (title, content) {
    var options = {
      title: title,
      content: content,
      key: Math.random(),
    };
    this.vue.setWithID(this.vue.center.msg, options, 'msg-');
    this.vue.center.open || this.vue.center.unread++; //未读标记+1
    this.vue.center.msgNum++; //总数+1
    var indexs = {};
    for (var i in this.vue.msgPres) {
      var msg = this.vue.msgPres[i];
      if (msg) {
        var ind = msg.index;
        indexs[ind] = true;
      }
    }
    for (var j = 0; j < 99; j++) {
      if (!indexs[j]) {
        break;
      }
    }
    var msgPreID = this.vue.setWithID(this.vue.msgPres, Yuri2.jsonMerge(options, {
      index: j,
    }), 'msgPre-');
    setTimeout(function () {
      var vue = YL.vue;
      vue.msgPres[msgPreID] = null;
    }, 5000);
  },
  open: function (appId, options) {
    //临时打开的窗口（添加临时app）
    if (typeof appId === 'object') {
      appId = Yuri2.jsonMerge(this.util.getAppDataTemplate(), appId);
    }
    return this.vue.appOpen(appId, options);
  },
  aboutUs: function () {
    //关于我们
    this.open('yl-system', {
      data: { nav: "aboutUs" }
    });
  },
  uninstall: function (appId) {

    if (Yuri2.inArray(YL.static.lockedApps, appId)) {
      this.util.simpleMsg(YL.lang("UninstallFailed") + YL.lang("AppLockedCanNotChange"));
      return false;
    }

    //卸载应用
    var v = this.vue;

    //删除依赖图标
    for (var i = v.shortcuts.length - 1; i >= 0; i--) {
      var s = v.shortcuts[i];
      if (s.children) {
        for (var j = s.children.length - 1; j >= 0; j--) {
          var ss = s.children[j];
          if (ss.app === appId) {
            s.children.splice(j, 1)
          }
        }
      } else {
        if (s.app === appId) {
          v.shortcuts.splice(i, 1)
        }
      }
    }

    //递归删除依赖菜单
    var menuItemAppUninstall = function (father) {
      var menu = father ? father.children : v.startMenu.menu;
      for (var i in menu) {
        var item = menu[i];
        if (item.app === appId) {
          v.$delete(menu, i)
        }
        if (item.children) {
          menuItemAppUninstall(item);
        }
      }
    };
    menuItemAppUninstall();

    //删除开始侧边栏依赖
    for (var i = v.startMenu.sidebar.btns.length - 1; i >= 0; i--) {
      var t = v.startMenu.sidebar.btns[i];
      if (t.app === appId) {
        v.startMenu.sidebar.btns.splice(i, 1);
      }
    }

    //删除磁贴依赖
    v.tiles.forEach(function (group) {
      for (var i = group.data.length - 1; i >= 0; i--) {
        var t = group.data[i];
        if (t.app === appId) {
          group.data.splice(i, 1);
        }
      }
    });

    //删除app
    v.$delete(v.apps, appId);

    return true;
  },
  addApp: function (appId, data) {
    if (Yuri2.inArray(YL.static.lockedApps, appId)) {
      this.util.simpleMsg(YL.lang("AddAppFailed") + YL.lang("AppLockedCanNotChange"));
      return false;
    }
    var app = this.util.getAppDataTemplate();
    app = Yuri2.jsonMerge(app, data);
    app.url = YL.util.removeUrlRandomToken(app.url);
    this.vue.$set(this.vue.apps, appId, app);
    return true;
  },
  addShortcut: function (appId) {
    var that = this.vue;
    var s = {
      app: '',
      title: '',
      params: {},
      hash: '',
      drag: {
        mDown: false,
        left: 0,
        top: 0,
      },
    };
    if (typeof appId === 'string') {
      var app = that.apps[appId];
      s = Yuri2.jsonMerge(s, {
        app: appId,
        title: app.title,
      });
    } else {
      s = Yuri2.jsonMerge(s, appId);
    }
    that.shortcuts.push(s);
  },
  addMenuItem: function (appId) {
    var that = this.vue;
    var item = {
      app: '',
      title: '',
      params: {},
      hash: '',
    };
    if (typeof appId === 'string') {
      var app = that.apps[appId];
      item = Yuri2.jsonMerge(item, {
        app: appId,
        title: app.title,
      });
    } else {
      item = Yuri2.jsonMerge(item, appId);
    }
    that.setWithID(that.startMenu.menu, item, 'itemPushed-');
  },
  addSidebarBtn: function (appId) {
    var that = this.vue;
    var btn = {
      app: '',
      title: '',
      params: {},
      hash: '',
    };
    if (typeof appId === 'string') {
      var app = that.apps[appId];
      btn = Yuri2.jsonMerge(btn, {
        app: appId,
        title: app.title,
      });
    } else {
      btn = Yuri2.jsonMerge(btn, appId);
    }
    that.startMenu.sidebar.btns.unshift(btn);
  },
  addTile: function (appId, n) {
    var that = this.vue;
    if (!n) n = 0;
    //为app添加磁贴
    var v = this.vue;
    if (v.tiles.length <= 0) {
      this.addTileGroup();
    }
    var tile = {
      "x": 0, "y": 99, "w": 2, "h": 2,
      app: "",
      title: "",
      i: YL.util.getID() + "",
      params: {},
      hash: '',
    };
    if (typeof appId === 'string') {
      var app = that.apps[appId];
      tile = Yuri2.jsonMerge(tile, {
        app: appId,
        title: app.title,
      });
    } else {
      tile = Yuri2.jsonMerge(tile, appId);
    }
    v.tiles[n].data.push(tile)
  },
  addTileGroup: function (groupTitle) {
    var v = this.vue;
    var title = groupTitle ? groupTitle : YL.util.getID();
    v.tiles.push({ title: '分组' + title, data: [] });
    return v.tiles.length - 1;
  },
  setThemeColor: function (color) {
    this.vue.configs.themeColor = color;
  },
  debug: function (log) {
    !YL.static.debug || console.log(log);
  },
  onLoad: function (cb) {
    this.loadStack.push(cb);
  },
  onReady: function (cb) {
    this.readyStack.push(cb);
  },
  loadRes: function () {
    //资源加载
    var that = this;
    var pathRes = './res';
    var counterLoad = 0, maxLoad = 24; //资源加载计数器
    var onLoading = "...";


    //加载提示框
    document.getElementById('loading-box').style.display = 'block';
    document.getElementById('loading-software-name').innerHTML = YL.static.softwareName;
    document.getElementById('loading-lang-init').innerHTML = YL.lang("LoadingInitializing");
    document.getElementById('loading-powered-by').innerHTML = YL.lang("LoadingPoweredBy");
    document.title = YL.static.softwareName;
    var flagFifty = false;//解决圆环动画断裂
    var itvLoading = setInterval(function () {
      var percent = parseInt(counterLoad / maxLoad * 100);
      document.getElementById('on-load-file-name').innerHTML = YL.static.debug ? onLoading : YL.lang("LoadingStandby");
      document.getElementById('text-percent').innerHTML = percent + "%";

      //loading动画
      var deg = percent * 3.6;
      var degRight = deg - 180;
      if (degRight > 0) {
        degRight = 0
      }
      if (!flagFifty && percent >= 50) {
        setTimeout(function () {
          flagFifty = true;
        }, 500)
      }
      var degLeft = deg - 360;
      if (degLeft < -180) {
        degLeft = -180
      }
      if (flagFifty) document.getElementById('loading-left').style.transform = 'rotate(' + degLeft + 'deg)';
      document.getElementById('loading-right').style.transform = 'rotate(' + degRight + 'deg)';
    }, 200);

    /**  加载资源 */
    const versionTail = "?v=" + YL.info.version;
    //jq
    YL.util.loadScript(pathRes + '/components/jquery-2.2.4.min.js', function () {
      onLoading = 'jquery-2.2.4.min.js';
      counterLoad++;

      //contextMenu
      YL.util.loadScript(pathRes + '/components/contextMenu/contextMenu.js' + versionTail, function () {
        onLoading = 'contextMenu.js';
        counterLoad++;
      });
      YL.util.loadStyle(pathRes + '/components/contextMenu/contextMenu.css' + versionTail, function () {
        onLoading = 'contextMenu.css';
        counterLoad++;
      });
      YL.util.loadScript(pathRes + '/components/jquery.nicescroll.min.js', function () {
        onLoading = 'jquery.nicescroll.min.js';
        counterLoad++;
      });
      YL.util.loadScript(pathRes + '/components/layer-v3.0.3/layer/layer.full.js', function () {
        onLoading = 'layer.full.js';
        counterLoad++;
      });
    });
    YL.util.loadStyle(pathRes + '/css/main.css' + versionTail, function () {
      onLoading = 'main.css';
      counterLoad++;
    });
    YL.util.loadStyle(pathRes + '/css/yl-layer-skin.css' + versionTail, function () {
      onLoading = 'yl-layer-skin.css';
      counterLoad++;
    });
    YL.util.loadStyle(pathRes + '/components/layer-v3.0.3/layer/skin/default/layer.css' + versionTail, function () {
      onLoading = 'layer.css';
      counterLoad++;
    });
    YL.util.loadStyle(pathRes + '/css/tiles.css' + versionTail, function () {
      onLoading = 'tiles.css';
      counterLoad++;
    });
    YL.util.loadStyle(pathRes + '/components/animate.css' + versionTail, function () {
      onLoading = 'animate.css';
      counterLoad++;
    });
    YL.util.loadScript(pathRes + '/js/Yuri2.js' + versionTail, function () {
      onLoading = 'Yuri2.js';
      counterLoad++;
    });
    YL.util.loadStyle(pathRes + '/components/font-awesome-4.7.0/css/font-awesome.min.css', function () {
      onLoading = 'font-awesome.min.css';
      counterLoad++;
    });
    YL.util.loadPrefetch(pathRes + '/components/font-awesome-4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0', function () {
      onLoading = 'fontawesome-webfont.woff2';
      counterLoad++;
    });
    YL.util.loadPrefetch(pathRes + '/apps/element-ui/fonts/element-icons.woff?t=1510834658947', function () {
      onLoading = 'element-icons.woff';
      counterLoad++;
    });
    YL.util.loadPrefetch(pathRes + '/apps/element-ui/index.css', function () {
      onLoading = 'element-index.css';
      counterLoad++;
    });
    YL.util.loadPrefetch(pathRes + '/apps/element-ui/index.js', function () {
      onLoading = 'element-index.js';
      counterLoad++;
    });
    YL.util.loadScript(pathRes + '/components/vue.min.js', function () {
      onLoading = 'vue.min.js';
      counterLoad++;

      YL.util.loadScript(pathRes + '/components/vue-grid-layout-2.1.11.min.js', function () {
        onLoading = 'vue-grid-layout.min.js';
        counterLoad++;
      });
      YL.util.loadScript(pathRes + '/js/yl-vue-component-icon.js' + versionTail, function () {
        onLoading = 'yl-vue-component-icon.js';
        counterLoad++;
      });
      YL.util.loadScript(pathRes + '/js/yl-vue-components.js' + versionTail, function () {
        onLoading = 'yl-vue-components.js';
        counterLoad++;
      });

    });
    YL.util.loadScript(pathRes + '/js/yl-render.js' + versionTail, function () {
      onLoading = 'yl-render';
      counterLoad++;
    });
    YL.util.loadScript(pathRes + '/js/yl-io.js' + versionTail, function () {
      onLoading = 'yl-io';
      counterLoad++;
    });
    YL.util.loadScript(pathRes + '/components/calendar/script.js' + versionTail, function () {
      onLoading = 'calendar.script';
      counterLoad++;
    });
    YL.util.loadStyle(pathRes + '/components/calendar/style.css' + versionTail, function () {
      onLoading = 'calendar.style';
      counterLoad++;
    });

    /**  /加载资源 */
    var loadAt = Date.now();
    var itvLoader = setInterval(function () {
      var isFastLoad = Date.now() - loadAt < 500;
      if (!isFastLoad) document.getElementById("loading").style.opacity = 1;
      if (counterLoad === maxLoad) {
        clearInterval(itvLoader);
        onLoading = 'Complete';
        setTimeout(function () {
          //执行onload
          clearInterval(itvLoading);
          that.loadStack.forEach(function (t) {
            t();
          });
          $("#loading").remove()
        }, isFastLoad ? 0 : 1000);
      }
    }, 100)

  },
  f5: function () {
    YL.static.beforeOnloadEnable = false;
    location.reload();
  },
  setWallpaper: function (urlImg) {
    this.vue.configs.wallpaper = urlImg;
  },
  util: {
    isSet: function (val) {
      return typeof val !== 'undefined'
    },
    isTrustedApp: function (appId) {
      return Yuri2.inArray(YL.static.trustedApps, appId);
    },
    simpleMsg: function (msg) {
      !layer || layer.msg(msg, { zIndex: 19930012 })
    },
    simpleConfirm: function (msg, cb) {
      var cfm = layer.confirm(msg, { skin: "yl", zIndex: 19930010 }, function () {
        layer.close(cfm);
        cb();
      });
    },
    onloadSafe: function (handle) {
      var old = window.onload;
      if (typeof old === 'function') {
        window.onload = function () {
          old();
          handle();
        }
      } else {
        window.onload = handle;
      }
    },
    loadScript: function (url, callback) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      if (typeof(callback) !== "undefined") {
        if (script.readyState) {
          script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
              script.onreadystatechange = null;
              callback(script);
            }
          };
        } else {
          script.onload = function () {
            callback(script);
          };
        }
      }
      script.src = url;
      document.head.appendChild(script);
    },
    loadStyle: function (url, callback) {
      var style = document.createElement("link");
      style.type = "text/css";
      style.rel = "stylesheet";
      style.href = url;
      if (typeof(callback) !== "undefined") {
        if (style.readyState) {
          style.onreadystatechange = function () {
            if (style.readyState === "loaded" || script.readyState === "complete") {
              style.onreadystatechange = null;
              callback(style);
            }
          };
        } else {
          style.onload = function () {
            callback(style);
          };
        }
      }
      document.head.appendChild(style);
    },
    loadContentFromUrl: function (url, method, callback, noCache) {
      if (noCache === undefined) noCache = true;
      var xmlhttp;
      if (!method) {
        method = 'GET';
      }
      try {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (e) {
        try {
          xmlhttp = new XMLHttpRequest();
        } catch (e) {
          return null;
        }
      }
      xmlhttp.open(method, url);
      if (noCache) {
        xmlhttp.setRequestHeader('Cache-Control', 'max-age=0');
      }
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4) {
          if (xmlhttp.status === 200) {
            callback(null, xmlhttp.responseText);
          } else {
            callback(xmlhttp.status, xmlhttp.responseText);
          }
        }
      };
      try {
        xmlhttp.send(null);
      } catch (e) {
        callback(e, '');
      }
    },
    loadPrefetch: function (url, callback) {
      //预读资源
      var link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      var called = false;
      var call = function () {
        if (!called) {
          called = true;
          callback(link);
        }
      };
      if (typeof(callback) !== "undefined") {
        if (link.readyState) {
          link.onreadystatechange = function () {
            if (link.readyState === "loaded" || link.readyState === "complete") {
              link.onreadystatechange = null;
              call();
            }
          };
        } else {
          link.onload = function () {
            call();
          };
        }
      }
      setTimeout(function () {
        call();
      }, 1000);

      document.head.appendChild(link);
    },
    getID: function () {
      return (window.YL.vue.configs.idCounter++) + "";
    },
    getRandomColor: function () {
      var r = Yuri2.randInt(0, 200);
      var g = Yuri2.randInt(0, 200);
      var b = Yuri2.randInt(0, 200);
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    },
    dataCopy: function (name) {
      //从vue的data中获得对象的深拷贝
      var data = name ? YL.vue.$data[name] : YL.vue.$data;
      return Yuri2.jsonDeepCopy(data);
    },
    getAppDataTemplate: function () {
      return {
        addressBar: false,
        autoRun: 0,
        background: false,
        badge: 0,
        desc: '',
        icon: {
          type: "fa",
          content: "wpforms",
          bg: YL.util.getRandomColor(),
        },
        openMode: "normal",
        plugin: false,
        position: {
          autoOffset: true,
          left: true,
          top: true,
          x: "x*0.05",
          y: "y*0.05",
        },
        version: "1.0.0",
        poweredBy: "",
        resizable: true,
        single: false,
        size: {
          height: "y*0.8-80",
          width: "x*0.8",
        },
        title: '',
        url: "",
        customTile: "",
        urlRandomToken: true,
      };
    },
    getAppByWinId: function (winId) {
      var app = YL.vue.wins[winId].app;
      if (typeof app === 'string') {
        app = YL.vue.apps[app];
      }
      return app;
    },
    _winZIndexMax: 0,
    getBiggerWinZIndex: function () {
      this._winZIndexMax++;
      return this._winZIndexMax;
    },
    setWinZIndexMax: function (index) {
      this._winZIndexMax = index;
    },
    strTofunction: function (str) {
      //讲指定格式字符串转化为fn ，如果 function(){}
      return eval("(" + str + ")");
    },
    iframeOnClick: {
      resolution: 200,
      iframes: [],
      interval: null,
      Iframe: function () {
        this.element = arguments[0];
        this.cb = arguments[1];
        this.hasTracked = false;
        this.id = arguments[2];
      },
      track: function (element, cb, id) {
        this.iframes.push(new this.Iframe(element, cb, id));
        if (!this.interval) {
          var _this = this;
          this.interval = setInterval(function () {
            _this.checkClick();
          }, this.resolution);
        }
      },
      checkClick: function () {
        if (document.activeElement) {
          var activeElement = document.activeElement;
          for (var i in this.iframes) {
            var eid = this.iframes[i].id;
            if (!document.getElementById(eid)) {
              delete this.iframes[i];
              continue;
            }
            if (activeElement === this.iframes[i].element) { // user is in this Iframe
              if (this.iframes[i].hasTracked === false) {
                this.iframes[i].cb.apply(window, []);
                this.iframes[i].hasTracked = true;
              }
            } else {
              this.iframes[i].hasTracked = false;
            }
          }
        }
      }
    },
    _iframe_click_lock_children: {},
    imgUrlToThemeColor: function (url, cb, light) {
      //图片url获取主题色
      if (!light) {
        light = 1.0
      }
      var img = new Image;
      img.src = url;
      img.crossOrigin = 'anonymous';//跨域声明（只在chrome和firefox有效——吗？）
      img.onload = function () {
        try {
          var canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          var ctxt = canvas.getContext('2d');
          ctxt.drawImage(img, 0, 0);
          var data = ctxt.getImageData(0, 0, img.width, img.height).data;//读取整张图片的像素。
          var r = 0, g = 0, b = 0, a = 0;
          var red, green, blue, alpha;
          var pixel = img.width * img.height;
          for (var i = 0, len = data.length; i < len; i += 4) {
            red = data[i];
            r += red;//红色色深
            green = data[i + 1];
            g += green;//绿色色深
            blue = data[i + 2];
            b += blue;//蓝色色深
            alpha = data[i + 3];
            a += alpha;//透明度
          }
          r = parseInt(r / pixel * light);
          g = parseInt(g / pixel * light);
          b = parseInt(b / pixel * light);
          a = 1;//a/pixel/255;
          var color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
          if (cb) {
            cb(color);
          }
        } catch (e) {
          console.warn(e)
        }
      };
    },
    imgUrlToSize: function (url, cb) {
      var img = new Image;
      img.src = url;
      img.onload = function () {
        if (cb) {
          cb({
            width: img.width,
            height: img.height,
          });
        }
      };
    },
    randInt: function (n, m) {
      return Math.floor(Math.random() * (m - n + 1) + n);
    },
    getFileUrl: function (sourceId) {
      //sourceId是input:file的id
      var url;
      if (navigator.userAgent.indexOf("MSIE") >= 1) { // IE
        url = document.getElementById(sourceId).value;
      } else if (navigator.userAgent.indexOf("Firefox") > 0) { // Firefox
        url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0));
      } else if (navigator.userAgent.indexOf("Chrome") > 0) { // Chrome
        url = window.URL.createObjectURL(document.getElementById(sourceId).files.item(0));
      }
      return url;
    },
    getBase64Image: function (img) {
      var canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
      var dataURL = canvas.toDataURL("image/" + ext);
      return dataURL;
    },
    enableFullScreen: function () {
      var docElm = document.documentElement;
      //W3C
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      }
      //FireFox
      else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      }
      //Chrome等
      else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      }
      //IE11
      else if (docElm.msRequestFullscreen) {
        document.body.msRequestFullscreen();
      }
    },
    disableFullScreen: function () {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    },
    updateUrlRandomToken: function (url, tokenName, token) {
      tokenName || (tokenName = 'ylrandomToken');
      var params = {};
      params[tokenName] = token ? token : this.randInt(1000, 9999);
      return this.urlParams(url, params)
    },
    removeUrlRandomToken: function (url, tokenName) {
      tokenName || (tokenName = 'ylrandomToken');

      var p = Yuri2.parseURL(url);
      var strParams = '?';
      var paramLen = 0;
      for (var i in p.params) {
        if (i !== tokenName) {
          paramLen++;
          strParams += (i + '=' + p.params[i] + "&");
        }
      }
      if (!paramLen) {
        strParams = ""
      }
      return p.protocol + "://" + p.host + (p.port === 80 ? '' : ':' + p.port) + p.path + strParams + (p.hash ? "#" + p.hash : "");
    },
    artificiallyResize: function () {
      var e = document.createEvent("Event");
      e.initEvent("resize", true, true);
      window.dispatchEvent(e);
    },
    urlParams: function (url, params, hash) {
      //改变url的参数
      var p = Yuri2.parseURL(url);
      if (params) {
        p.params = Yuri2.jsonMerge(p.params, params);
      }
      if (hash) {
        p.hash = hash;
      }
      var strParams = '?';
      var paramLen = 0;
      for (var i in p.params) {
        paramLen++;
        strParams += (i + '=' + p.params[i] + "&");
      }
      if (!paramLen) {
        strParams = ""
      }
      return p.protocol + "://" + p.host + ((p.port === 80 || !p.port) ? '' : ':' + p.port) + p.path + strParams + (p.hash ? "#" + p.hash : "");
    },
    getStrFa: function (content, withSpace) {
      if (typeof withSpace === "undefined") {
        withSpace = true;
      }
      return "<i class='fa fa-fw fa-" + content + "'></i>" + (withSpace ? ' ' : '');
    },
    hasApp: function (item) {
      var id = "";
      if (typeof item === 'string') {
        id = item;
      } else {
        id = item.app;
      }
      return this.isSet(YL.vue.apps[id]);
    }
  },
  child: {
    //用于被子窗口调用的函数
    getID: function () {
      return YL.util.getID();
    },
    getVersion: function () {
      return YL.info.version;
    },
    refresh: function (id, idSelf) {
      id = id || idSelf;
      YL.vue.winRefresh(id);
    },
    setWinData: function (data, id) {
      //设置窗口的某参数
      var v = YL.vue;
      if (!v.wins[id]) {
        return;
      }
      for (var i in data) {
        v.$set(v.wins[id], i, data[i]);
      }
    },
    getRuntime: function () {
      var v = YL.vue;
      return v.runtime;
    },
    getConfigs: function () {
      var v = YL.vue;
      return v.configs;
    },
    getWinData: function (params, id) {
      var win = YL.vue.wins[id];
      return win ? Yuri2.jsonDeepCopy(win) : null;
    },
    setWallpaper: function (urlImg, id) {
      return YL.setWallpaper(urlImg);
    },
    setThemeColor: function (color, id) {
      return YL.setThemeColor(color);
    },
    open: function (data, id) {
      return Yuri2.isArray(data) ? YL.open(data[0], data[1]) : YL.open(data);
    },
    close: function (params, id) {
      YL.vue.winClose(params ? params : id);
    },
    minimize: function (params, id) {
      YL.vue.winMinimize(params ? params : id);
    },
    maximize: function (params, id) {
      YL.vue.winMaximize(params ? params : id);
    },
    hide: function (params, id) {
      YL.vue.winMinimize(params ? params : id);
    },
    show: function (params, id) {
      YL.vue.winShow(params ? params : id);
      YL.vue.winSetActive(params ? params : id);
    },
    restore: function (params, id) {
      YL.vue.winRestore(params ? params : id);
    },
    msg: function (data) {
      YL.msg(data[0], data[1]);
    },
    simpleMsg: function (data) {
      YL.util.simpleMsg(data);
    },
    setAppBadge: function (data, id) {
      var v = YL.vue;
      var app = (Yuri2.isArray(data)) ? v.apps[data[0]] : YL.util.getAppByWinId(id);
      var badge = (Yuri2.isArray(data)) ? v.apps[data[1]] : data;
      if (app) {
        app.badge = badge;
        return true;
      }
      return false;
    },
    getAppVersion: function (data, id) {
      var app = data ? data : YL.util.getAppByWinId(id);
      return app ? app.version : null;
    },
    setup: function (data, id) {
      YL.util.simpleConfirm(YL.lang('ChildMethodSetupConfirm'), function () {
        var v = YL.vue;
        //子页安装应用、图标、侧边栏、菜单、磁贴
        if (data.apps) {
          for (var appid in data.apps) {
            var app = data.apps[appid];
            YL.addApp(appid, app);
          }
        }
        if (data.shortcuts) {
          data.shortcuts.forEach(function (t) {
            if (YL.util.hasApp(t))
              YL.addShortcut(t);
          })
        }
        if (data.sidebar) {
          data.sidebar.forEach(function (t) {
            if (YL.util.hasApp(t))
              YL.addSidebarBtn(t);
          })
        }
        if (data.tiles) {
          data.tiles.forEach(function (t) {
            if (YL.util.hasApp(t))
              YL.addTile(t);
          })
        }
        if (data.menu) {
          var hasError = false;
          var addMenuAttrOpen = function (item) {
            item.open = false;
            if (!item.hash) {
              item.hash = ""
            }
            if (!item.params) {
              item.params = {}
            }
            if (item.children) {
              for (var i in item.children) {
                var child = item.children[i];
                addMenuAttrOpen(child);
              }
            } else {
              if (!YL.util.hasApp(item)) {
                hasError = true;
              }
            }
          };
          if (!hasError) {
            for (var i in data.menu) {
              var menu = data.menu[i];
              addMenuAttrOpen(menu);
              v.$set(v.startMenu.menu, i, menu);
            }
          }
        }
        var win = v.wins[id];
        YL.msg(YL.lang('ChildMethodSetupSuccessMsgTitle'), YL.lang('ChildMethodSetupSuccessMsgContent') + win.url);
      });
    },
    uninstall: function (data, id) {
      //卸载一个或多个应用
      YL.util.simpleConfirm(YL.lang('ChildMethodUninstallConfirm'), function () {
        var list = [];
        if (typeof data === 'string')
          list.push(data);
        else
          list = data;
        list.forEach(function (t) {
          YL.uninstall(t);
        });
        var win = v.wins[id];
        YL.msg(YL.lang('ChildMethodUninstallSuccessMsgTitle'), YL.lang('ChildMethodUninstallSuccessMsgContent') + win.url);
      })
    },
    import: function (data, id) {
      if (!YL.util.isTrustedApp(YL.vue.wins[id].app)) {
        return false;
      }
      YL.import(data);
      return true;
    },
    export: function (data, id) {
      if (!YL.util.isTrustedApp(YL.vue.wins[id].app)) {
        return false;
      }
      return YL.export();
    },
    eval: function (data, id) {
      if (!YL.util.isTrustedApp(YL.vue.wins[id].app)) {
        return false;
      }
      return eval(data);
    },

    urlRel: function (url, id) {
      //实时更新url
      var win = YL.vue.wins[id];
      var h = win.history;
      win.urlBar = url;
      var posMax = h.urls.length - 1;
      if (posMax === h.pos) {
        //位于末尾且不相等，新增
        if ((h.urls[posMax]) !== url) {
          h.urls.push(url);
          h.pos++;
        }
      } else {
        var posNext = h.pos + 1;
        var posPre = h.pos - 1;
        var posNow = h.pos;
        var urlNext = h.urls[posNext];
        var urlPre = h.urls[posPre];
        var urlNow = h.urls[posNow];
        if (urlNext !== url && urlPre !== url && urlNow !== url) {
          h.urls.splice(posNext, 999);
          h.urls.push(url);
          h.pos++;
        }
      }
    },
    historyBack: function (data, id) {
      var winId = data || id;
      var win = YL.vue.wins[winId];
      var h = win.history;
      if (this.historyBackAvailable(winId)) {
        win.url = win.urlBar = h.urls[--h.pos];
      }
    },
    historyBackAvailable: function (data, id) {
      var winId = data || id;
      var win = YL.vue.wins[winId];
      var h = win.history;
      return h.pos > 0 && h.urls[h.pos - 1];
    },
    historyForward: function (data, id) {
      var winId = data || id;
      var win = YL.vue.wins[winId];
      var h = win.history;
      if (this.historyForwardAvailable(winId)) {
        win.url = win.urlBar = h.urls[++h.pos];
      }
    },
    historyForwardAvailable: function (data, id) {
      var winId = data || id;
      var win = YL.vue.wins[winId];
      var h = win.history;
      var posMax = h.urls.length - 1;
      return h.pos < posMax && h.urls[h.pos + 1];
    },
  },
};
YL.util.onloadSafe(function () {
  YL.util.loadScript('./configs.js', function () {
    if (YL.static.lang.toLocaleLowerCase() === 'auto') {
      YL.static.lang = (navigator.language || navigator.browserLanguage).toLowerCase();
    }
    var fnLoadResFromText = function (text) {
      var json;
      json = eval('(' + text + ')');
      YL.static.languages[YL.static.lang] = json;
      YL.loadRes();
    };
    YL.util.loadContentFromUrl('./langs/' + YL.static.lang + '.json', 'GET', function (err, text) {
      if (!err) {
        fnLoadResFromText(text)
      } else {
        YL.static.lang = 'en';
        YL.util.loadContentFromUrl('./langs/' + YL.static.lang + '.json', 'GET', function (err, text) {
          fnLoadResFromText(text)
        })
      }
    });
  });
});
