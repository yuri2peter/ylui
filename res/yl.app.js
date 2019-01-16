window.YLApp = {
  EVENTS: {
    DATA_CHANGED: 'dataChanged',
    OPEN: 'open',
    CLOSE: 'close',
    DESKTOP_MOUSE_MOVE: 'desktopMouseMove',
    DESKTOP_MOUSE_DOWN: 'desktopMouseDown',
    DESKTOP_MOUSE_UP: 'desktopMouseUp',
    DESKTOP_CLICK: 'desktopClick',
    RESIZE: 'resize',
  },
  METHODS: {
    GET_ID: 'getID',
    GET_VERSION: 'getVersion',
    HISTORY_BACK: 'historyBack',
    HISTORY_BACK_AVAILABLE: 'historyBackAvailable',
    HISTORY_FORWARD: 'historyForward',
    HISTORY_FORWARD_AVAILABLE: 'historyForwardAvailable',
    REFRESH: 'refresh',
    SET_WIN_DATA: 'setWinData',
    GET_WIN_DATA: 'getWinData',
    SET_WALLPAPER: 'setWallpaper',
    SET_THEME_COLOR: 'setThemeColor',
    GET_CONFIGS: 'getConfigs',
    GET_RUNTIME: 'getRuntime',
    OPEN: 'open',
    CLOSE: 'close',
    MINIMIZE: 'minimize',
    MAXIMIZE: 'maximize',
    HIDE: 'hide',
    SHOW: 'show',
    RESTORE: 'restore',
    MSG: 'msg',
    SIMPLE_MSG: 'simpleMsg',
    SET_APP_BADGE: 'setAppBadge',
    GET_APP_VERSION: 'getAppVersion',
    UNINSTALL: 'uninstall',
    IMPORT: 'import',
    EXPORT: 'export',
    EVAL: 'eval',
    SETUP: 'setup',
  },
  _idCounter: 0,
  _cbs: {},
  _cbReady: null,
  _created: false,
  _cbEvent: function () {
  },
  id: "",
  secrete: '',
  data: null,
  oldHref: "",
  /**
   * @param event string 事件名
   * @param data 数据
   * @param target 发送目标，可以是单个id，id数组，或者true（发送给所有窗口）
   * */
  emit: function (event, data, target) {
    var session = this._idCounter++;
    parent.postMessage({
      from: [YLApp.id, YLApp.secrete],
      type: "ylui-emit",
      session: session,
      emit: {
        event: event,
        data: data,
        target: target
      }
    }, "*")
  },
  eval: function (method, data, cb) {
    var session = this._idCounter++;
    this._cbs[session] = cb;
    parent.postMessage({
      from: [YLApp.id, YLApp.secrete],
      type: "ylui-eval",
      session: session,
      eval: {
        method: method,
        data: data,
      }
    }, "*")
  },
  open: function (url) {
    this.eval('open', [{
      url: url,
    }]);
  },
  onEvent: function (cb) {
    this._cbEvent = cb;
  },
  onReady: function (cb) {
    if (this._cbReady === false) return; //只允许ready一次
    if (!cb) {
      cb = function () {
      }
    }
    this._cbReady = cb;
  },
  hashBugForIeFix: function () {
    document.body.focus(); //hash的bug，兼容IE
  },
  getWinObject: function (id) {
    //获取同域的子窗体句柄
    try {
      var win = parent.YL.vue.wins[id];
      var idIframe = win.idIframe;
      var iframe = parent.document.getElementById(idIframe);
      return iframe.contentWindow;
    } catch (e) {
      return null;
    }
  },
};

var ylOnMessage = function (message) {
  var msg = message.data;
  switch (msg.type) {
    case "ylui-ping":
      if (YLApp.id) {
        parent.postMessage({
          from: [YLApp.id, YLApp.secrete],
          type: "ylui-pong",
        }, "*");
        if (YLApp._cbReady) {
          var relCbReady = YLApp._cbReady(); //执行ready的回调
          YLApp._cbReady = false;//清空ready
          if (relCbReady !== false)
            YLApp.emit('ready', null, true); //发送ready事件
        }
        if (!YLApp._created) {
          YLApp.eval('getWinData', {}, function (data) {
            if (data.title === '') {
              YLApp.eval('setWinData', { title: document.title });
            }
          });
          //F5屏蔽大法
          var check = function (e) {
            e = e || window.event;
            if ((e.which || e.keyCode) === 116) {
              if (e.preventDefault) {
                e.preventDefault();
                // window.location.reload();
                YLApp.eval('refresh', window.YLApp.id);
              } else {
                event.keyCode = 0;
                e.returnValue = false;
                // window.location.reload();
                YLApp.eval('refresh', window.YLApp.id);
              }
            }
          };

          if (document.addEventListener) {
            document.addEventListener("keydown", check, false);
          } else {
            document.attachEvent("onkeydown", check);
          }

          YLApp._created = true;
        }
      } else {
        YLApp.id = msg.id;
        YLApp.secrete = msg.secrete;
        YLApp.data = msg.data;
        //实时更新url
        var url = location.href;
        if (YLApp.oldHref !== url) {
          YLApp.oldHref = url;
          YLApp.eval('urlRel', url);
        }
      }
      break;
    case "ylui-eval":
      var session = msg.session;
      var rel = msg.result;
      if (YLApp._cbs[session]) {
        YLApp._cbs[session](rel);
      }
      break;
    case "ylui-event":
      YLApp._cbEvent(msg);
      break;
  }
};


if (window.attachEvent) {
  window.attachEvent('message', ylOnMessage)
} else {
  window.addEventListener('message', ylOnMessage)
}