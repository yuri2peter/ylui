var YL = parent.YL;
YLApp.onReady(function () {
    YLApp.onEvent(function (e) {
        switch (e.event) {
            case "setColorFromColorPicker":
                var color = e.data;
                if ('colors' === vue.navActive) {
                    vue.colorChoose = color;

                }
                if ('app-manager' === vue.navActive) {
                    vue.appSetting.icon.bg = color;
                }
                break;
            case "dataChanged" :
                if(e.from===0){
                    vue.ondataChanged();
                }
        }
    });

    var vue = new Vue({
        el: "#app",
        created: function () {
            document.body.focus();
            var that = this;
            if(YL.static.changeable&&YL.static.dataCenter){
                this.loadApps();
                if (YLApp.data.nav) {
                    this.navActive = YLApp.data.nav;
                }
                if (YLApp.data.appSetting) {
                    this.appSetting = this.apps[YLApp.data.appSetting];
                }
                this.syncData();
                this.refreshData();
            }else{
                this.navActive ="aboutUs";
            }
            var fnResize = function () {
                var clientSize = Yuri2.getClientSize();
                that.isSmallScreen = clientSize.width <= 768;
            };
            fnResize();
            $(window).resize(fnResize);
            $("body").css("opacity", 1);
        },
        data: {
            navActive: 'app-manager',
            navs: {
                "app-manager": {
                    icon: "puzzle-piece",
                    text: YL.lang('AppManager'),
                    disable:!YL.static.changeable
                },
                "colors": {
                    icon: "paint-brush",
                    text: YL.lang('Color'),
                    disable:!YL.static.changeable
                },
                "wallpaper": {
                    icon: "image",
                    text: YL.lang('Wallpaper'),
                    disable:!YL.static.changeable
                },
                "others": {
                    icon: "tasks",
                    text: YL.lang('Others'),
                    disable:!YL.static.changeable
                },
                "data-manage": {
                    icon: "database",
                    text: YL.lang('DataManager'),
                    disable:!(YL.static.changeable&&YL.static.dataCenter)
                },
                "YLUI": {
                    icon: "yoast",
                    text: 'YLUI',
                },
                "aboutUs": {
                    icon: "info-circle",
                    text: YL.lang('AboutUs'),
                },
            },
            apps: {},
            appSearchWords: "",
            colors: [
                "#FFB900",
                "#FF8C00",
                "#F7630C",
                "#CA5010",
                "#DA3B01",
                "#EF6950",
                "#D13438",
                "#D13438",
                "#E74856",
                "#E81123",
                "#EA005E",
                "#C30052",
                "#E3008C",
                "#BF0077",
                "#C239B3",
                "#9A0089",
                "#0078D7",
                "#0063B1",
                "#8E8CD8",
                "#6B69D6",
                "#8764B8",
                "#744DA9",
                "#B146C2",
                "#881798",
                "#0099BC",
                "#2D7D9A",
                "#00B7C3",
                "#038387",
                "#00B294",
                "#018574",
                "#00CC6A",
                "#10893E",
                "#7A7574",
                "#5D5A58",
                "#68768A",
                "#515C6B",
                "#567C73",
                "#486860",
                "#498205",
                "#107C10",
                "#767676",
                "#4C4A48",
                "#69797E",
                "#4A5459",
                "#647C64",
                "#525E54",
                "#847545",
                "#7E735F",
            ],
            colorChoose: '',
            autoThemeColor: false,
            themeColorNow: '',
            wallpaperNow: '',
            wallpapers: [],
            wallpaperBlur: false,
            wallpaperSlide: false,
            wallpaperSlideRandom: false,
            wallpaperSlideItv: 5,
            wallpaperAddUrl: '',
            openMax: 9,
            topTaskBar: false,
            activeAppId: null,
            textData: '',
            btnEnableLoading: false,
            appSetting: null,//app高级配置
            appSettingForm: {},
            isSmallScreen: false,//是否小屏幕
            dataChanged:false,
        },
        watch: {
            appSetting: {
                handler: function (val, oldVal) {
                    if (!val) {
                        YL.vue.$set(YL.vue, 'apps', Yuri2.jsonDeepCopy(this.apps));
                        layer.msg("已保存");
                    }
                }
            },
            colorChoose: {
                handler: function (val, oldVal) {
                    if (!this.autoThemeColor) {
                        YL.vue.configs.themeColor = val;
                    }
                }
            },
            autoThemeColor: {
                handler: function (val, oldVal) {
                    YL.vue.configs.autoThemeColor = val;
                    if (val)
                        YL.vue.backgroundToThemeColor();
                    else
                        YL.vue.configs.themeColor = this.colorChoose;
                }
            },
            wallpaperBlur: {
                handler: function (val, oldVal) {
                    YL.vue.configs.wallpaperBlur = this.wallpaperBlur;
                }
            },
            wallpaperSlide: {
                handler: function (val, oldVal) {
                    YL.vue.configs.wallpaperSlide = this.wallpaperSlide;
                }
            },
            wallpaperSlideRandom: {
                handler: function (val, oldVal) {
                    YL.vue.configs.wallpaperSlideRandom = this.wallpaperSlideRandom;
                }
            },
            wallpaperSlideItv: {
                handler: function (val, oldVal) {
                    YL.vue.configs.wallpaperSlideItv = this.wallpaperSlideItv;
                }
            },
            topTaskBar: {
                handler: function (val, oldVal) {
                    YL.vue.configs.topTaskBar = this.topTaskBar;
                }
            },
            openMax: {
                handler: function (val, oldVal) {
                    YL.vue.configs.openMax = this.openMax;
                }
            },
        },
        computed: {
            // 计算属性的 getter
            wallpaperNowFixed: function () {
                return this.urlFix(this.wallpaperNow);
            },
        },
        methods: {
            syncData:function () {
                var that=this;
                try {
                    var configs = YL.util.dataCopy('configs');
                    that.themeColorNow = configs.themeColor;
                    that.autoThemeColor = configs.autoThemeColor;
                    that.wallpaperNow = configs.wallpaper;
                    that.wallpapers = configs.wallpapers;
                    that.wallpaperBlur = configs.wallpaperBlur;
                    that.wallpaperSlide = configs.wallpaperSlide;
                    that.wallpaperSlideRandom = configs.wallpaperSlideRandom;
                    that.wallpaperSlideItv = configs.wallpaperSlideItv;
                    that.openMax = configs.openMax;
                    that.topTaskBar = configs.topTaskBar;
                    if (!that.colorChoose) {
                        that.colorChoose = configs.themeColor;
                    }
                } catch (e) {
                    YL.debug(e)
                }
            },
            ondataChanged:function () {
                this.dataChanged=true;
                this.syncData();
            },
            appCreate: function (title) {
                var id = '';
                if (/^[\w-.]+$/.test(title) && !this.apps[title]) {
                    //可以做id的情况
                    id = title;
                } else {
                    do {
                        id = 'app-' + YL.util.getID();
                    } while (this.apps[id])
                }
                var app = YL.util.getAppDataTemplate();
                app.title = title;
                app.icon.type = 'str';
                app.icon.content = title;
                this.$set(this.apps,id,app);
            },
            appContextMenu: function (id, e) {
                var that = this;
                var app = this.apps[id];
                var menu = [
                    "<span style='color: darkgray'>" + YL.util.getStrFa('pencil') + app.title + "</span>",
                    '|',
                    [YL.util.getStrFa('play-circle') +YL.lang('Open'), function () {
                        YL.open(id);
                    }],
                    [
                        YL.util.getStrFa('copy') + YL.lang("AddTo"), [
                        [YL.util.getStrFa('desktop') + YL.lang("DesktopIcons"), function () {
                            that.appAddToShortcut(id)
                        }],
                        [YL.util.getStrFa('list-ul') + YL.lang("MainMenu"), function () {
                            that.appAddToMenu(id)
                        }],
                        [YL.util.getStrFa('sliders') + YL.lang("Sidebar"), function () {
                            that.appAddToSidebar(id)
                        }],
                        [YL.util.getStrFa('square') + YL.lang("Tiles"), function () {
                            that.appAddToTile(id)
                        }],
                    ]
                    ],
                    [YL.util.getStrFa('cogs') + YL.lang("Advance"), function () {
                        that.appSetting = app;
                    }],
                    '|',
                    [YL.util.getStrFa('trash') + YL.lang("Uninstall"), function () {
                        that.uninstall(id)
                    }],
                ];
                ContextMenu.render(e, menu, this);
            },
            jsonImport: function () {
                var that = this;
                var el = $("#ipt-json-file");
                var reader = new FileReader();
                //将文件以文本形式读入页面
                reader.readAsText(el[0].files[0], "utf8");
                reader.onload = function (e) {
                    that.textData = e.target.result;
                };
            },
            jsonExport: function () {
                var blob = new Blob([this.textData], {type: "text/plain;charset=utf-8"});
                Yuri2.saveAs(blob, "yl-data.json");
            },
            refreshData: function () {
                //读取data
                var textData = YL.export();
                this.textData = Yuri2.jsonFormat(textData);   // 缩进4个空格
                this.dataChanged=false;
            },
            btnClipboard: function () {
                var dt = new clipboard.DT();
                dt.setData("text/plain", this.textData);
                clipboard.write(dt);
                layer.msg(YL.lang("CopiedToShearPlate"));
            },
            enableData: function () {
                var that = this;
                this.btnEnableLoading = true;
                setTimeout(function () {
                    try {
                        var json = JSON.parse(that.textData);
                        YL.import(json);
                    }catch (e){
                        layer.msg(YL.lang("FormatError"));
                        that.btnEnableLoading = false;
                    }
                }, 500);
            },
            renderAutoRun: function (autoRun) {
                try {
                    if (autoRun > 0) {
                        return "Lv" + Math.floor(autoRun);
                    } else {
                        return YL.lang("Disabled");
                    }
                } catch (e) {
                    return YL.lang("ConfigurationError");
                }
            },
            urlFix: function (url) {
                return url[0] === '.' ? "../../../" + url : url;
            },
            loadApps: function () {
                var apps = YL.util.dataCopy('apps');
                this.apps = apps;
            },
            navStyle: function (id) {
                var color = this.themeColorNow;
                return id === this.navActive ? {'color': color, 'border-left': '5px solid ' + color} : {};
            },
            uninstall: function (id) {
                var app = this.apps[id];
                var cfm = layer.confirm(Yuri2.template(YL.lang("UninstallConfirm"),app.title), {skin: "yl"}, function () {
                    layer.close(cfm);
                    if (YL.uninstall(id))
                        vue.$delete(vue.apps, id);
                })
            },
            appOpen: function (id) {
                YL.open(id);
            },
            appAddToShortcut: function (id) {
                YL.addShortcut(id);
                layer.msg(YL.lang("Added"));
            },
            appAddToMenu: function (id) {
                YL.addMenuItem(id);
                layer.msg(YL.lang("Added"));
            },
            appAddToSidebar: function (id) {
                YL.addSidebarBtn(id);
                layer.msg(YL.lang("Added"));
            },
            appAddToTile: function (id) {
                YL.addTile(id);
                layer.msg(YL.lang("Added"));
            },
            appSearchMatch: function (id) {
                var app = this.apps[id];
                var words = this.appSearchWords;
                if (!words) {
                    return true;
                }
                var checkList = [
                    id,
                    app.title,
                    app.desc,
                    app.poweredBy,
                    this.renderAutoRun(app.autoRun),
                ];
                for (var i in checkList) {
                    var item = checkList[i];
                    if (typeof item === 'string' && item.indexOf(words) !== -1) {
                        return true;
                    }
                }
                return false;
            },
            btnAutoTheme: function () {
                if (this.autoThemeColor) {
                    return {'background': this.themeColorNow, 'color': 'white'};
                } else {
                    return {'background': 'rgb(230,230,230)', 'color': 'black'};
                }
            },
            btnAddBgClick: function () {
                var url = this.wallpaperAddUrl;
                if (!url) {
                    return
                }
                YL.vue.configs.wallpapers.push({image: url, preview: ""});
                this.wallpaperAddUrl = '';
            },
            imgContextMenu: function (bg, e) {
                var that = this;
                var menu = [
                    [YL.util.getStrFa('play') + YL.lang('Enabled'), function () {
                        YL.vue.configs.wallpaper = bg.image;
                    }],
                    [YL.util.getStrFa('remove') + YL.lang('Delete'), function () {
                        var wallpapers = YL.vue.configs.wallpapers;
                        for (var i = 0; i < wallpapers.length; i++) {
                            if (wallpapers[i].image === bg.image) {
                                wallpapers.splice(i, 1);
                                return;
                            }
                        }
                    }],
                ];
                ContextMenu.render(e, menu, this);
            },

            _checkAutoRunLevel: function (app) {
                if (isNaN(app.autoRun) || app.autoRun < 0) {
                    app.autoRun = 0;
                }
            },
            reduceAutoRunLevel: function (app) {
                this._checkAutoRunLevel(app);
                app.autoRun--;
                this._checkAutoRunLevel(app);
            },
            increaseAutoRunLevel: function (app) {
                this._checkAutoRunLevel(app);
                app.autoRun++;
                this._checkAutoRunLevel(app);
            },
        },
    });

});
