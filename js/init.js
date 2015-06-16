/*----------------------------------------------------
                View and Init
-----------------------------------------------------*/

// Initialize your app
var app = new Framework7({
    modalButtonOk: '确定',
    modalButtonCancel: '取消',
    smartSelectBackText: "确定"
});

// all page init
app.onPageInit('*', function (page) {
    $$.ext.initDummy2(page.container, page);
});

app.onPageAfterBack('*', function(page){
    $$.ext.PageManager.remove(page);
});

// Add view
var mainView = app.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// load the first page
// mainView.router.loadPage($$.ext.temp('archieve-list'));



/*----------------------------------------------------
                Pages and Init
-----------------------------------------------------*/



    //自定义的模板预处理函数
    Template7.registerHelper("doUrgency",function(isUrgency){
        if(isUrgency==1){
            return "急件";
        }else if(isUrgency==2){
            return "特急";
        }else{
            return "平件";
        }
    });    
    Template7.registerHelper("doUrgencyImg",function(isUrgency){
        if(isUrgency==1){
            return "ic-description-jijian";
        }else if(isUrgency==2){
            return "ic-description-teji";
        }else{
            return "ic-description-pingjian";
        }
    });    
    Template7.registerHelper("doUrgencyTxt",function(isUrgency){
        if(isUrgency==1){
            return "txt-jijian";
        }else if(isUrgency==2){
            return "txt-teji";
        }else{
            return "txt-pingjian";
        }
    });


// doclist 办文页面初始化函数
// (function(){
//     var arthieveListPageObject = $$.ext.dummy2.getObject("PageDefault");
//     // var dummyPage = new $$.ext.dummy2.fn.PageDefault();
//     arthieveListPageObject.template = 'archieve-list';
//     arthieveListPageObject.url = 'list0';
//     arthieveListPageObject.cbFinish = function(html){mainView.router.loadContent(html)};
//     arthieveListPageObject.executeDummy();
// })();



//获取常用意见
app.onPageInit('opinion', function(page){

    var fn = function(data){
        return data;
    };

    var arg = {
        template    : 'archieve-content-opinion-common',
        url         : 'getCommonComment',
        cbFinish    : null,
        cbData      : fn,
        root        : "MobileExchange"
    }

    arg.cbFinish = function(html){
        $$("select").html(html);
    }
    $$.ext.bindDataTemplate( new $$.ext.PageDefault(arg) );

    $$("select").on("change",function(){
        if(this.selectedIndex!=0){
            $$("#archieve-opinion-textarea").val((this.value));
        }
        
    })

});


//通知公告
app.onPageInit('bulletin-list', function(page){
    var fn = function(data){
        data.list = data.bulletinList.BulletinItem;
        delete data.bulletinList;
        return data;
    };

    var arg = {
        template    : 'commonlist',
        url         : 'bulletinlist',
        cbFinish    : null,
        cbData      : fn,
        root        : "result"
    }
    arg.cbFinish = function(html){
        $$("#bulletinlist").html(html);
        $$.ext.initDummy('#bulletinlist');
    }
    $$.ext.bindDataTemplate( new $$.ext.PageDefault(arg) );
});

//消息中心
app.onPageInit('message-list', function(page){
    var fn = function(data){
        data.list = data.messageList.item;
        delete data.messageList;
        return data;
    };

    var arg = {
        template    : 'messagelist',
        url         : 'messagelist',
        cbFinish    : null,
        cbData      : fn,
        root        : "result"
    }
    arg.cbFinish = function(html){
        $$("#messagelist").html(html);
    }
    $$.ext.bindDataTemplate( new $$.ext.PageDefault(arg) );
});


/*----------------------------------------------------
                Page's Handler
-----------------------------------------------------*/
$$.ext.dummy2.setObject(
    "ArchieveList", "PagePaginationPullDown",
    function(data){
        // me._dummyData = data;
        this.template = 'archieve-list';
        this.url = 'list' + data.$.atype;
        this.param = {
            pageSize: 10,
            page: 0
        };
        // this.cbBeforeLoad = function(po){

        // };
        // change page url
        this.cbData = function(po, data){
            var po = this;
            var param  = po.getParam();
            var url = po.getRawUrl();
            if (param.page == 0){
                url = "list" + this.$.atype;
            }else{
                url = "list" + this.$.atype + "-" + param.page;
            }

            po.setRawUrl(url);
        };
        // render finish
        this.cbFinal = function(){
            var me = this;
            var root = $$("#archievePullToRefresh" + this.$.atype);
            root.on("refresh", function(e){
                    var po = me;
                    app.pullToRefreshDone();
                    po.reload();
                });
        };
        // @override
        this.hasNextPage = function(){
            var data = this.getData();
            var param = this.getParam();
            if (data.archieveList && data.archieveList.ArchieveItem 
                    && data.archieveList.ArchieveItem.length
                    && data.archieveList.ArchieveItem.length == param.pageSize){
                return true;
            }else{
                return false;
            }
        };
        this.xmlArray = "ArchieveItem,item";
    }
);

$$.ext.dummy2.setObject(
    "ArchieveContent", "PageDefault",
    function(data){
        this.template = "archieve-content";
        this.param = {
            id: data.$.archieveid
        };
        this.url = "content1";
        this.xmlArray = "item";
    }
);

// 读取第一页办文
$$.ext.dummy2.execute("ArchieveList", 
    {
        $   : {
            atype:0
        }
    }
);