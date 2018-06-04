YL.onLoad(function () {
  var loadFromFile = function (file) {
    //文件启动
    file = file || 'basic';
    var save = /^\w+$/.test(file) ? './saves/' + file + '.json' : file;
    Yuri2.loadContentFromUrl(save, 'GET', function (err, text) {
      if (!err) {
        var data = JSON.parse(text);
        YL.onReady(function () {
          setTimeout(function () {
            YL.msg("欢迎使用" + YL.static.softwareName, Yuri2.template("当前版本:${0}<br/>已读取文件数据 ${1}", YL.static.version, save));
          }, 1000);
        });
        YL.init(data);
      }
    });
  };
  var urlParsed = Yuri2.parseURL();
  var load = urlParsed.params.load;
  if (load) {
    loadFromFile(load);
  } else {
    loadFromFile('basic');
  }
});