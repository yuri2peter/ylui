/**
 * 读取配置示例文件
 * 修改此文件来实现持久化
 * YL.init(data) 中的data必须是ylui接受的数据格式
 * 开发者可以自行决定从静态文件读取（如basic.json）还是从远程服务器拉取（如ajax请求）
 */

YL.onLoad(function () {
  // 读取url中load参数，如localhost/ylui/index.html?load=basic
  var load = Yuri2.parseURL().params.load;
  var file;
  // 当load === 'ylui-storage'时，尝试加载浏览器缓存
  if (load === YL.static.localStorageName && localStorage.getItem(YL.static.localStorageName)) {
    YL.init();
    return;
  } else if (load === YL.static.localStorageName) {
    file = 'basic';
  }
  // 从json文件读取
  file = file || load || 'basic';
  var save = /^\w+$/.test(file) ? './saves/' + file + '.json' : file;
  Yuri2.loadContentFromUrl(save, 'GET', function (err, text) {
    if (!err) {
      var data = JSON.parse(text);
      YL.init(data);
    } else {
      alert('YLUI读取配置错误，初始化失败');
    }
  });
});
