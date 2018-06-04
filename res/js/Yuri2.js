/**
 * Created by Yuri2 on 2016/12/9.
 * Updated on 2018/3/30.
 */



//原型丰富

Date.prototype.format = function (fmt) { //author: meizz
  if (!fmt) {
    fmt = 'yyyy-MM-dd hh:mm:ss';
  }
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
};

Array.unique = function (arr) {
  var newArray = [];
  var oldArray = arr;
  if (oldArray.length <= 1) {
    return oldArray;
  }
  for (var i = 0; oldArray.length > 0; i++) {
    //要一直把oldArray pop完为止.所以长度会一直变短。所以不能用i < oldArray.length的形式来判断是否完成.
    newArray.push(oldArray.shift()); //oldArray从最前面开始移出数组元素，这样新数组的顺序不会变。
    for (var j = 0; j < oldArray.length; j++) {
      if (newArray[i] === oldArray[j]) {
        oldArray.splice(j, 1);//删除重复的元素
        j--;
      }
    }
  }
  return newArray;
};

Array.in_array = function (needle, arrayToSearch) {
  for (s = 0; s < arrayToSearch.length; s++) {
    thisEntry = arrayToSearch[s].toString();
    if (thisEntry === needle) {
      return true;
    }
  }
  return false;
};

/**
 *
 *  Base64 encode / decode
 *
 *  @author haitao.tu
 *  @date   2010-04-26
 *  @email  tuhaitao@foxmail.com
 *
 */
function Base64() {

  // private property
  _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

  // public method for encoding
  this.encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
  };

  // public method for decoding
  this.decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
  };

  // private method for UTF-8 encoding
  _utf8_encode = function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  };

  // private method for UTF-8 decoding
  _utf8_decode = function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
}

/** 事件 */
var Event = {
  // 通过on接口监听事件eventName
  // 如果事件eventName被触发，则执行callback回调函数
  on: function (eventName, callback) {
    //你的代码
    if (!this.handles) {
      //this.handles={};
      Object.defineProperty(this, "handles", {
        value: {},
        enumerable: false,
        configurable: true,
        writable: true
      })
    }

    if (!this.handles[eventName]) {
      this.handles[eventName] = [];
    }
    this.handles[eventName].push(callback);
  },
  // 触发事件 eventName
  emit: function (eventName) {
    //你的代码
    if (this.handles[arguments[0]]) {
      for (var i = 0; i < this.handles[arguments[0]].length; i++) {
        this.handles[arguments[0]][i](arguments[1]);
      }
    }
  }
};

//Yuri2 助手
var Yuri2 = {
  log: function (content) {
    if (console && typeof (console.log) === 'function') {
      console.log(content)
    }
  },
  f5: function () {
    location.reload()
  },
  getArrayKeys: function (myhash) {
    var keys = [];
    for (key in myhash) {
      keys.push(key);
    }
    return keys;
  },
  submitForm: function (action, params) {
    var form = $("<form></form>");
    form.attr('action', action);
    form.attr('method', 'post');
    form.attr('target', '_self');
    for (param in params) {
      var input1 = $("<input type='hidden' name='" + param + "' />");
      input1.val(params[param]);
      form.append(input1);
    }
    form.appendTo("body");
    form.css('display', 'none');
    form.submit();
  },
  formValidator: function (data) {
    function check(e) {
      var reg = $(e)[0].gear_reg;
      var preg_rel = reg.test($(e).val());
      if (preg_rel) {
        $(e).css('color', 'green');
        $(e).css('border-color', 'rgba(80, 212, 84, 0.9)');
        $(e).removeClass('gear-valid-failed');
      } else {
        $(e).css('color', 'red');
        $(e).css('border-color', 'rgba(239, 104, 104, 0.51)');
        $(e).addClass('gear-valid-failed');
      }
    }

    for (field in data.fields) {
      var ipt = $(data.form + " input[name='" + field + "']");
      if (ipt.length === 0) {
        ipt = $(data.form + " select[name='" + field + "']")
      }
      if (ipt.length === 0) {
        ipt = $(data.form + " textarea[name='" + field + "']")
      }
      ipt[0].gear_reg = data.fields[field];
      ipt.bind('input propertychange change', function () {
        check(this)
      });
      check(ipt)
    }
    $(data.form).submit(function () {
      var valid_fails = $(this).find('.gear-valid-failed');
      var errors = valid_fails.length;
      if (errors > 0) {
        alert('验证失败，请检查输入。\r\nValidation failed, please check the input.');
        return false;
      }
    })
  },
  timestampToDate: function (timestamp, format) {
    format = format ? format : 'yyyy-MM-dd hh:mm:ss';
    var newDate = new Date();
    newDate.setTime(timestamp * 1000);
    return (newDate.format(format));
  },
  isPC: function () {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone",
      "SymbianOS", "Windows Phone",
      "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  },
  isSmallScreen: function (size) {
    if (!size) {
      size = 768
    }
    var width = document.body.clientWidth;
    return width < size;
  },
  clone: function (obj) {
    var o;
    if (typeof obj === "object") {
      if (obj === null) {
        o = null;
      } else {
        if (obj instanceof Array) {
          o = [];
          for (var i = 0, len = obj.length; i < len; i++) {
            o.push(Yuri2.clone(obj[i]));
          }
        } else {
          o = {};
          for (var j in obj) {
            o[j] = Yuri2.clone(obj[j]);
          }
        }
      }
    } else {
      o = obj;
    }
    return o;
  },
  isSet: function (v) {
    {
      return !((typeof (v) === 'undefined') || (v === null));
    }
  },
  /** @deprecated */
  in_array: function (stringToSearch, arrayToSearch) {
    for (s = 0; s < arrayToSearch.length; s++) {
      thisEntry = arrayToSearch[s].toString();
      if (thisEntry === stringToSearch) {
        return true;
      }
    }
    return false;
  },
  isArray: function (o) {
    return Object.prototype.toString.call(o) === '[object Array]';
  },
  /**
   * 合并两个json对象属性为一个对象
   * @param jsonObject1
   * @param jsonObject2
   * @param recursion (remain default)
   * @returns object resultJsonObject
   */
  jsonMerge: function (jsonObject1, jsonObject2, recursion) {
    var resultJsonObject = {};
    for (var attr in jsonObject1) {
      resultJsonObject[attr] = jsonObject1[attr];
    }
    for (var attr in jsonObject2) {
      resultJsonObject[attr] =
        recursion === true &&
        !this.isArray(resultJsonObject[attr]) &&
        !this.isArray(jsonObject2[attr]) &&
        recursion === true &&
        typeof (resultJsonObject[attr]) === 'object' &&
        typeof (jsonObject2[attr]) === 'object' ?
          Yuri2.jsonMerge(resultJsonObject[attr], jsonObject2[attr], false) : jsonObject2[attr];
    }
    return resultJsonObject;
  },
  randInt: function (n, m) {
    var c = m - n + 1;
    return Math.floor(Math.random() * c + n);
  },
  shuffle: function (arr) {
    var i,
      j,
      temp;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  },
  htmlspecialchars: function (str) {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/'/g, '&#039;');
    return str;
  },
  htmlspecialchars_decode: function (str) {
    str = str.replace(/&amp;/g, '&');
    str = str.replace(/&lt;/g, '<');
    str = str.replace(/&gt;/g, '>');
    str = str.replace(/&quot;/g, "''");
    str = str.replace(/&#039;/g, "'");
    return str;
  },
  textOverFlow: function (str, len) {
    return str.length > len ? str.substring(0, len) + "..." : str;
  },
  getLang: function () {
    return (navigator.language || navigator.browserLanguage).toLowerCase();
    //通常是 zh-cn
  },
  iframeOnClick: {
    resolution: 200,
    iframes: [],
    interval: null,
    Iframe: function () {
      this.element = arguments[0];
      this.cb = arguments[1];
      this.hasTracked = false;
    },
    track: function (element, cb) {
      this.iframes.push(new this.Iframe(element, cb));
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
  /**
   * jsonp  请求
   * @param url string
   * @param data json
   * @param callback callback
   * @param name_data string
   * @param name_callback string
   * */
  jsonp: function (url, data, callback, name_data, name_callback) {
    name_data || (name_data = 'data');
    name_callback || (name_callback = 'callback');
    var func_name = Math.random();
    if (!Yuri2.jsonp_funcs) {
      Yuri2.jsonp_funcs = {};
    }
    Yuri2.jsonp_funcs[func_name] = callback;
    var rel = '';
    rel += url;
    if (url.indexOf('?') < 0) {
      rel += '?';
    }
    if (url.indexOf('&') > 0) {
      rel += '&';
    }
    rel += name_callback + '=' + encodeURIComponent('Yuri2.jsonp_funcs["' + func_name + '"]');
    if (data) {
      var data_str = JSON.stringify(data);
      data_str = encodeURIComponent(data_str);
      rel += '&' + name_data + '=' + data_str;
    }
    Yuri2.loadScript(rel, function (script) {
      script.parentNode.removeChild(script);
    })

  },
  heredoc: function (fn) {
    //var tmpl = heredoc(function(){/* abcdefg  */})  可以优雅的解决多行文本问题
    return fn.toString().split('\n').slice(1, -1).join('\n') + '\n'
  },
  getClientSize: function () {
    var clientHeight = document.body.clientHeight;
    var clientWidth = document.body.clientWidth;
    return {
      width: clientWidth,
      height: clientHeight,
    };
  },
  wait: function (condition, callback) {
    var itv = setInterval(function () {
      if (condition) {
        clearInterval(itv);
        callback();
      }
    }, 100)
  },
  jsonDeepCopy: function (obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  jsonFormat: function (json) {
    if (typeof json !== 'object') {
      json = JSON.parse(json);
    }
    var formatted = JSON.stringify(json, null, 4);
    return formatted;
  },
  //保存文本文件
  saveAs: (function (view) {
    "use strict";
    // IE <10 is explicitly unsupported
    if (typeof view === "undefined" || typeof navigator !== "undefined" && /MSIE [1-9]\./.test(navigator.userAgent)) {
      return;
    }
    var
      doc = view.document
      // only get URL when necessary in case Blob.js hasn't overridden it yet
      , get_URL = function () {
        return view.URL || view.webkitURL || view;
      }
      , save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a")
      , can_use_save_link = "download" in save_link
      , click = function (node) {
        var event = new MouseEvent("click");
        node.dispatchEvent(event);
      }
      , is_safari = /constructor/i.test(view.HTMLElement) || view.safari
      , is_chrome_ios = /CriOS\/[\d]+/.test(navigator.userAgent)
      , throw_outside = function (ex) {
        (view.setImmediate || view.setTimeout)(function () {
          throw ex;
        }, 0);
      }
      , force_saveable_type = "application/octet-stream"
      // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
      , arbitrary_revoke_timeout = 1000 * 40 // in ms
      , revoke = function (file) {
        var revoker = function () {
          if (typeof file === "string") { // file is an object URL
            get_URL().revokeObjectURL(file);
          } else { // file is a File
            file.remove();
          }
        };
        setTimeout(revoker, arbitrary_revoke_timeout);
      }
      , dispatch = function (filesaver, event_types, event) {
        event_types = [].concat(event_types);
        var i = event_types.length;
        while (i--) {
          var listener = filesaver["on" + event_types[i]];
          if (typeof listener === "function") {
            try {
              listener.call(filesaver, event || filesaver);
            } catch (ex) {
              throw_outside(ex);
            }
          }
        }
      }
      , auto_bom = function (blob) {
        // prepend BOM for UTF-8 XML and text/* types (including HTML)
        // note: your browser will automatically convert UTF-16 U+FEFF to EF BB BF
        if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
          return new Blob([String.fromCharCode(0xFEFF), blob], { type: blob.type });
        }
        return blob;
      }
      , FileSaver = function (blob, name, no_auto_bom) {
        if (!no_auto_bom) {
          blob = auto_bom(blob);
        }
        // First try a.download, then web filesystem, then object URLs
        var
          filesaver = this
          , type = blob.type
          , force = type === force_saveable_type
          , object_url
          , dispatch_all = function () {
            dispatch(filesaver, "writestart progress write writeend".split(" "));
          }
          // on any filesys errors revert to saving with object URLs
          , fs_error = function () {
            if ((is_chrome_ios || (force && is_safari)) && view.FileReader) {
              // Safari doesn't allow downloading of blob urls
              var reader = new FileReader();
              reader.onloadend = function () {
                var url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                var popup = view.open(url, '_blank');
                if (!popup) view.location.href = url;
                url = undefined; // release reference before dispatching
                filesaver.readyState = filesaver.DONE;
                dispatch_all();
              };
              reader.readAsDataURL(blob);
              filesaver.readyState = filesaver.INIT;
              return;
            }
            // don't create more object URLs than needed
            if (!object_url) {
              object_url = get_URL().createObjectURL(blob);
            }
            if (force) {
              view.location.href = object_url;
            } else {
              var opened = view.open(object_url, "_blank");
              if (!opened) {
                // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                view.location.href = object_url;
              }
            }
            filesaver.readyState = filesaver.DONE;
            dispatch_all();
            revoke(object_url);
          }
        ;
        filesaver.readyState = filesaver.INIT;

        if (can_use_save_link) {
          object_url = get_URL().createObjectURL(blob);
          setTimeout(function () {
            save_link.href = object_url;
            save_link.download = name;
            click(save_link);
            dispatch_all();
            revoke(object_url);
            filesaver.readyState = filesaver.DONE;
          });
          return;
        }

        fs_error();
      }
      , FS_proto = FileSaver.prototype
      , saveAs = function (blob, name, no_auto_bom) {
        return new FileSaver(blob, name || blob.name || "download", no_auto_bom);
      }
    ;
    // IE 10+ (native saveAs)
    if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
      return function (blob, name, no_auto_bom) {
        name = name || blob.name || "download";

        if (!no_auto_bom) {
          blob = auto_bom(blob);
        }
        return navigator.msSaveOrOpenBlob(blob, name);
      };
    }

    FS_proto.abort = function () {
    };
    FS_proto.readyState = FS_proto.INIT = 0;
    FS_proto.WRITING = 1;
    FS_proto.DONE = 2;

    FS_proto.error =
      FS_proto.onwritestart =
        FS_proto.onprogress =
          FS_proto.onwrite =
            FS_proto.onabort =
              FS_proto.onerror =
                FS_proto.onwriteend =
                  null;

    return saveAs;
  }(
    typeof self !== "undefined" && self
    || typeof window !== "undefined" && window
    || this.content
  )),
  getQueryString: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return (r[2]);
    return null;
  },

  /**
   *@param {string} url 完整的URL地址
   *@returns {object} 自定义的对象
   *@description 用法示例：var myURL = parseURL('http://abc.com:8080/dir/index.html?id=255&m=hello#top');
   myURL.file='index.html'

   myURL.hash= 'top'

   myURL.host= 'abc.com'

   myURL.query= '?id=255&m=hello'

   myURL.params= Object = { id: 255, m: hello }

   myURL.path= '/dir/index.html'

   myURL.segments= Array = ['dir', 'index.html']

   myURL.port= '8080'

   myURL.protocol= 'http'

   myURL.source= 'http://abc.com:8080/dir/index.html?id=255&m=hello#top'

   */
  parseURL: function (url) {
    url || (url = location.href);
    var a = document.createElement('a');
    a.href = url;
    a.href = a.href; //神奇的代码，借助a标签把相对路径转换为绝对路径
    return {
      source: url,
      protocol: a.protocol.replace(':', ''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function () {
        var ret = {},
          seg = a.search.replace(/^\?/, '').split('&'),
          len = seg.length, i = 0, s;
        for (; i < len; i++) {
          if (!seg[i]) {
            continue;
          }
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }
        return ret;
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
      hash: a.hash.replace('#', ''),
      path: a.pathname.replace(/^([^\/])/, '/$1'),
      relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
      segments: a.pathname.replace(/^\//, '').split('/')
    };
  },

  myBrowser: function () {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    if (userAgent.indexOf("Opera") > -1) {
      return "Opera"
    }
    if (userAgent.indexOf("Firefox") > -1) {
      return "FF";
    }
    if (userAgent.indexOf("Chrome") > -1) {
      return "Chrome";
    }
    if (userAgent.indexOf("Safari") > -1) {
      return "Safari";
    }
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
      return "IE";
    }
  },

  isIE: function () {
    return this.myBrowser() === 'IE';
  },

  evalObj: function (str) {
    return eval("(" + str + ")");
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
  // 交换数组元素
  arrSwapItems: function (arr, index1, index2) {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0];
    return arr;
  },

  // 上移
  arrUpRecord: function (arr, $index) {
    if ($index === 0) {
      return;
    }
    this.arrSwapItems(arr, $index, $index - 1);
  },

  // 下移
  arrDownRecord: function (arr, $index) {
    if ($index === arr.length - 1) {
      return;
    }
    this.arrSwapItems(arr, $index, $index + 1);
  },
  inArray: function (array, needle) {
    for (var i = 0; i < array.length; i++) {
      if (needle === array[i]) return true;
    }
    return false;
  },
  template: function () {
    //字符串模板 template('ab${0}de${1}g','C','F')
    var num = arguments.length;
    var oStr = arguments[0];
    for (var i = 1; i < num; i++) {
      var pattern = "\\$\\{" + (i - 1) + "\\}";
      var re = new RegExp(pattern, "g");
      oStr = oStr.replace(re, arguments[i]);
    }
    return oStr;
  },
  strToDate: function (str) {
    var arr = t.time.split(/[- : \/]/);
    return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
  },
};

