/*----------------------------------------------------
                View and Init
-----------------------------------------------------*/

// Initialize your app
var app = new Framework7();

// all page init
app.onPageInit('*', function (page) {
    $$.ext.initDummy(page.container, page);
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
mainView.router.loadPage($$.ext.temp('archieve-list'));



/*----------------------------------------------------
                Pages and Init
-----------------------------------------------------*/

var pageHelperDocument = {
    pages: [],
    cbData: function(data, pageObject){
        // todo = data.todo;
        // doing = data.doing;
        data.list = data.archieveList.ArchieveItem;
        delete data.archieveList;
        return data;
    },
    setting: function(){
        return {
            template    : 'list',
            url         : 'list0',
            cbFinish    : pageHelperDocument.cbFinish,
            cbData      : pageHelperDocument.cbData,
            root        : "result"
        };
    },
    cbFinish : function(html, data, pageObject){
            // 如果是翻页，则是追加
            if (pageObject.page){
                pageObject.vars.container().children("div").append(html);
            }else{
                pageObject.vars.container().children("div").html(html);
            }
            $$.ext.initDummy(pageObject.vars.container());
            if(data[pageObject.vars.howMany]!=="undefined" || data[pageObject.vars.howMany]>0){
                // debugger;
                $$("[href='#"+pageObject.vars.container().prop("id")
                    +"'] > i > span.badge.bg-red")
                    .text(data[pageObject.vars.howMany]);
            }

            // 兼容下拉刷新
            app.pullToRefreshDone();
    },
    doc1: function(fnArg){
        fnArg = fnArg || {};
        // LOADING
        var arg = pageHelperDocument.setting();
        arg.page = fnArg.page;
        var page = new $$.ext.PageDefault(arg);
        pageHelperDocument.pages[0] = page;
        page.vars.container = function(){return $$("#doctab1");};
        page.vars.howMany = 'todo';
        page.load();
    },
    doc2: function(fnArg){
        fnArg = fnArg || {};
        // LOADING
        var arg = pageHelperDocument.setting();
        arg.page = fnArg.page;
        arg.url = 'list1';
        var page = new $$.ext.PageDefault(arg);
        pageHelperDocument.pages[1] = page;
        page.vars.container = function(){return $$("#doctab2");};
        page.vars.howMany = 'doing';
        page.load();
    },
    doc3: function(fnArg){
        fnArg = fnArg || {};
        // LOADING
        var arg = pageHelperDocument.setting();
        arg.page = fnArg.page;
        arg.url = 'list2';
        var page = new $$.ext.PageDefault(arg);
        pageHelperDocument.pages[2] = page;
        page.vars.container = function(){return $$("#doctab3");};
        page.vars.howMany = 'done';
        page.load();
    },
    doc4: function(fnArg){
        fnArg = fnArg || {};
        // LOADING
        var arg = pageHelperDocument.setting();
        arg.page = fnArg.page;
        arg.url = 'list3';
        var page = new $$.ext.PageDefault(arg);
        pageHelperDocument.pages[3] = page;
        page.vars.container = function(){return $$("#doctab4");};
        page.vars.howMany = 'doneAll';
        page.load();
    },
    showHideInfiniteLoader: function(){
        $$("#docListPageInfinitePreloader")
    }
};


// 办文
app.onPageInit('doclist', function(page){

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

    pageHelperDocument.doc1();
    pageHelperDocument.doc2();
    pageHelperDocument.doc3();
    pageHelperDocument.doc4();

    var getActiveTabIndex = function(){
        var activeTab = $$("#archievePullToRefresh .tab.active");
        var index = activeTab.index();
        return index;
    };


    var pageDoc = $$("#archievePullToRefresh");

    pageDoc.on("refresh", 
        function(e){
            var index = getActiveTabIndex();
            pageHelperDocument["doc" + (index + 1)]();
        }
    );

    var infLoading = null;
    pageDoc.on('infinite', function(){
        if(infLoading != null){
            return;
        }else{
            infLoading = getActiveTabIndex();
        }

        

    });
});


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