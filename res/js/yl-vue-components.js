Vue.component('yl-menu', {
    template: '#tpl-menu',
    props: ['menu','apps'],
    data:function () {
        return {
            menu:{},
            apps:{},
        }
    },
    methods:{
        onItemClick:function ($event) {
            this.$emit('itemclick',$event)
        },
        onItemContextMenu:function ($event) {
            this.$emit('itemcontextmenu',$event)
        },
        onMainContextMenu:function ($event) {
            this.$emit('maincontextmenu',$event)}
    }
});


Vue.component('yl-menu-item', {
    template: '#tpl-menu-item',
    props: ['item','apps','open','depth','itemid'],
    data:function () {
        return {
            itemid:null,
            item:{},
            apps:{},
            open:false,
            depth:0,
        }
    },
    methods:{
        click:function () {
            if(this.item.children){
                this.item.open=!this.item.open
            }else{
                this.$emit('itemclick',this.item);
            }
        },
        onContextMenu:function($event){
            this.$emit('itemcontextmenu',{id:this.itemid,item:this.item,event:$event});
        },
        onItemClick:function ($event) {
            this.$emit('itemclick',$event)
        },
        onItemContextMenu:function (data) {
            this.$emit('itemcontextmenu',data);
        }
    }
});