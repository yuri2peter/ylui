Vue.component('yl-icon', {
    template: '#tpl-icon',
    props: ['icon','drawer','badge','apps','nobg','img'],
    data:function () {
        return {
            icon:{},
            badge:0,
            drawer:false,
            nobg:false,
            img:'',
        }
    },
    methods:{
        badgeText: function (content) {
            //处理badge的提示内容
            if (isNaN(content)) {
                return content;
            } else {
                return content > 99 ? '99+' : parseInt(content);
            }
        },
    }
});