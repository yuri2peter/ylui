YL.render = function (data) {
  //监听消息
  $(window).on("message", function (e) {
    var winVerify = function (from) {
      var id = from[0];
      var secrete = from[1];
      var win = YL.vue.wins[id];
      if (win) {
        if (win.secrete === secrete) {
          return true;
        } else {
          YL.vue.winClose(id);
          YL.msg(YL.lang('SecurityRisk'), YL.lang('SecurityRiskDetail'))
        }
      }
      return false;
    };
    var data = e.originalEvent.data;
    if ($.inArray(data.type, ["ylui-pong", "ylui-eval", "ylui-emit"]) < 0) { return; }
    var from = data.from;
    var id = from[0];
    var wins = YL.vue.wins;
    var win = wins[id];
    if (!winVerify(from)) return;
    switch (data.type) {
      case "ylui-pong":
        win.pong = Date.now();
        break;
      case "ylui-eval":
        var rel = YL.child[data.eval.method].call(YL.child, data.eval.data, id);
        !window.frames[id] || window.frames[id].postMessage({
          "type": "ylui-eval",
          result: rel,
          session: data.session,
        }, '*');
        break;
      case "ylui-emit":
        var target = data.emit.target;
        var sendList = [];
        if (typeof target === 'string') {
          sendList.push(target)
        } else if (Yuri2.isArray(target)) {
          sendList = target;
        } else if (target === true) {
          //all
          for (var i in wins) {
            sendList.push(i);
          }
        }
        var parsedFrom = Yuri2.parseURL(win.urlOrigin);
        sendList.forEach(function (t) {
          var parsedTo = Yuri2.parseURL(wins[t].urlOrigin);
          !window.frames[t] || window.frames[t].postMessage({
            "type": "ylui-event",
            event: data.emit.event,
            target: sendList,
            data: data.emit.data,
            session: data.session,
            from: id,
            sameOrigin: parsedFrom.protocol === parsedTo.protocol && parsedFrom.host === parsedTo.host && parsedFrom.port === parsedTo.port,
          }, '*');
        });
        break;
    }

  });

  //离开前警告
  document.body.onbeforeunload = function (event) {
    if (!YL.static.beforeOnloadEnable) {
      return;
    }
    var rel = YL.lang("BeforeUnload");
    if (!window.event) {
      event.returnValue = rel;
    } else {
      window.event.returnValue = rel;
    }
  };

  //vue实例
  YL.vue = new Vue({
    el: '#yl',
    data: data,
    components: {
      GridLayout: VueGridLayout.GridLayout,
      GridItem: VueGridLayout.GridItem,
    },
    created: function () {
      this.initRuntime(true);
      console.log('%c' + YL.static.welcome, "color:red;font-weight:bold;");//welcome
    },
    methods: {
      contextMenuAddTo: function (objCopy) {
        var objDeepCopy = Yuri2.jsonDeepCopy(objCopy);
        var funcMsg = function () {
          YL.util.simpleMsg(YL.lang("Added"));
        };
        var menuAddToTile = [];
        this.tiles.forEach(function (group, n) {
          menuAddToTile.push([
            YL.util.getStrFa('square') + group.title,
            function () {
              YL.addTile(objDeepCopy, n);
              funcMsg();
            }, !YL.static.changeable
          ])
        });
        return [
          YL.util.getStrFa('copy') + YL.lang("AddTo"),
          [
            [YL.util.getStrFa('desktop') + YL.lang("DesktopIcons"), function () {
              YL.addShortcut(objDeepCopy);
              funcMsg()
            }, !YL.static.changeable],
            [YL.util.getStrFa('list-ul') + YL.lang("MainMenu"), function () {
              YL.addMenuItem(objDeepCopy);
              funcMsg()
            }, !YL.static.changeable],
            [YL.util.getStrFa('sliders') + YL.lang("Sidebar"), function () {
              YL.addSidebarBtn(objDeepCopy);
              funcMsg()
            }, !YL.static.changeable],
            '|',
            "<span style='color: darkgray'>" + YL.util.getStrFa('square') + YL.lang("Tiles") + "</span>",
          ].concat(menuAddToTile)
        ];
      },
      contextMenuUninstall: function (appId) {
        var that = this;
        return [
          YL.util.getStrFa('trash') + YL.lang("Uninstall"),
          function (v) {
            YL.util.simpleConfirm(Yuri2.template(YL.lang("UninstallConfirm"), that.apps[appId].title), function () {
              if (YL.uninstall(appId)) {
                YL.util.simpleMsg(YL.lang("UninstallCompleted"));
              }
            })
          }, !YL.static.changeable
        ]
      },
      contextMenuOpen: function (obj) {
        var that = this;
        return [YL.util.getStrFa('play-circle') + YL.lang("Open"), [
          [
            YL.util.getStrFa('window-restore') + YL.lang("Normal"),
            function (v) {
              that.appOpen(obj.app, Yuri2.jsonMerge(obj, { openMode: 'normal' }), obj);
            }],
          [
            YL.util.getStrFa('window-maximize') + YL.lang("Maximize"),
            function (v) {
              that.appOpen(obj.app, Yuri2.jsonMerge(obj, { openMode: 'max' }), obj);
            }],
          [
            YL.util.getStrFa('window-minimize') + YL.lang("Minimize"),
            function (v) {
              that.appOpen(obj.app, Yuri2.jsonMerge(obj, { openMode: 'min' }), obj);
            }],
          [
            YL.util.getStrFa('paper-plane') + YL.lang("Outer"),
            function (v) {
              that.appOpen(obj.app, Yuri2.jsonMerge(obj, { openMode: 'outer' }), obj);
            }],
        ]]
      },
      onResize: function () {
        var that = this;

        //屏幕尺寸
        var clientSize = Yuri2.getClientSize();
        that.runtime.clientSize.width = clientSize.width;
        that.runtime.clientSize.height = clientSize.height;
        that.runtime.desktopSize.width = clientSize.width;
        that.runtime.desktopSize.height = clientSize.height - 40;
        that.runtime.isSmallScreen = clientSize.width <= 768;
        that.runtime.isHorizontalScreen = clientSize.width > clientSize.height;
        that.runtime.startMenu.width = clientSize.width > that.startMenu.width && !that.runtime.isSmallScreen
          ? that.startMenu.width : clientSize.width;
        that.runtime.startMenu.height = that.runtime.desktopSize.height > that.startMenu.height && !that.runtime.isSmallScreen
          ? that.startMenu.height : that.runtime.desktopSize.height;

        //计算磁贴尺寸
        var widthFixed = that.runtime.startMenu.width - (that.runtime.isSmallScreen ? 80 : 328);
        var groupNum = 1;//多少列
        if (widthFixed <= 460) {
          groupNum = 1;
        } else if (widthFixed <= 769) {
          groupNum = 2;
        } else if (widthFixed <= 1024) {
          groupNum = 3;
        } else {
          groupNum = 4;
        }
        that.runtime.tilesGroupNum = groupNum;
        for (var size = 0; size < 1000; size++) {
          var width = (size + 4) * 6;
          if (width > (widthFixed - 12 * groupNum) / groupNum) {
            size--;
            break;
          }
        }
        that.runtime.tileSize = size;
        that.runtime.tilesWidth = (size + 4) * 6;

        //计算桌面网格尺寸
        that.runtime.shortcutWidth = that.runtime.isSmallScreen ? 56 : 68;
        that.runtime.shortcutHeight = that.runtime.isSmallScreen ? 70 : 90;
        that.runtime.shortcutsGrid.x = parseInt(that.runtime.desktopSize.width / that.runtime.shortcutWidth);
        that.runtime.shortcutsGrid.y = parseInt(that.runtime.desktopSize.height / that.runtime.shortcutHeight);

        //给窗体发送resize事件
        that.emitWinEvent(0, 'resize',{
          width:that.runtime.desktopSize.width,
          height:that.runtime.desktopSize.height,
        });
      },
      initRuntime: function (first) {
        var that = this;
        //窗体尺寸变更监听
        var fnResize = that.onResize;
        fnResize();
        if (first)
          $(window).resize(fnResize);

        //时钟
        if (first) {
          setInterval(function () {
            var myDate = new Date();
            var year = myDate.getFullYear();
            var month = myDate.getMonth() + 1;
            var date = myDate.getDate();
            var hours = myDate.getHours();
            var mins = myDate.getMinutes();
            if (mins < 10) {
              mins = '0' + mins
            }
            that.runtime.time = (hours + ':' + mins);
            that.runtime.date = myDate;
          }, 1000);
        }

        //即将渲染
        if (first) {
          this.$nextTick(function () {
            //jq插件 滚动条
            var box = [
              '#yl .tiles-box',
              '#yl .startMenu .menu',
              '#yl .center .msgs',
            ];
            for (var i = 0; i < box.length; i++) {
              var e = box[i];
              $(e).niceScroll({
                cursorcolor: "#ffffff30",
                cursorwidth: "4px", // 滚动条的宽度，单位：便素
                cursorborder: "none", // CSS方式定义滚动条边框
                grabcursorenabled: false,
              });
            }
            setInterval(function () {
              for (var i = 0; i < box.length; i++) {
                var e = box[i];
                try {
                  $(e).getNiceScroll().resize();
                } catch (e) {
                }
              }
            }, 500);

            $("#yl").css({ 'opacity': 1, display: "block" }); //显示
          });
        }

        //壁纸幻灯片服务
        if (first) {
          setInterval(function () {
            //wallpaperSlided:Date.now(), //记录最近一次切换壁纸的时刻
            if (!that.configs.wallpaperSlide) return; //没开启则返回
            var itv = that.configs.wallpaperSlideItv * 60 * 1000; //间隔（毫秒）
            var last = that.configs.wallpaperSlideTime;//记录最近一次切换壁纸的时刻
            var indexLast = that.configs.wallpaperSlideIndex;//记录最近一次切换壁纸的index
            var now = Date.now();
            if (now > (itv + last)) {
              that.configs.wallpaperSlideTime = now; //记录当前时间
              var wallpapers = that.configs.wallpapers;
              var len = wallpapers.length;
              var index = 0;
              if (that.configs.wallpaperSlideRandom) {
                index = YL.util.randInt(0, len - 1);//随机取下标
              } else {
                //顺序取下标
                index = indexLast + 1;
                if (index >= len) {
                  index = 0;
                }
              }
              if (wallpapers[index]) {
                that.configs.wallpaper = wallpapers[index].image;//切换
                that.configs.wallpaperSlideIndex = index;
              }
            }
          }, 1000);
        }

        //记录IE
        if (Yuri2.isIE()) {
          that.runtime.isIE = true;
          if (YL.static.WarningPerformanceInIE) {
            setTimeout(function () {
              YL.msg(YL.lang("WarningPerformanceInIETitle"), YL.lang("WarningPerformanceInIEContent"))
            }, 2000);
          }
        }

        //初始化壁纸
        var img = new Image();
        var urlBg = this.configs.wallpaper;
        img.src = urlBg;
        img.onload = function () {
          that.runtime.wallpaper = urlBg;
          if (that.configs.autoThemeColor) {
            that.backgroundToThemeColor()
          }
        };

        //壁纸比例修正
        that.backgroundUpdateScale();

        //自动保存服务
        if (first) {
          var lastExport = '';
          setInterval(function () {
            try {
              var exportJson = JSON.stringify(YL.export());
              if (exportJson !== lastExport) {
                lastExport = exportJson;
                localStorage.setItem(YL.static.localStorageName, exportJson);
                that.emitWinEvent(0, 'dataChanged');
              }
            } catch (e) {
              YL.debug(e);
            }
          }, 1000);
        }

        //F5刷新激活子页
        if (first) {
          var f5_check = function (e) {
            e = e || window.event;
            if (e.ctrlKey && ((e.which || e.keyCode) === 116)) {
              // 强制刷新，清除缓存
              YL.static.beforeOnloadEnable = false;
              return;
            }
            if ((e.which || e.keyCode) === 116) {
              if (e.preventDefault) {
                e.preventDefault();
              } else {
                e.keyCode = 0;
                e.returnValue = false;
              }
              if (that.runtime.winActive) {
                that.winRefresh(that.runtime.winActive);
              }
              else {
                that.flash();
              }
            }
          };
          if (document.addEventListener) {
            document.addEventListener("keydown", f5_check, false);
          } else {
            document.attachEvent("onkeydown", f5_check);
          }
        }

        //刷新子页的childSupport状态
        if (first) {
          setInterval(function () {
            var now = Date.now();
            for (var i in that.wins) {
              var win = that.wins[i];
              win.childSupport = (win.pong && (now - win.pong < 500))
            }
          }, 300);
        }

        //自启动
        var autoRun = function () {
          var arrAutoRun = [];
          for (var i in that.apps) {
            if (that.apps[i].autoRun > 0) {
              arrAutoRun.push(i);
            }
          }
          arrAutoRun.sort(function (a, b) {
            return that.apps[b].autoRun - that.apps[a].autoRun;
          });
          arrAutoRun.forEach(function (t) {
            //此处判断手机用户隐藏插件
            var winId = that.appOpen(t, {});
            if (that.apps[t].plugin && that.runtime.isSmallScreen) {
              that.$nextTick(function () {
                that.winMinimize(winId);
              });
            }
          });
        };
        if (first) YL.onReady(autoRun); else {
          autoRun()
        }

        //社区版提示检测
        if (first && !YL.static.serialNumber) {
          YL.onReady(function () {
            setTimeout(function () {
              YL.msg("YLUI v" + YL.info.version + " 社区版", '当前YLUI为社区版，仅限个人用户学习使用，禁止商用及企业使用。<br/>更多信息及获取商业授权请访问:<br/>YLUI官网：' + '<a style="color: white" target="_blank" href="https://ylui.yuri2.cn">https://ylui.yuri2.cn</a><p>欢迎使用支付宝扫描二维码对作者进行捐赠，表达您对YLUI的支持~<br/><br/><img style="width: 100%" src="./res/img/donation.png"/></p>');
            }, 1500)
          });
        }

        this.ready = true;
      },
      setWithID: function (obj, val, prefix, ran) {
        //设置对象属性，返回合法id
        do {
          var id = ran === true ? prefix + Yuri2.randInt(100000000, 999999999) : prefix + YL.util.getID();
        } while (obj[id] !== undefined);
        this.$set(obj, id, val);
        return id;
      },
      emitWinEvent: function (id, event, data) {
        //给所有子窗口发消息，id：消息源，event：事件名
        var senList = [];
        var wins = this.wins;
        for (var idWin in wins) {
          senList.push(idWin);
        }
        this.$nextTick(function () {
          senList.forEach(function (idWindow) {
            !window.frames[idWindow].postMessage || window.frames[idWindow].postMessage({
              "type": "ylui-event",
              event: event,
              target: senList,
              data: data,
              session: null,
              from: id,
              sameOrigin: false,
            }, '*');
          });
        });
      },
      flash: function () {
        var that = this;
        //图标闪烁。假的，是头发的特技
        that.runtime.shortcutsShow = false;
        setTimeout(function () {
          that.runtime.shortcutsShow = true;
        }, 200);

        //刷新customTileRandomToken
        that.runtime.customTileRandomToken = YL.util.randInt(1000, 9999);
      },
      appOpen: function (id, options, source) {
        //id也可以是json（动态app）
        var that = this;
        if (!options) {
          options = {};
        } //容错

        //打开app
        var app = (typeof id === 'string') ? this.apps[id] : id;
        var appMerge = Yuri2.jsonMerge(app, options);
        this.hideOpens();

        //单例检测
        if (appMerge.single) {
          for (var i in this.wins) {
            var w = this.wins[i];
            if (w.single && w.app === id) {
              that.winSetActive(i);
              that.winShow(i);
              return;
            }
          }
        }

        if (!appMerge.url) {
          return;
        }//空url返回
        if (this.runtime.winOpened >= this.configs.openMax) {
          YL.util.simpleMsg(Yuri2.template(YL.lang("MaxWinsReached"), this.configs.openMax));
          return;
        }

        //隐藏菜单和操作中心
        // appMerge.plugin || this.runtime.winOpened++;//计数
        this.runtime.winOpenCounter++;//计数
        var dx = parseInt(this.runtime.winOpenCounter % 10) * this.runtime.clientSize.height * 0.01;//坐标偏移量
        //该函数支持字符串转数字，其中x和y将被替换为屏幕的宽和高
        var evalNum = function (str) {
          var rel = 0;
          if (isNaN(str)) {
            try {
              if (!/^[\dxy+\-*\/()\s.]*$/.test(str)) {
                //防xss的过滤
                str = '600'
              }
              var query = 'var x=YL.vue.runtime.clientSize.width;var y=YL.vue.runtime.clientSize.height-40;' + str;
              rel = eval(query);
            } catch (e) {
              YL.debug(e)
            }
          } else {
            rel = str;
          }
          return parseInt(rel);
        };
        var win = {
          app: id,
          state: 'normal',
          min: false,
          addressBar: true,
          style: {
            //样式继承自app
            position: {
              x: evalNum(app.position.x) + (app.position.autoOffset ? dx : 0),
              y: evalNum(app.position.y) + (app.position.autoOffset ? dx + 80 : 0),
              left: app.position.left,
              top: app.position.top,
            },
            size: {
              width: evalNum(app.size.width),
              height: evalNum(app.size.height),
            },
          },
          drag: {
            mDownPosition: false,
            mDownSize: false,
            x: 0,
            y: 0,
          },
          oldStyle: { //用于记录最大化还原
            position: {
              left: 0,
              top: 0,
            },
            size: {
              width: 0,
              height: 0,
            },
          },
          source: source,
          resizable: true,
          history: {
            pos: -1,
            urls: [],
          }, //url历史
          data: {},//data域，使用YLApp时传递给子页面
          pong: null, //最后pong的时间
          childSupport: false,//子页支持可用
          init: true,//init状态，用于显示封面
        };
        win = Yuri2.jsonMerge(win, appMerge);
        win.style = Yuri2.jsonDeepCopy(win.style);//深拷贝对象
        win.style.index = YL.util.getBiggerWinZIndex();
        win.url = YL.util.urlParams(win.url, win.params, win.hash);
        if (win.urlRandomToken) win.url = YL.util.updateUrlRandomToken(win.url);
        if (win.openMode === 'outer') {
          //外部打开
          window.open(win.url);
          return;
        }
        win.urlOrigin = win.url; //保存原始地址
        win.urlBar = win.url; //地址栏地址
        var winID = this.setWithID(this.wins, win, 'win-', true);
        var secrete = Math.random();
        win.idIframe = winID + "iframe-";
        win.secrete = secrete; //身份密钥
        this.emitWinEvent(winID, 'open', null);
        switch (win.openMode) {
          case 'max':
            this.winMaximize(winID);
            break;
          case 'min':
            this.winMinimize(winID);
            break;
        }
        //记录激活的id
        if (!win.min) this.runtime.winActive = winID;
        that.$nextTick(function () {
          //发送post消息,通知被分配的窗口id
          var itvPing = setInterval(function () {
            if ($("#" + winID).length <= 0) {
              clearInterval(itvPing);
              return;
            }
            !window.frames[winID].postMessage || window.frames[winID].postMessage({
              "type": "ylui-ping",
              id: winID,
              secrete: secrete,
              itv: itvPing,
              data: win.data,
            }, '*');
          }, 500);
          //监听iframe点击事件
          var ifr = $("#" + win.idIframe)[0];
          YL.util.iframeOnClick.track(ifr, function () {
            if (Object.getOwnPropertyNames(YL.util._iframe_click_lock_children).length === 0) {
              that.winSetActive(winID);//激活窗口
              ContextMenu._removeContextMenu();//关闭右键菜单
            }
          }, winID);

          //激活刚打开的iframe
          if (!win.min) {
            ifr.focus();
          }

          // 加载完毕关闭封面
          var created = new Date().getTime();
          var closeInit = function () {
            var now = new Date().getTime();
            var delay = now - created > 1000 ? 0 : 1000;
            setTimeout(function () {
              win.init = false;
            }, delay);
          };
          if (ifr.attachEvent) {
            // IE
            ifr.attachEvent("onload", closeInit);
          } else {
            // NOT IE
            ifr.onload = closeInit;
          }
        });

        //如果是手机屏幕，最大化
        if (that.runtime.isSmallScreen && !win.plugin && win.resizable) {
          that.winMaximize(winID);
        }

        // 超时关闭封面
        setTimeout(function () {
          win.init = false;
        }, 10000);

        return winID;
      },
      tileStyle: function (tile) {
        var that = this;
        var sizePerBlock = that.runtime.tileSize;
        var sizeRel = function (size) {
          return size * (sizePerBlock + 4) - 4;
        };
        var w = tile.w;
        var h = tile.h;
        var min = Math.min(w, h) / 1.5;
        var size = sizeRel(min);

        return {
          width: size + 'px',
          height: size + 'px',
          top: (sizeRel(h) - size) / 2 + 'px',
          left: (sizeRel(w) - size) / 2 + 'px',
          'line-height': size + 'px',
          'font-size': size / 2 + 'px',
          // 'background-color':that.apps[tile.app].icon.bg,
        }
      },
      winIsMin: function (id) {
        var win = this.wins[id];
        return win.min;
      },
      winShow: function (id) {
        var win = this.wins[id];
        win.min = false;
      },
      winShowToggle: function (id) {
        var win = this.wins[id];
        win.min = !win.min;
      },
      winClose: function (id) {
        var win = this.wins[id];
        if (!win) {
          return
        }

        this.$delete(this.wins, id);
        this.emitWinEvent(id, 'close', null);
        this.findNewActive();
      },
      winMaximize: function (id) {
        //最大化
        var win = this.wins[id];
        if (!win.resizable) {
          YL.util.simpleMsg(YL.lang('AttentionNoResize'));
          return;
        }
        win.state = 'max';
        win.oldStyle.position.y = win.style.position.y;
        win.style.position.y = win.addressBar ? 80 : 40;
        win.oldStyle.position.x = win.style.position.x;
        win.style.position.x = 0;
        win.oldStyle.size.width = win.style.size.width;
        win.style.size.width = this.runtime.desktopSize.width;
        win.oldStyle.size.height = win.style.size.height;
        win.style.size.height = this.runtime.desktopSize.height - (win.addressBar ? 80 : 40);
      },
      winRestore: function (id) {
        var win = this.wins[id];
        win.state = 'normal';
        win.style.position.y = win.oldStyle.position.y;
        win.style.position.x = win.oldStyle.position.x;
        win.style.size.width = win.oldStyle.size.width;
        win.style.size.height = win.oldStyle.size.height;
      },
      winMinimize: function (id) {
        var win = this.wins[id];
        win.min = true;
        this.findNewActive();
      },
      winSetCenter: function (id) {
        var that = this;
        var win = that.wins[id];
        that.winShow(id);
        if (!win.resizable) {
          YL.util.simpleMsg(YL.lang('AttentionNoResize'));
          return;
        }
        win.state = "normal";
        var w = that.runtime.desktopSize.width;
        var h = that.runtime.desktopSize.height;
        win.style.size.width = w * 0.8;
        win.style.size.height = h * 0.8 - 80;
        win.style.position.y = h * 0.1 + 80;
        win.style.position.x = w * 0.1;
      },
      winTitleMouseDown: function (id, e) {
        //忽略右键
        if (e.which === 3) return;
        var isMouse = !e.changedTouches;//是否是鼠标事件，false为触屏；
        // var downTime=Date.now();
        var fnGetPagePointFromEvent = function (event) {
          var p = {
            x: 0,
            y: 0,
          };
          if (!e.changedTouches) {
            //是鼠标
            p.x = event.pageX;
            p.y = event.pageY;
          } else {
            //是触屏
            var touches = event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
            p.x = touches[0].pageX;
            p.y = touches[0].pageY;
          }
          return p;
        }; //该函数从触屏或鼠标点击获取pageX，pageY
        var point = fnGetPagePointFromEvent(e);

        //拖动逻辑
        var that = this;
        var win = this.wins[id];
        win.drag.x = point.x;
        win.drag.y = point.y;
        win.drag.mDownPosition = true;
        var fnMouseUp = function (e) {
          if (!win.drag.mDownPosition) return;
          win.drag.mDownPosition = false;
          that.runtime.drag = false;
          //事件解绑
          if (isMouse) {
            $(document).unbind('mousemove', fnMouseMove);
            $(document).unbind('mouseup', fnMouseUp);
          } else {
            $(document).unbind('touchmove', fnMouseMove);
            $(document).unbind('touchend', fnMouseUp);
          }
        };
        var fnMouseMove = function (e) {
          if (!win.drag.mDownPosition) return;
          that.runtime.drag = true;
          var p = fnGetPagePointFromEvent(e);
          var x = p.x;
          var y = p.y;
          if (win.state === 'max' && (y - win.drag.y > 2)) that.winRestore(id);//在全屏状态拖动，自动还原
          win.style.position.x += win.style.position.left ? (x - win.drag.x) : (win.drag.x - x);
          win.style.position.y += win.style.position.top ? (y - win.drag.y) : (win.drag.y - y);
          win.drag.x = x;
          win.drag.y = y;
        };
        if (isMouse) {
          $(document).mouseup(fnMouseUp);
          $(document).mousemove(fnMouseMove);
        } else {
          $(document).on('touchend', fnMouseUp);
          $(document).on('touchmove', fnMouseMove);
        }
      },
      winTitleDblclick: function (id) {
        //双击最大化
        var w = this.wins[id];
        if (w.plugin) {
          return;
        }
        if (w.state === 'max') {
          this.winRestore(id);
        } else {
          this.winMaximize(id);
        }
      },
      winResizeMouseDown: function (id, e) {
        //拖动逻辑
        var that = this;
        var win = this.wins[id];
        win.drag.x = e.pageX;
        win.drag.y = e.pageY;
        win.drag.mDownSize = true;
        var fnMouseUp = function (e) {
          if (!win.drag.mDownSize) return;
          win.drag.mDownSize = false;
          that.runtime.drag = false;
          $(document).unbind('mouseup', fnMouseUp);
          $(document).unbind('mousemove', fnMouseMove);
        };
        var fnMouseMove = function (e) {
          if (!win.drag.mDownSize) return;
          var minWidth = 200;
          var minHeight = 84;
          that.runtime.drag = true;
          var x = e.pageX;
          var y = e.pageY;
          win.style.size.width += (x - win.drag.x);
          (win.style.size.width) > minWidth || (win.style.size.width = minWidth);
          win.style.size.height += (y - win.drag.y);
          (win.style.size.height) > minHeight || (win.style.size.height = minHeight);
          win.drag.x = x;
          win.drag.y = y;
        };
        $(document).mouseup(fnMouseUp);
        $(document).mousemove(fnMouseMove);

      },
      winSetActive: function (id) {
        var now = Date.now();
        if (now - this.runtime.winActiveTime < 200) {
          return;
        }
        this.runtime.winActiveTime = now;
        var win = this.wins[id];
        win.style.index = YL.util.getBiggerWinZIndex();
        this.runtime.winActive = id;
        this.startMenu.open = false;
        this.drawer = null;
        this.center.open = false;
      },
      winStyle: function (id) {
        var win = this.wins[id];
        return {
          width: win.style.size.width + 'px',
          height: win.style.size.height + 'px',
          top: win.style.position.top ? win.style.position.y + 'px' : 'auto',
          left: win.style.position.left ? win.style.position.x + 'px' : 'auto',
          bottom: !win.style.position.top ? win.style.position.y + 'px' : 'auto',
          right: !win.style.position.left ? win.style.position.x + 'px' : 'auto',
          'z-index': win.style.index + (win.background ? -500 : 0),
        }
      },
      winInitIconStyle: function (id) {
        var win = this.wins[id];
        var size = Math.min(win.style.size.width, win.style.size.height) / 4;
        return {
          'font-size': size + 'px',
          'line-height': size + 'px',
          'width': size * 1.5 + 'px',
        };
      },
      winClass: function (id) {
        var w = this.wins[id];
        return {
          active: id === this.runtime.winActive && !this.winIsMin(id),
          plugin: w.plugin,
          "addressBar-hidden": !w.addressBar,
        }
      },
      winTaskClick: function (id) {
        var win = this.wins[id];
        if (this.winIsMin(id) || this.startMenu.open || this.drawer) {
          this.winShow(id);
          this.winSetActive(id);
        } else {
          if (this.runtime.winActive === id) {
            this.winMinimize(id);
            this.findNewActive();
          } else {
            this.winSetActive(id);
          }
        }
      },
      winRefresh: function (id) {
        var win = this.wins[id];
        var target = win.urlBar;
        this.winJump(id, win.urlRandomToken ? YL.util.updateUrlRandomToken(target) : target);
      },
      winHome: function (id) {
        var win = this.wins[id];
        var target = win.urlOrigin;
        this.winJump(id, win.urlRandomToken ? YL.util.updateUrlRandomToken(target) : target);
      },
      winJump: function (id, url) {
        var win = this.wins[id];
        win.url = win.urlBar = 'about:blank';
        setTimeout(function () {
          win.url = win.urlBar = url;
        }, 200);
      },
      winContextMenu: function (id, e) {
        var that = this;
        var win = this.wins[id];
        var menu = [
          [YL.util.getStrFa("refresh") + YL.lang("Refresh"), function () {
            that.winRefresh(id);
          }],
        ];
        if (!win.addressBar) {
          menu.push([YL.util.getStrFa("location-arrow") + YL.lang("DisplayAddressBar"), function () {
            win.addressBar = true;
          }]);
        } else {
          menu.push([YL.util.getStrFa("location-arrow") + YL.lang("HideAddressBar"), function () {
            win.addressBar = false;
          }]);
        }
        menu.push([YL.util.getStrFa("magic") + YL.lang("CollectAsApplication"), function () {
          layer.prompt({
            title: YL.lang("AttentionEnterAppName"),
            formType: 0,
            value: Yuri2.parseURL(win.url).host,
            maxlength: 32,
            skin: 'yl',
            zIndex: 19930012,
          }, function (input, index) {
            layer.close(index);
            var app = YL.util.getAppDataTemplate();
            app.url = YL.util.removeUrlRandomToken(win.url);
            app.title = input;
            app.icon.type = 'str';
            app.icon.content = input;
            var appId = 'app-' + YL.util.getID();
            YL.addApp(appId, app);
            YL.addShortcut(appId);//自动添加到桌面
            YL.addMenuItem(appId);//自动添加到菜单
            YL.util.simpleMsg(YL.lang("Added"));
          });
        }, !YL.static.changeable]);
        menu.push('|');
        var menuWin = [];
        menuWin.push(YL.util.getStrFa("arrows") + Yuri2.template('${0}px * ${1}px', parseInt(win.style.size.width), parseInt(win.style.size.height)));
        menuWin.push([YL.util.getStrFa("window-restore") + YL.lang("CentreAdjustment"), function () {
          that.winSetCenter(id);
          that.winSetActive(id);
        }]);
        if (that.winIsMin(id)) {
          menuWin.push([YL.util.getStrFa("clone") + YL.lang("DisplayWindow"), function () {
            that.winShow(id);
          }]);
        } else {
          menuWin.push([YL.util.getStrFa("window-minimize") + YL.lang("Minimize"), function () {
            that.winMinimize(id);
          }]);
        }
        if (!win.plugin && win.state === 'normal' && win.resizable) {
          menuWin.push([
            YL.util.getStrFa("window-maximize") + YL.lang("Maximize"), function () {
              that.winShow(id);
              that.winMaximize(id);
            }
          ])
        }
        if (!win.plugin && win.state === 'max') {
          menuWin.push([
            YL.util.getStrFa("window-restore") + YL.lang("Restore"), function () {
              that.winRestore(id)
            }
          ])
        }
        menuWin.push('|');
        if (win.style.position.left) {
          menuWin.push([YL.util.getStrFa("angle-double-right") + YL.lang("AlignRight") + Yuri2.template(' (${0}px)', parseInt(win.style.position.x)), function () {
            win.style.position.left = !win.style.position.left;
          }]);
        } else {
          menuWin.push([YL.util.getStrFa("angle-double-left") + YL.lang("AlignLeft") + Yuri2.template(' (${0}px)', parseInt(win.style.position.x)), function () {
            win.style.position.left = !win.style.position.left;
          }]);
        }
        if (win.style.position.top) {
          menuWin.push([YL.util.getStrFa("angle-double-down") + YL.lang("AlignBottom") + Yuri2.template(' (${0}px)', parseInt(win.style.position.y)), function () {
            win.style.position.top = !win.style.position.top;
          }]);
        } else {
          menuWin.push([YL.util.getStrFa("angle-double-up") + YL.lang("AlignTop") + Yuri2.template(' (${0}px)', parseInt(win.style.position.y)), function () {
            win.style.position.top = !win.style.position.top;
          }]);
        }
        menu.push([YL.util.getStrFa("windows") + YL.lang("WindowPosition"), menuWin]);
        menu.push([YL.util.getStrFa("paper-plane") + YL.lang("OpenOuter"), function () {
          window.open(win.url);
        }]);
        //记住位置大小
        if (win.source) {
          menu.push([YL.util.getStrFa("crop") + YL.lang('RememberSizeAndPosition'), function () {
            win.source.style = {};
            win.source.style.position = {};
            win.source.style.size = {};
            win.source.style.position.x = win.style.position.x;
            win.source.style.position.y = win.style.position.y;
            win.source.style.position.left = win.style.position.left;
            win.source.style.position.top = win.style.position.top;
            win.source.style.position.autoOffset = false;
            win.source.style.size.height = win.style.size.height;
            win.source.style.size.width = win.style.size.width;
            YL.util.simpleMsg(YL.lang("Recorded"));
          }, !YL.static.changeable]);
          if (win.source.style) {
            menu.push([YL.util.getStrFa("crop") + YL.lang("ResetSizeAndPosition"), function () {
              delete win.source.style;
            }, !YL.static.changeable]);
          }
        }
        if (win.plugin) {
          //可以置底作为背景
          menu.push('|');
          if (win.background) {
            menu.push([YL.util.getStrFa("sort-up") + YL.lang("PutForeground"), function () {
              win.background = false;
            }]);
          } else {
            menu.push([YL.util.getStrFa("sort-down") + YL.lang("PutBackground"), function () {
              win.background = true;
            }]);
          }
        }
        menu.push('|');
        menu.push([
          YL.util.getStrFa("close") + YL.lang("Close"), function () {
            that.winClose(id)
          }
        ]);
        ContextMenu.render(e, menu, this, "light");
      },
      findNewActive: function () {
        var id = null;
        var maxIndex = 0;
        for (var i in this.wins) {
          var win = this.wins[i];
          if (!win.min && win.style.index > maxIndex) {
            maxIndex = win.style.index;
            id = i;
          }
        }
        this.runtime.winActive = id;
      },
      winHideAll: function () {
        for (var i in this.wins) {
          var win = this.wins[i];
          if (win.plugin) {
            continue;
          }
          win.min = true;
        }
      },
      winShowAll: function () {
        for (var i in this.wins) {
          var win = this.wins[i];
          if (win.plugin) {
            continue;
          }
          win.min = false;
        }
      },
      winCloseAll: function () {
        for (var i in this.wins) {
          var win = this.wins[i];
          if (win.plugin) {
            continue;
          }
          this.$delete(this.wins, i);
        }
        // this.runtime.winOpened=0; //计数
      },
      menuItemClose: function (father) {
        var menu = father ? father : this.startMenu.menu;
        for (var i in menu) {
          var item = menu[i];
          if (item.children) {
            item.open = false;
            this.menuItemClose(item);
          }
        }
      },
      menuClose: function () {
        this.startMenu.open = false;
        this.menuItemClose();
      },
      showDesktop: function () {
        this.winHideAll();
        this.hideOpens();
      },
      badgeText: function (content) {
        //处理badge的提示内容
        if (isNaN(content)) {
          return content;
        } else {
          return content > 99 ? '99+' : parseInt(content);
        }
      },
      drawerStyle: function () {
        var top = 0, left = 0;

        return {
          'top': top + 'px',
          'left': left + 'px',
        }
      },
      hideOpens: function () {
        //批量关闭一些菜单，div
        this.drawer = null;
        this.menuClose();
        this.center.open = false;
        this.runtime.pluginIconsOpen = false;
        this.runtime.CalendarOpen = false;
      },
      desktopMouseDown: function (e) {
        this.hideOpens();
        !e||this.emitWinEvent(0, 'desktopMouseDown',{
          x:e.x,
          y:e.y,
        });
      },
      desktopMouseUp: function (e) {
        this.hideOpens();
        !e||this.emitWinEvent(0, 'desktopMouseUp',{
          x:e.x,
          y:e.y,
        });
      },
      desktopClick: function (e) {
        this.hideOpens();
        !e||this.emitWinEvent(0, 'desktopClick',{
          x:e.x,
          y:e.y,
        });
      },
      desktopContextMenu: function (e) {
        var that = this;
        that.hideOpens();
        var menu = [
          [YL.util.getStrFa("refresh") + YL.lang("Refresh"), function () {
            that.flash()
          }],
          '|',
          [YL.util.getStrFa('desktop') + YL.lang("DisplayDesktop"), function () {
            that.showDesktop()
          }],
          [YL.util.getStrFa('credit-card') + YL.lang("Personalization"),
            [
              [YL.util.getStrFa('paint-brush') + YL.lang("ThemeColor"), function () {
                YL.open('yl-system', { data: { nav: 'colors' } })
              }, !YL.static.changeable],
              [YL.util.getStrFa('picture-o') + YL.lang("Wallpaper"), function () {
                YL.open('yl-system', { data: { nav: 'wallpaper' } })
              }, !YL.static.changeable],
            ]
          ],
          [YL.util.getStrFa('cog') + YL.lang("SystemOptions"), function () {
            YL.open('yl-system')
          }, !YL.static.changeable],
          '|',
          [YL.util.getStrFa('object-group') + YL.lang("FullScreen"), function () {
            YL.util.enableFullScreen();
          }],
          [YL.util.getStrFa('object-ungroup') + YL.lang("NormalScreen"), function () {
            YL.util.disableFullScreen();
          }],
          [YL.util.getStrFa('circle-o-notch') + YL.lang("Reload"), function () {
            YL.f5();
          }],
          '|',
          [YL.util.getStrFa('info-circle') + YL.lang("AboutUs"), function () {
            YL.aboutUs()
          }],
        ];
        ContextMenu.render(e, menu, this, "light");
      },
      desktopMouseMove: function (e) {
        this.emitWinEvent(0, 'desktopMouseMove',{
          x:e.x,
          y:e.y,
        });
      },
      shortcutOpen: function (s, id) {
        var now = Date.now();
        if (!s || s.drag.moved > 20 || now - this.runtime.shortcutOpenedAt < 500) {
          //忽略拖动产生的click和touch+click导致的短时间多次打开
          return;
        }
        if (s.children) {
          //打开抽屉
          this.drawer = id;
        } else {
          //普通图标
          this.appOpen(s.app, s, s);
        }
        this.runtime.shortcutOpenedAt = Date.now();
        YL.debug(YL.lang("OpenIcons") + ':' + s.title)
      },
      shortcutGrid: function (id) {
        var x = parseInt(id / this.runtime.shortcutsGrid.y);
        var y = parseInt(id % this.runtime.shortcutsGrid.y);
        return { x: x, y: y }
      },
      shortcutPosition: function (id, pid) {
        var g = this.shortcutGrid(id);
        var s = pid === null ? this.shortcuts[id] : this.shortcuts[pid].children[id];
        return {
          x: g.x * this.runtime.shortcutWidth + s.drag.left,
          y: g.y * this.runtime.shortcutHeight + s.drag.top
        }
      },
      shortcutStyle: function (id, pid) {
        var p = this.shortcutPosition(id, pid);
        return {
          left: p.x + 'px',
          top: p.y + 'px',
        }
      },
      shortcutClass: function (id, s, fromDrawer) {
        return {
          move: s.drag.mDown,
          insert: this.runtime.shortcutInsert === id && !fromDrawer,
          over: this.runtime.shortcutOver === id && !fromDrawer,
          cut: this.shortcutCutOutFromDrawer(s),
        };
      },
      shortcutMouseDown: function (id, pid, e) {
        if (e.which && e.which !== 1) return; //只响应左键
        var isMouse = !e.changedTouches;//是否是鼠标事件，false为触屏；
        var downTime = Date.now();
        var fnGetPagePointFromEvent = function (event) {
          var p = {
            x: 0,
            y: 0,
          };
          if (!e.changedTouches) {
            //是鼠标
            p.x = event.pageX;
            p.y = event.pageY;
          } else {
            //是触屏
            var touches = event.changedTouches ? event.changedTouches : event.originalEvent.changedTouches;
            p.x = touches[0].pageX;
            p.y = touches[0].pageY;
          }
          return p;
        }; //该函数从触屏或鼠标点击获取pageX，pageY
        var point = fnGetPagePointFromEvent(e);
        var that = this;
        var isFromDrawer = pid !== null;
        var s = !isFromDrawer ? that.shortcuts[id] : that.shortcuts[pid].children[id];
        s.drag.mDown = true;
        s.drag.x = point.x;
        s.drag.y = point.y;
        s.drag.moved = 0;
        var fnDragOn = function (index) {
          var p = that.shortcutPosition(index, null);//得到图标目前的位置p
          var tid, tby, ton = false, tinsert = false, tover = false;
          that.shortcuts.forEach(function (t, i) {
            if (i === index) return;//忽略遍历自身
            var pt = that.shortcutPosition(i, null);
            var bx = pt.x - p.x;
            var by = pt.y - p.y;
            if (Math.abs(bx) < that.runtime.shortcutWidth / 4
              && Math.abs(by) < that.runtime.shortcutHeight / 2
            ) {
              tid = i;
              tby = by;
              ton = true;
              tinsert = by < -that.runtime.shortcutHeight * 0.3;
              tover = Math.abs(by) < that.runtime.shortcutHeight * 0.3;
            }
          });
          return {
            on: ton,
            id: tid,
            by: tby,
            insert: tinsert,
            over: tover,
          };
        };
        var fnMouseUp = function (e) {
          if (!s.drag.mDown) return;
          s.drag.mDown = false;
          if (!isFromDrawer) {
            //处理拖动位置网格吸附
            var dragTo = fnDragOn(id);
            if (dragTo.insert) {
              //拖动插入
              if (dragTo.id > id) {
                for (var i = dragTo.id - id; i > 0; i--) {
                  Yuri2.arrDownRecord(that.shortcuts, dragTo.id - i)
                }
              } else {
                for (var i = id - dragTo.id; i > 1; i--) {
                  Yuri2.arrUpRecord(that.shortcuts, dragTo.id + i)
                }
              }
            }

            if (dragTo.over) {
              //拖动覆盖
              var sOn = that.shortcuts[dragTo.id];
              if (!s.children && !sOn.children) {
                //1.图标vs图标 合并并生成组
                that.$set(that.shortcuts, dragTo.id, {
                  title: YL.lang("IconGroup") + YL.util.getID(),
                  drag: {
                    mDown: false,
                    left: 0,
                    top: 0,
                    x: 0,
                    y: 0,
                  },
                  children: [
                    sOn, s
                  ],
                });
                that.shortcuts.splice(id, 1)
              } else if (!s.children && sOn.children) {
                //2.图标vs组 进组
                sOn.children.push(s);
                that.shortcuts.splice(id, 1)
              } else if (s.children && !sOn.children) {
                //2.组vs图标 进组
                s.children.push(sOn);
                that.shortcuts[dragTo.id] = s;
                that.shortcuts.splice(id, 1)
              } else if (s.children && sOn.children) {
                //4.组vs组 合并组
                s.children.forEach(function (t) {
                  sOn.children.push(t);
                });
                that.shortcuts.splice(id, 1)
              }

            }

          } else {
            //抽屉内拖动(移动一定的距离就算是拖出去)
            if (that.shortcutCutOutFromDrawer(s)) {
              that.shortcuts.push(s);
              that.shortcuts[pid].children.splice(id, 1);
            }
          }
          if (s.drag.moved < 20 && Date.now() - downTime < 300) {
            that.shortcutOpen(s, id); //TODO 此处是否需要加延时操作
          }
          s.drag.moved = 0;
          s.drag.left = s.drag.top = 0;
          that.runtime.shortcutInsert = that.runtime.shortcutOver = null;

          //事件解绑
          if (isMouse) {
            $(document).unbind('mousemove', fnMouseMove);
            $(document).unbind('mouseup', fnMouseUp);
          } else {
            $(document).unbind('touchmove', fnMouseMove);
            $(document).unbind('touchend', fnMouseUp);
          }

        };
        var fnMouseMove = function (e) {
          if (!s.drag.mDown) return;
          var p = fnGetPagePointFromEvent(e);
          var x = p.x;
          var y = p.y;
          var dx = x - s.drag.x;
          var dy = y - s.drag.y;
          s.drag.left += dx;
          s.drag.top += dy;
          s.drag.x = x;
          s.drag.y = y;
          s.drag.moved += (Math.abs(dx) + Math.abs(dy));
          var dragTo = fnDragOn(id);
          if (dragTo.insert)//拖动插入的视觉提示
            that.runtime.shortcutInsert = dragTo.id;
          else
            that.runtime.shortcutInsert = null;

          if (dragTo.over) //拖动覆盖的视觉提示
            that.runtime.shortcutOver = dragTo.id;
          else
            that.runtime.shortcutOver = null;

        };
        if (isMouse) {
          $(document).mouseup(fnMouseUp);
          $(document).mousemove(fnMouseMove);
        } else {
          $(document).on('touchend', fnMouseUp);
          $(document).on('touchmove', fnMouseMove);
        }
      },
      shortcutCutOutFromDrawer: function (s) {
        return Math.abs(s.drag.left) + Math.abs(s.drag.top) > 1.5 * this.runtime.shortcutWidth;
      },
      shortcutContextMenu: function (id, pid, e, isDrawer) {
        var that = this;
        var s = pid === null ? that.shortcuts[id] : that.shortcuts[pid].children[id];
        var menu = [];
        if (s.children) {
          menu.push([
            YL.util.getStrFa('play-circle') + YL.lang("Open"),
            function (v) {
              that.shortcutOpen(s, id);
            }]);
        } else {
          menu.push(that.contextMenuOpen(s));
        }
        menu.push('|');
        if (s.children) {
          menu.push([
            YL.util.getStrFa('tags') + YL.lang("Rename"),
            function () {
              that.shortSetting = s;
            }, !YL.static.changeable
          ]);
          menu.push([
            YL.util.getStrFa('sitemap') + YL.lang("UnGroup"),
            function (v) {
              s.children.forEach(function (t) {
                that.shortcuts.splice(id + 1, 0, t);
              });
              that.shortcuts.splice(id, 1);
            }
            , !YL.static.changeable]);
        } else {
          var objCopy = Yuri2.jsonDeepCopy({
            title: s.title,
            hash: s.hash,
            params: s.params,
            app: s.app,
            style: s.style,
          });
          menu.push(that.contextMenuAddTo(objCopy));
          menu.push([
            YL.util.getStrFa('tags') + YL.lang("Rename") + "/" + YL.lang("Options"),
            function (v) {
              that.shortSetting = s;
            }
            , !YL.static.changeable]);
        }
        if (s.app && that.apps[s.app].badge) {
          menu.push([YL.util.getStrFa('map-pin') + YL.lang("ClearSuperscript"), function () {
            that.apps[s.app].badge = 0
          }, !YL.static.changeable])
        }
        menu.push('|');
        menu.push([
          YL.util.getStrFa('remove') + YL.lang("Delete"),
          function (v) {
            YL.util.simpleConfirm(Yuri2.template(YL.lang("DeleteIconConfirm"), s.title), function () {
              if (isDrawer) {
                that.shortcuts[pid].children.splice(id, 1);
              } else {
                that.shortcuts.splice(id, 1);
              }
            })
          }
          , !YL.static.changeable]);
        if (s.app) {
          menu.push(that.contextMenuUninstall(s.app));
        }
        ContextMenu.render(e, menu, this, "light");
      },
      shortcutGetDrawerBadge: function (id) {
        var g = this.shortcuts[id];
        var d = g.children;
        var count = 0;
        for (var i in d) {
          var s = d[i];
          var badge = parseInt(this.apps[s.app].badge);
          if (isNaN(badge)) {
            badge = 1;
          }
          count += badge;
        }
        return count;
      },
      menuItemClick: function (item) {
        this.appOpen(item.app, item, item)
      },
      msgClose: function (id) {
        var that = this;
        this.center.msg[id].hide = true;
        that.$delete(that.center.msg, id);
        that.center.msgNum--;
      },
      btnCenterClick: function () {
        if (this.center.open) {
          this.hideOpens();
        } else {
          this.hideOpens();
          this.center.open = true;
          this.center.unread = 0;
        }
      },
      btnCenterClear: function () {
        var that = this;
        for (var i in that.center.msg) {
          var m = that.center.msg[i];
          m.hide = true;
        }
        that.$set(that.center, 'msg', {});
        setTimeout(function () {
          that.center.unread = 0;
          that.center.msgNum = 0;
        }, 500);
        setTimeout(function () {
          that.center.open = false;
        }, 1500);
      },
      barContextMenu: function (e) {
        var that = this;
        var menu = [
          [YL.util.getStrFa('window-minimize') + YL.lang("HideAll"), function () {
            that.winHideAll()
          }],
          [YL.util.getStrFa('clone') + YL.lang("DisplayAll"), function () {
            that.winShowAll()
          }],
          [YL.util.getStrFa('window-close') + YL.lang("CloseAll"), function () {
            that.winCloseAll()
          }],
          "|"
        ];
        if (that.configs.topTaskBar) {
          menu.push([
            YL.util.getStrFa('arrow-down') + YL.lang("BottomTaskBar"),
            function () {
              that.configs.topTaskBar = false;
            }
          ], !YL.static.changeable)
        } else {
          menu.push([
            YL.util.getStrFa('arrow-up') + YL.lang("TopTaskBar"),
            function () {
              that.configs.topTaskBar = true;
            }
          ])
        }
        ContextMenu.render(e, menu, this);
      },
      tileContextMenu: function (groupIndex, tileIndex, e) {
        var that = this;
        var tile = that.tiles[groupIndex].data[tileIndex];
        var objCopy = Yuri2.jsonDeepCopy({
          title: tile.title,
          hash: tile.hash,
          params: tile.params,
          app: tile.app,
          style: tile.style,
        });
        var menu = [
          that.contextMenuOpen(tile),
          that.contextMenuAddTo(objCopy),
          [
            YL.util.getStrFa('tags') + YL.lang("Rename") + "/" + YL.lang("Options"),
            function (v) {
              that.shortSetting = tile;
            }, !YL.static.changeable
          ],
          "|",
          [YL.util.getStrFa('braille') + YL.lang("Small") + YL.lang("Size"), function () {
            tile.w = 1;
            tile.h = 1;
          }, !YL.static.changeable],
          [YL.util.getStrFa('braille') + YL.lang("Middle") + YL.lang("Size"), function () {
            tile.w = 2;
            tile.h = 2;
          }, !YL.static.changeable],
          [YL.util.getStrFa('braille') + YL.lang("Big") + YL.lang("Size"), function () {
            tile.w = 4;
            tile.h = 4;
          }, !YL.static.changeable],
        ];

        //处理磁贴转移到其他组的逻辑
        if (that.tiles.length > 1) {
          var moveMenu = [];
          that.tiles.forEach(function (t, n) {
            if (n === groupIndex) return;
            moveMenu.push([that.tiles[n].title, function () {
              that.tiles[groupIndex].data.splice(tileIndex, 1);
              var movedTile = Yuri2.jsonDeepCopy(tile);
              movedTile.y = 999;
              movedTile.x = 0;
              that.tiles[n].data.push(movedTile);
            }, !YL.static.changeable])

          });
          menu.push([YL.util.getStrFa('cut') + YL.lang("MoveTo"), moveMenu])
        }

        menu.push("|");
        menu.push([YL.util.getStrFa('remove') + YL.lang("Delete"), function () {
          YL.util.simpleConfirm(Yuri2.template(YL.lang("DeleteTileConfirm"), tile.title), function () {
            that.tiles[groupIndex].data.splice(tileIndex, 1);
          });
        }, !YL.static.changeable]);
        menu.push(that.contextMenuUninstall(tile.app));
        ContextMenu.render(e, menu, this);
      },
      tileSrcCustom: function (app) {
        return app.urlRandomToken ? YL.util.updateUrlRandomToken(app.customTile, '', this.runtime.customTileRandomToken) : app.customTile;
      },
      menuContextMenu: function (data) {
        var that = this;
        var item = data.item;
        var objCopy = Yuri2.jsonDeepCopy({
          title: item.title,
          hash: item.hash,
          params: item.params,
          app: item.app,
          style: item.style,
        });
        var itemId = data.id;
        var menu = [];

        if (item.app && !item.children) {
          menu = [
            that.contextMenuOpen(item),
            that.contextMenuAddTo(objCopy),
            [
              YL.util.getStrFa('tags') + YL.lang("Rename") + "/" + YL.lang("Options"),
              function (v) {
                that.shortSetting = item;
              }
              , !YL.static.changeable],
          ];
        } else {
          menu.push([
            YL.util.getStrFa('object-group') + YL.lang("NewSubgroup"),
            function () {
              var itemNew = {
                title: YL.lang("Group"),
                children: {},
                open: true,
              };
              that.setWithID(item.children, itemNew, 'itemPushed-');
            }
            , !YL.static.changeable]);
          menu.push([
            YL.util.getStrFa('tags') + YL.lang("Rename"),
            function () {
              that.shortSetting = item;
            }
            , !YL.static.changeable]);
        }
        menu.push('|');
        menu.push([
          YL.util.getStrFa('cut') + YL.lang("CutAndExchange"),
          function () {
            that.runtime.menuItemCut = itemId;
            YL.util.simpleMsg(item.title + " " + YL.lang("Recorded"));
          }
          , !YL.static.changeable]);
        if (that.runtime.menuItemCut) {
          menu.push([
            YL.util.getStrFa('paste') + YL.lang("Paste"),
            function () {
              var cut = that.runtime.menuItemCut;
              that.menuItemAction(cut, function (child, father) {
                if (father.children)
                  that.$delete(father.children, cut);
                else
                  that.$delete(father, cut);
                that.$set(item.children, cut, child)
              });
              that.runtime.menuItemCut = null;
            }
            , !YL.static.changeable]);
          menu.push([
            YL.util.getStrFa('exchange') + YL.lang("Exchange"), function () {
              var idA = itemId, childA, fatherA;
              var idB = that.runtime.menuItemCut, childB, fatherB;
              that.menuItemAction(idA, function (child, father) {
                childA = child;
                fatherA = father;
              });
              that.menuItemAction(idB, function (child, father) {
                childB = child;
                fatherB = father;
              });
              that.runtime.menuItemCut = null;
              try {
                fatherA[idA] = childB;
                fatherB[idB] = childA;
              } catch (e) {

              }
            }
            , !YL.static.changeable]);
        }
        menu.push("|");
        menu.push([
          YL.util.getStrFa('remove') + YL.lang("Delete"),
          function () {
            //递归删除依赖菜单
            YL.util.simpleConfirm(Yuri2.template(YL.lang("DeleteMenuConfirm"), item.title), function () {
              that.menuItemAction(itemId, function (child, father) {
                if (father.children)
                  that.$delete(father.children, itemId);
                else
                  that.$delete(father, itemId);
              });
            });
          }
          , !YL.static.changeable]);
        if (item.app) {
          menu.push(that.contextMenuUninstall(item.app));
        }
        ContextMenu.render(data.event, menu, this);
      },
      menuMainContextMenu: function (e) {
        var that = this;
        var menu = [
          [
            YL.util.getStrFa('object-group') + YL.lang("NewSubgroup"),
            function () {
              var item = {
                title: YL.lang("Group"),
                children: {},
                open: true,
              };
              that.setWithID(that.startMenu.menu, item, 'itemPushed-');
            }, !YL.static.changeable],
          [
            YL.util.getStrFa('paste') + YL.lang("Paste"),
            function () {
              var cut = that.runtime.menuItemCut;
              that.menuItemAction(cut, function (child, father) {
                if (father.children)
                  that.$delete(father.children, cut);
                else
                  that.$delete(father, cut);
                that.$set(that.startMenu.menu, cut, child)
              });
              that.runtime.menuItemCut = null;
            }, !YL.static.changeable],
        ];
        ContextMenu.render(e, menu, this);
      },
      menuItemAction: function (id, cb, father) {
        //递归寻找，callback(child,father)
        var that = this;
        var menu = father ? father.children : that.startMenu.menu;
        for (var i in menu) {
          var item = menu[i];
          if (i === id) {
            cb(item, menu);
          } else if (item.children) {
            that.menuItemAction(id, cb, item);
          }
        }
      },
      tilesBoxContextMenu: function (e) {
        var that = this;
        var menu = [
          [YL.util.getStrFa('object-group') + YL.lang("NewSubgroup"), function () {
            YL.addTileGroup();
          }], !YL.static.changeable];
        ContextMenu.render(e, menu, this);
      },
      backgroundToThemeColor: function () {
        var that = this;
        YL.util.imgUrlToThemeColor(this.runtime.wallpaper, function (color) {
          that.configs.themeColor = color;
        }, 0.6)
      },
      backgroundUpdateScale: function () {
        var that = this;
        var url = this.configs.wallpaper;
        YL.util.imgUrlToSize(url, function (size) {
          var width = size.width || 1;
          var height = size.height || 1;
          that.runtime.wallpaperScale = width / height;
        })
      },
      sidebarBtnContextMenu: function (i, e) {
        var that = this;
        var btn = that.startMenu.sidebar.btns[i];
        var objCopy = Yuri2.jsonDeepCopy({
          title: btn.title,
          hash: btn.hash,
          params: btn.params,
          app: btn.app,
          style: btn.style,
        });
        var menu = [
          that.contextMenuOpen(btn),
          that.contextMenuAddTo(objCopy),
          [YL.util.getStrFa('tags') + YL.lang("Rename") + "/" + YL.lang("Options"),
            function (v) {
              that.shortSetting = btn;
            }, !YL.static.changeable],
          "|",
          [
            YL.util.getStrFa('arrow-up') + YL.lang("ShiftUp"),
            function () {
              Yuri2.arrUpRecord(that.startMenu.sidebar.btns, i);
            }, !YL.static.changeable
          ],
          [
            YL.util.getStrFa('arrow-down') + YL.lang("ShiftDown"),
            function () {
              Yuri2.arrDownRecord(that.startMenu.sidebar.btns, i);
            }, !YL.static.changeable
          ],
          '|',
          [
            YL.util.getStrFa('remove') + YL.lang("Delete"),
            function () {
              YL.util.simpleConfirm(Yuri2.template(YL.lang("DeleteBtnConfirm"), btn.title), function () {
                that.startMenu.sidebar.btns.splice(i, 1);
              });
            }, !YL.static.changeable
          ],
          that.contextMenuUninstall(btn.app),
        ];
        ContextMenu.render(e, menu, this);
      },
      tilesTitleContextMenu: function (groupIndex, e) {
        var that = this;
        var group = that.tiles[groupIndex];
        var menu = [
          [YL.util.getStrFa('tags') + YL.lang("Rename"), function () {
            that.shortSetting = group;
          }, !YL.static.changeable],
          [YL.util.getStrFa('arrow-up') + YL.lang("ShiftUp"), function () {
            Yuri2.arrUpRecord(that.tiles, groupIndex)
          }, !YL.static.changeable],
          [YL.util.getStrFa('arrow-down') + YL.lang("ShiftDown"), function () {
            Yuri2.arrDownRecord(that.tiles, groupIndex)
          }, !YL.static.changeable],
          [YL.util.getStrFa('remove') + YL.lang("Delete"), function () {
            YL.util.simpleConfirm(Yuri2.template(YL.lang("DeleteGroupConfirm"), group.title), function () {
              that.tiles.splice(groupIndex, 1);
            })
          }, !YL.static.changeable],
        ];
        ContextMenu.render(e, menu, this);
      },
      tileMoved: function () {
        this.runtime.tileMoved = true;
      },
      tileMouseDown: function (e1) {
        var that = this;
        var x1 = e1.pageX;
        var y1 = e1.pageY;
        var fnMouseUp = function (e2) {
          var x2 = e2.pageX;
          var y2 = e2.pageY;
          if (Math.abs(x2 - x1) + Math.abs(y2 - y1) > 5) {
            that.runtime.tileMoved = true;
          }
          $(document).unbind('mouseup', fnMouseUp);
        };
        $(document).on("mouseup", fnMouseUp);
      },
      tileClick: function (tile) {
        if (!this.runtime.tileMoved) {
          //打开
          this.appOpen(tile.app, tile, tile)
        }
        this.runtime.tileMoved = false;
      },
      btnShortSettingAdvanceClick: function (appId) {
        //设置-高级按钮
        this.shortSetting = null;
        YL.open('yl-system', { data: { appSetting: appId } })
      },
      shortSettingParamsAdd: function () {
        //新增图标param属性 按钮点击
        if (this.runtime.shortcutNewParamName && this.runtime.shortcutNewParamValue) {
          if (!this.shortSetting.params) {
            this.$set(this.shortSetting, 'params', {})
          }
          this.$set(this.shortSetting.params, this.runtime.shortcutNewParamName, this.runtime.shortcutNewParamValue);
          this.runtime.shortcutNewParamName = '';
          this.runtime.shortcutNewParamValue = '';
        }
      },
      shortSettingParamsDelete: function (name) {
        this.$delete(this.shortSetting.params, name);
      },
      startMenuResizeMouseDown: function (e) {
        //拖动逻辑
        var that = this;
        var startMenu = that.runtime.startMenu;
        startMenu.drag.x = e.pageX;
        startMenu.drag.y = e.pageY;
        startMenu.drag.mDown = true;
        var fnMouseUp = function (e) {
          if (!startMenu.drag.mDown) return;
          startMenu.drag.mDown = false;
          $(document).unbind('mouseup', fnMouseUp);
          $(document).unbind('mousemove', fnMouseMove);
        };
        var fnMouseMove = function (e) {
          if (!startMenu.drag.mDown) return;
          var minWidth = 320;
          var minHeight = 160;
          var x = e.pageX;
          var y = e.pageY;
          that.startMenu.width += (x - startMenu.drag.x);
          (that.startMenu.width) > minWidth || (that.startMenu.width = minWidth);
          that.startMenu.height -= (that.configs.topTaskBar?-1:1)*(y - startMenu.drag.y);
          (that.startMenu.height) > minHeight || (that.startMenu.height = minHeight);
          startMenu.drag.x = x;
          startMenu.drag.y = y;
          that.onResize();
        };
        $(document).mouseup(fnMouseUp);
        $(document).mousemove(fnMouseMove);
      },
    },
    watch: {
      "shortSetting": {
        handler: function (val, oldVal) {
          if (val) {
            this.drawer = null;
          }
        }
      },
      "configs.wallpaper": {
        handler: function (val, oldVal) {
          var that = this;
          var img = new Image();
          img.src = val;
          img.onload = function () {
            that.runtime.wallpaper = val;
            if (that.configs.autoThemeColor) {
              that.backgroundToThemeColor()
            }
          };
          that.backgroundUpdateScale()
        }
      },
      'wins': {
        handler: function (val, oldVal) {
          var count = 0;
          for (var i in this.wins) {
            var win = this.wins[i];
            if (!win.plugin) {
              count++;
            }
          }
          this.runtime.winOpened = count;
        }
      },
      "startMenu.open": {
        handler: function (val, oldVal) {
          //修复磁贴在全屏切换时布局混乱的bug,人为发出一个resize事件
          if (val) {
            this.$nextTick(YL.util.artificiallyResize);
          }
        }
      },
      "startMenu.menu": {
        // deep: true,
        handler: function (val, oldVal) {
          this.$nextTick(YL.util.artificiallyResize);
        }
      }
    },
    computed: {
      smallScreenAndMenuOpend: function () {
        return this.runtime.isSmallScreen && this.startMenu.open
      },
      tilesBoxStyle: function () {
        var width = this.runtime.clientSize.width;
        if (this.runtime.isSmallScreen) {
          var left;
          left = 48 + (this.runtime.menuOnLeft ? width : 0);
        }

        return {
          left: this.runtime.isSmallScreen ? left + "px" : '312px',
        }
      },
      menuStyle: function () {
        var width = this.runtime.clientSize.width;
        if (this.runtime.isSmallScreen) {
          return {
            left:  (48 + (this.runtime.menuOnLeft ? 0 : -width))+'px',
          }
        }
        else return {};
      },
      barStyle: function () {
        if (this.configs.topTaskBar) {
          return {
            top: 0,
            bottom: "none",
          }
        }
      },
      centerStyle: function () {
        if (this.configs.topTaskBar) {
          return {
            top: 40 + "px",
          }
        } else {
          return {
            bottom: 40 + "px",
          }
        }
      },
      backgroundCross: function () {
        var r = this.runtime;
        return r.wallpaperScale < r.clientSize.width / r.clientSize.height;
      }
    },
  });
};
