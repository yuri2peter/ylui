var data={
    labels:[],
    apps:[],
};


new Vue({
    el: "#app",
    data: {
        search: "",
        labels: [],
        apps: [],
    },
    created: function () {
        var that = this;
        Yuri2.loadContentFromUrl('./data.json','get',function (err,str) {
            var data=JSON.parse(str);
            var labels = data.labels;
            var apps =data.apps ;
            var labelsLoaded = [];
            labels.forEach(function (t) {
                labelsLoaded.push({
                    name: t,
                    active: true,
                    color: that.getRandomColor()
                })
            });
            that.$set(that, 'labels', labelsLoaded);
            that.$set(that, 'apps', apps);
        });
        YLApp.onReady(function () {
            YLApp.eval('getAppVersion','',function (rel) {
                console.log(rel)
            });
        })
    },
    methods: {
        appClick: function (app) {
            if (app.url) {
                YLApp.eval('open',{url:app.url,title:app.title});
            }

        },
        labelClick: function (l) {
            l.active = !l.active;
        },
        isAppActive: function (app) {
            var that = this;
            var rel = false;
            var labels = app.labels;
            var hash = {};
            labels.forEach(function (t) {
                hash[t] = true;
            });
            this.labelsActive.forEach(function (t) {
                var checkList = [
                    app.title,
                    app.url,
                ];
                checkList = checkList.concat(app.labels);
                var inWord = false;
                checkList.forEach(function (t2) {
                    if (typeof t2 === "string" && t2.indexOf(that.search) !== -1) {
                        inWord = true;
                    }
                });
                if (hash[t] && inWord) {
                    rel = true;
                }
            });
            return rel;

        },
        labelStyle: function (label) {
            return {
                "color": label.active ? "white" : label.color,
                "border-color": label.active ? "white" : label.color,
                "background-color": !label.active ? "white" : label.color,
            }
        },
        getRandomColor: function () {
            var r = Yuri2.randInt(0, 200);
            var g = Yuri2.randInt(0, 200);
            var b = Yuri2.randInt(0, 200);
            return 'rgb(' + r + ',' + g + ',' + b + ')';
        },
    },
    computed: {
        labelsActive: function () {
            var ls = [];
            this.labels.forEach(function (t) {
                if (t.active)
                    ls.push(t.name)
            });
            return ls;
        },
    }
})

