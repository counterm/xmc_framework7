//--------------------------------------------------------------------------
//
// Framework7 框架开发适应库
// 
// version: 0.5.2
// Date: 2015-05-28
//
//--------------------------------------------------------------------------

/*----------------------------------------------------
                Ext Helper
-----------------------------------------------------*/

// Export selectors engine
var $$ = Dom7;

// external defined
$$.ext              = {};

$$.ext.setting      = {
    _debug      : true,
    templateRoot   : "template-wrap"
};



// $$.ext.setting      = {
//     defaultRoot: 'result'
// };
// error log
$$.ext.error        = function(msg){
    if (typeof msg == 'string'){
        console.log(msg);
    }else{
        console.dir(msg);
    }
};



$$.ext.debugPool    = [];

$$.ext.debug        = function(msg){
    if ($$.ext.setting._debug === false){
        return;
    }
    if (arguments.length > 1){
        [].forEach.call(arguments, function(v,i,a){
            $$.ext.debug(v);
        });
    }else{
        if (typeof msg == 'string'){
            console.log(msg);
        }else{
            console.dir(msg);
        }
        if ($$.ext.debugPool.unshift(msg) > 20){
            $$.ext.debugPool.length = 20;
        }
    }
};



// loading animation
$$.ext.loading      = function(flag){
    if (flag){
        app.showPreloader();
    }else{
        app.hidePreloader();
    }
};


$$.ext.alert        = function(content, fn){
    if (fn){
        app.alert(content,'提示', fn);
    }else{
        app.alert(content,'提示');
    }
};



// service url gate
$$.ext.url          = function(name){
    return "demo/" + name + ".xml";
};



// template path gate
$$.ext.temp         = function(name){
    return "template/" + name + ".html";
};



// 服务器代码解析
$$.ext.serverParse  = function(data, options){
    if (options.xmlArray && options.xmlArray instanceof Array == false){
        if (typeof options.xmlArray == "string"){
            options.xmlArray = options.xmlArray.split(",");
        }else{
            options.xmlArray = [options.xmlArray];
        }
    }
    data = data.replace(/\r\n/g, '').replace(/\n/g,'');
    data = $$.ext.xml2json(data, options.xmlArray);
    // if ($$.ext.setting.defaultRoot && data[$$.ext.setting.defaultRoot]){
    //     data = data[$$.ext.setting.defaultRoot];
    // }
    return data;
};



// 获取page根元素
// @param string view 从哪个view查询
$$.ext.getPageRoot  = function(view){
    var currentPageRoot = null;
    var childSelector = ".pages > .page:last-child";
    if (typeof view == 'string'){
        view = view || ".view-main";
        currentPageRoot = document.querySelector(view + " > " + childSelector);
    }else if(view instanceof HTMLElement){
        currentPageRoot = document.querySelector(childSelector, view);
    }else if(view.activePage){
        view = view.selector;
        currentPageRoot = document.querySelector(view + " > " + childSelector);
    }else{
        return null;
    }
    return currentPageRoot;
};



/**
 * 基类
 */
$$.ext.Object = function(){
    var noArgs = [];
    this.callParent = function(arg){
        var obj = this.callParent.caller.$owner.__proto__;
        var method = obj[this.callParent.caller.$name];
        if (method){
            return method.apply(this, arg || noArgs);
        }
    };
    //  要放到每个类的初始化的最底部
    //  这个方法会被多次调用
    this.init = function(){
        for (var i in this){
            if (typeof this[i] == 'function' && this[i].$name == null){
                if (!this[i].$name){
                    this[i].$name = i;
                    this[i].$owner = this;
                }
            }
        }
    };
    this.init();
};



// 资料池
$$.ext.DataManager = {map:{}};

$$.ext.DataManager.add = function(data){
    var newId = $$.ext.util.newId();
    $$.ext.DataManager.map[newId] = data;
    return newId;
};


$$.ext.DataManager.get = function(id){
    if (!id){
        return null;
    }
    return $$.ext.DataManager.map[id];
};


$$.ext.DataManager.parseHtml = function(pageObject, data, html){
    // 增加数据记录到总数据记录中
    var reg = /(<a[^>]+)(dummy2=[^>]+>)/g;
    var reg2 = /(<a[^>]+)data-id.*?(dummy2=[^>]+>)/;
    var dataId;
    if (!reg2.test(html)){
        dataId = this.add(data);
        html = html.replace(reg, '$1data-id="'+ dataId +'" $2');
    }
    
    // var reg = new RegExp('(class="[^"]*?'+$$.ext.setting.templateRoot+'[^"]*?")'),
    //     dataId = this.add(data);
    // if (reg.test(html)){
    //     html = html.replace(reg, '$1 data-id="'+dataId+'"');
    // }
    return html;
};




$$.ext.PageManager = [];

// 查找属于setting.templateRoot中指定的父元素
// class="template-wrap"
$$.ext.PageManager.findTemplateRoot = function(dom){
    parent = dom.parentNode;
    while(parent.className.indexOf($$.ext.setting.templateRoot) == -1){
        if (parent.tagName.toLowerCase() == 'body'){
            return null;
        }
        parent = parent.parentNode;
    }
    return parent;
};


// 一般模板化方式初始化PageDefault类
$$.ext.PageManager.instanceByDom7 = function(dom){
    var me = $$(dom);
    var setting = {};
    var dummyParam   = me.data("dummyParam") || "{}";
    setting.param    = $$.ext.util.JSONParse(dummyParam);
    setting.url      = me.data("dummyUrl")|| "";
    setting.template = me.data("temp");
    setting.tempswap = me.data("tempswap");
    setting.tempdata    = me.data("tempdata");
    if (setting.tempdata){
        setting.tempdata = $$.ext.util.JSONParse(setting.tempdata);
    }
    setting.root        = me.data("root");
    setting.isReload    = me.data("reload");
    setting.xmlArray    = me.data("xmlArray");
    setting.pageFieldName = me.data("pageFieldName");

    // you can modify xml data after loading it, 
    // argument is data
    var cbData      = me.data("cbData");
    if (cbData){
        setting.cbData = eval("window."+cbData);
    }
    // call while render html complete, you can return "false"
    // to exchange the render process
    // argument is html
    var cbFinish    = me.data("cbFinish");
    if (cbFinish){
        cbFinish = eval("window."+cbFinish);
    }
    // before ajax load the service data
    // argument is param
    var cbBeforeLoad= me.data("cbBeforeLoad");
    if (cbBeforeLoad){
        setting.cbBeforeLoad = eval("window."+cbBeforeLoad);
    }

    var cbFinal    = me.data("cbFinal");
    if (cbFinal){
        setting.cbFinal = eval("window."+cbFinal);
    }

    // new a page object
    var pageObject = null;
    if (setting.pageName){
        pageObject = new $$.ext.PagePagination(setting);
    }else{
        pageObject = new $$.ext.PageDefault(setting);
    }

    // // 成功后追加到内容
    // pageObject.addCbFinish();

    // 有可能外部来控制是否用这个渲染，所有需要放在后面插入，以提高优先级
    if (cbFinish){
        pageObject.addCbFinish(cbFinish);
    }
    return pageObject;
};


// 脚本为主的初始化试
$$.ext.PageManager.instance2 = function(dom){
    var fnString = dom.getAttribute("dummyhandler"),
        dataId = dom.getAttribute("data-id"),
        data;
    // execute
    // try{
        data = $$.ext.DataManager.get(dataId);
        data.$ = $$(dom).dataset();
        $$.ext.dummy2.execute(dom.getAttribute('dummyhandler'), data);
        // $$.ext.dummy2.fn[fnString](dom);
    // }catch(e){
    //     $$.ext.error("点击后调用事件异常，可能找不到相关方法。");
    //     $$.ext.error(e);
    // }
};



$$.ext.PageManager.remove = function(page){
    for (var i = this.length - 1; i >= 0; i --){
        if (this[i].framepage == page){
            this.splice(i, 1);
        }
    }
};



$$.ext.PageManager.get = function(id){
    var ret = null;
    this.every(function(v,i,a){
        if (v.id == id){
            ret = v;
            return false;
        }else{
            return true;
        }
    });
    return ret;
};



/**
 * 页面类
 * @param {Object} parentView   所在的view
 * @param {Object} framepage    框架页面类，用于绑定并且注册销毁事件
 * @param {Object} url          接口地址，只提供名称就可以
 * @param {Object} param        请求参数
 * @param {String} template     模板地址，只提供名称就可以
 * @param {Object} tempswap     数据交换映射
 * @param {String} root         数据根层次
 * @param {Object} tempdata     本地数据，会忽略 url，以及param
 * 回调说明
 * 
 * @param cbData 
 *        you can modify xml data after loading it, 
 *        argument is pageDefault, data
 * 
 * @param cbFinish 
 *        call while render html complete, you can return "false"
 *        to stop the render process
 *        argument is PageDefault, html, data
 * 
 * @param cbBeforeLoad 
 *        before ajax load the service data
 *        check the submit param are correct before connect to the server
 *        argument is PageObject
 * @param cbFinal
 *        最终要执行的收尾工作
 */
$$.ext.PageDefault = function(setting){
    // var me = this,
    var _initSetting = false,
        _finishFn = [],
        _finalFn = [];


    this.initSetting = function(setting){
        _initSetting        = true;
        this._isReload        = false;        // 是否内部调用了reload方法来加载
        this._templateHtml    = null;         // 保存用过的模板代码
        this._html            = null;
        this._data            = null;

        this.id               = "page-" + Math.ceil(Math.random()*10000000).toString();
        this.vars             = {};           // 外部借用变量域
        this.showLoading      = true;
        this.loading          = false;
        this.parentView       = window.mainView ? mainView : null;     // 默认是主要视图

        $$.ext.util.extend(this,setting);
        $$.ext.PageManager.push(this);

        $$.ext.debug("PageDefault("+this.id+") setting: ", setting);

        // 默认
        if (this.tempdata && typeof this.tempdata == 'string'){
            this.tempdata = $$.ext.util.JSONParse(this.tempdata);
        }
        if (this.tempswap && typeof this.tempswap == 'string'){
            this.tempswap = $$.ext.util.JSONParse(this.tempswap);
        }
        if (!this.cbData){
            this.cbData = function(po, data){return data};
        }
        if (!this.cbBeforeLoad){
            this.cbBeforeLoad = function(){return true};
        }
        if (this.cbFinal){
            _finalFn.push(this.cbFinal);
        }

        // 默认追加到内容中
        _finishFn.push(function(me,  html){
            // 如果是其它模式，则可以执行追加等其它模式，不需要再执行后面的更换内容操作
            // 这些都取词于子类的实现
            if (me.stopDefaultFinish()){
                return;
            }
            if (me.isReload || me._isReload){
                me.parentView.router.reloadContent(html);
            }else{
                me.parentView.router.loadContent(html);
            }
        });

        if (this.cbFinish){
            _finishFn.push(this.cbFinish);
        }
    };


    // format url and template path
    // me.url = $$.ext.url(me.url);
    // me.template = $$.ext.temp(me.template);

    // handle data prepare callback 
    // and save the data argument
    this.cbDataHandler = function(me, data){
        var tmp = null,
            tempswap = this.tempswap;

        // TODO: DANGER 
        // 在tempdata场景中会有可能出现问题
        // 寻找需根定位的根目录
        if (this.root && data[this.root]){
            data = eval("(data." + this.root + ")" );
        }

        if (tempswap){
            try{
                tempswap = $$.ext.util.JSONParse(tempswap);
            }catch(e){
                $$.ext.error("ERROR(initDummy): json parse occur exception " + e);
                return data;
            }
            for (var ts in tempswap){
                try{
                    data[ts] = data[tempswap[ts]];
                }catch(e){
                    $$.ext.error("ERROR(initDummy): data prepare process error, detail " + tempswap[ts] + " -> " + ts + ".");
                }
            }
        }
        $$.ext.debug("cbDataHandler("+this.id+") in: ", this, data);
        if (this.cbData){
            // TODO : DANGER, just avoid situation of empty data 
            var temp = this.cbData(this, data);
            $$.ext.debug("cbDataHandler("+this.id+") ok: ", this);
            if (temp){
                data = temp;
            }
        }
        this._data = data;
        return data;
    };

    // handle the finish callback
    // cancel default render(usually was the first callback function)
    // while function return "false"
    this.cbFinishHandler = function(html){
        var me = this;
        var bol = true, ret = true, fn=null;
        for(i = _finishFn.length-1; i >= 0; i--){
            fn = _finishFn[i];
            bol = fn.call(this, this, html, this._data);
            if (bol === false){
                if (this.showLoading){
                    $$.ext.loading(0);
                }
                $$.ext.debug("cbFinishHandler("+this.id+") cancel: ", this, fn);
                ret = false;
                break;
            }else if (bol && typeof bol == 'string'){
                html = bol;
            }
        }
        $$.ext.debug("cbFinishHandler("+this.id+") ok: ", {html: html});
        if (this.showLoading){
            $$.ext.loading(0);
        }
        
        this.loading = false;

        _finalFn.forEach(function(v,i,a){
            // try{
                v.call(me, me);
            // }catch(e){
            //     $$.ext.error("cbFinal 执行中异常, function:");
            //     $$.ext.error(e);
            // }
        });

        return ret;
    };


    // 追加回调方法
    // 新的方法放在最后
    this.addCbData = function(fn){
        var oldFn = this.cbData;
        this.cbData = function(me, data){
            var data = oldFn.call(me, me, data);
            data = fn.call(me, me, data);
            return data;
        };
    };

    // 追加回调方法
    // 新的放在前面
    this.addCbFinish = function(fn){
        _finishFn.push(fn);
    };

    this.addCbFinal = function(fn){
        _finalFn.push(fn);
    };

    this.load = function(param){
        param = param && {};
        var myParam = this.getParam();
        $$.ext.util.extend(myParam, param);
        this._isReload = false;
        this.loadHandler();
    };

    // 重新加载
    this.reload = function(){
        this._isReload = true;
        this.loadHandler();
    };

    /**
     * 执行加载过程
     * 由于此函数需要使用继承的 initSetting ，
     * 在调用 this.initSetting 的时候
     * 如果改用 this.initSetting 会造成initSetting没有继承效果
     */
    this.loadHandler = function(){
        if (this.showLoading){
            $$.ext.loading(1);
        }
        this.loading = true;
        $$.ext.bindDataTemplate(this);
    };

    // 获取相关的服务器接口资料，并且把相关资料返回第一参数 fnCallback
    // 如果不确定有没有本地数据 "tempdata"
    // 则需要提供fnAjax方法，以访问服务器获取数据
    // fnAjax 接受三个参数, url, param, callback
    this.getServiceData = function(fnCallback, fnAjax){
        var me = this;
        // 提交数据验证失败, 阻止继续提交
        if (me.cbBeforeLoad(me) === false){
            $$.ext.debug("getServiceData("+me.id+") cancel: ", me);
            if (me.showLoading){
                $$.ext.loading(0);
            }
            return false;
        }
        var innerDataCallback = function(data){
            data = me.cbDataHandler(me, data);
            fnCallback(data);
        };
        if (me.tempdata){
            innerDataCallback(me.tempdata);
        }else{
            fnAjax(me.getUrl(), me.getParam(), innerDataCallback);
        }
    };

    // 需要的话，处理一下模板资料
    this.parseTemplateHtml = function(templateHtml){
        this._templateHtml = templateHtml;
        return templateHtml;
    };

    this.parseHtml = function(html){
        this._html = html;
        return html;
    };

    this.getTemplateHtml = function(){
        return this._templateHtml;
    };

    this.getHtml = function(){
        return this._html;
    };

    this.getTemplate = function(){
        if (this.template){
            return $$.ext.temp(this.template);
        }else{
            return null;
        }
    };

    this.setTemplate = function(template){
        this.template = template
    };

    this.setRawUrl = function(url){
        this.url = url;
    };

    this.getRawUrl = function(){
        return this.url;
    };

    this.getUrl = function(){
        return $$.ext.url(this.url);
    };

    this.getParam = function(){
        return this.param;
    };

    this.setParam = function(param){
        this.param = param;
    };

    /**
     * 返回这次获取的数据
     * @param  {String} nodeString 数据节点名，可以是多级，如"Archieve.item"
     * @return {[type]}            [description]
     */
    this.getData = function(nodeString){
        if (nodeString){
            return eval("this._data."+nodeString);
        }else{
            return this._data;
        }
    };

    /**
     * 返回page的HTMLElement
     * @return {HTMLElement}
     */
    this.getPageElement = function(){
        return $$.ext.getPageRoot(this.parentView);
    };

    // 其它内容追加模式, 返回true，则代表不执行默认的内容显示
    // 只执行这函数内部的显示方式
    this.stopDefaultFinish = function(){
        return false;
    };

    this.init = function(setting){
        (new $$.ext.Object()).init.call(this);
        if (setting){
            this.initSetting(setting);
        }
    };

    this.init(setting);
};






/**
 * 带滚动分页模式
 * ul等这些循环元素，需要使用 class="page-pagination"来指定
 * 
 * 假设当前page中只有一个 class="page-pagination" 元素
 * @param {String} pageFieldName 分页参数名
 * @param {String} pageSizeFieldName 分页大小字段名
 */
$$.ext.PagePagination = function(setting){
    // $$.ext.PageDefault.call(this, setting);
    // this.superClass = new $$.ext.pageDefault();
    this.pageMode = "first";    // "first", "afterFirst"

    var _pageFirstInteger = 0;
        _repeatTemplateHtml = null,   // 模板循环代码
        _regRepeaterClass = 'page-pagination',
        _regRepeater = new RegExp('class\\=".*?'+_regRepeaterClass+
            '.*?".*?>[\\S\\s]*?(\\{\\{\\#each[.\\s\\S]+?\\{\\{\\/each\\}\\})');


    /**
     * @override
     */
    this.initSetting = function(setting){
        var me = this;
        // me.listRoot = "";
        me.pageFieldName    = "page";
        me.pageSizeFieldName= "pageSize";
        me.page = 0;    //


        // 用于最后追加内容的，
        me.repeatContainer = null;
        me.callParent(arguments);
    };


    // me.default_cbFinishHandler = me.cbFinishHandler;
    this.cbFinishHandler = function(html){
        var me = this;
        var ret = true;
        // ret = me.default_cbFinishHandler(html);
        ret = me.callParent(arguments);

        // pageSize update
        var pageSize = me.getParam()[me.pageSizeFieldName];
        if (pageSize){
            me.pageSize = pageSize;
        }

        return ret;
    };


    /**
     * 加载器，让pageMode实现重置
     * @override
     */
    this.reload = function(){
        var me = this;
        me.pageMode = "first";
        // 设置第一页的页码
        me.getParam()[me.pageFieldName] = _pageFirstInteger;
        me.callParent();
    };

    this.setPageFieldNmae = function(name){
        this.pageFieldName = name;
    };

    this.getPage = function(){
        var me = this;
        return me.getParam()[me.pageFieldName];
    };

    this.setPage = function(page){
        var me = this;
        me.getParam()[me.pageFieldName] = page;
    };

    /**
     * 下一页
     * @return {boolean} 是否进行加载下一页
     */
    this.nextPage = function(){
        console.dir("nextpage");
        var me = this;
        me.pageMode = "afterFirst";
        //
        if (false === me.hasNextPage()){
            return false;
        }
        // 分页处理
        me.setPage(me.getPage()+1);
        me.load();
        return true;
    };

    /**
     * 检查是否有下一页
     * @abstract
     */
    this.hasNextPage = function(){
        // DOTO
        return false;
    };


    /**
     * 追加数据到分页中
     * @abstract
     */
    this.appendNextPageHtml = function(html){
        var me = this;
        // TODO:  需要再实现
        // exmaple: 
        // $$("#id").append(html);
        var repeatElement = null,
            pageRootElement = null,
            repeatTemplateHtml = null,
            templateHtml = me.getTemplateHtml(),
            templateObject = null,
            compiledHtml = "";
        pageRootElement = me.getPageElement();
        repeatElement = pageRootElement.querySelector("."+_regRepeaterClass);
        repeatTemplateHtml = templateHtml.match(_regRepeater);
        // 匹配得到结果
        if (!repeatTemplateHtml || repeatTemplateHtml.length < 2){
            return false;
        }else{
            repeatTemplateHtml = repeatTemplateHtml[1];
            // render
            templateObject = Template7.compile(repeatTemplateHtml);
            compiledHtml = templateObject(me.getData());
            repeatElement.insertAdjacentHTML("beforeEnd", compiledHtml);
        }
    };

    /**
     * @override
     */
    this.stopDefaultFinish = function(){
        var me = this;
        if (me.pageMode == "first"){
            return false;
        }else{
            me.appendNextPageHtml(me.getHtml());
            return true;
        }
    }

    this.init(setting);
};




/**
 * 分页页面类，增加页面的动画控制
 * 增加以下参数
 * @param {element} loadingElement 动画HTML元素
 */
$$.ext.PagePaginationPullDown = function(setting){

    this.initSetting = function(setting){
        var me = this;
        me.callParent(arguments);
        me.addCbFinal(me.initScrollEvent);
    };

    /**
     * 初始化滚动的事件
     */
    this.initScrollEvent = function(){
        var me = this;
        var pageElement = null, pageContentElement = null;

        pageElement = me.getPageElement();
        pageContentElement = pageElement.querySelector(".page-content");
        $$(pageContentElement).on("infinite", function(){
            if (me.loading == true){
                return;
            }
            me.nextPage();
        });
    };

    /**
     * 下一页，并控制loading动画显示隐藏
     * @override
     * @return {boolean} 是否进行加载下一页
     */
    this.nextPage = function(){
        var me = this;
        var bol = me.callParent();
        var pageElement = me.getPageElement();
        var loadingElement = pageElement.querySelector(".infinite-scroll-preloader");
        if (bol == true){
            loadingElement.style.display = "";
        }else{
            loadingElement.style.display = "none";
        }
        return bol;
    };

    /**
     * @override
     * @return {Boolean} [description]
     */
    this.hasNextPage = function(){

    };

    this.init(setting);
};



/**
 * convenient get data and render html
 * 如果 pageObject没有配置模板地址，则不执行获取模板操作
 * 并且 PageDefault.dbFinishHandler() 也会没有参数
 */
$$.ext.bindDataTemplate = function(pageObject){
    // 得到模板以及数据之后，进行总结输出
    var renderHandler = function(templateHtml){
        var data = pageObject.getData();
        // 保存资料，更改 根元素 template-wrap
        templateHtml = $$.ext.DataManager.parseHtml(pageObject, data, templateHtml);
        // 保存模板代码到页面类
        templateHtml = pageObject.parseTemplateHtml(templateHtml);
        $$.ext.debug("bindDataTemplate("+pageObject.id+") before Template7: ", {template:templateHtml, data: data});
        var html = Template7.compile(templateHtml)(data);
        html = pageObject.parseHtml(html);
        $$.ext.debug("bindDataTemplate("+pageObject.id+") after Template7: ", {html: html});
        pageObject.cbFinishHandler(html);
    };

    // 获取接口数据代码
    var gettingData = function(data){
        // 如果获取过模板，就用之前的模板代码
        if (pageObject.getTemplateHtml()){
            renderHandler(pageObject.getTemplateHtml());
        }else if (pageObject.getTemplate()){    // 如果有模板地址再去继续查询服务器模板
            // getServiceTemplate(pageObject.getTemplate(), renderHandler);    
            $$.get(pageObject.getTemplate(), renderHandler);
        }
    };
    var ajaxHandler = function(url, param, dataCallback){
        $$.ext.debug("bindDataTemplate("+pageObject.id+") before ajax: ", url, param);
        $$.post(url, param, function(data){
            $$.ext.debug("bindDataTemplate("+pageObject.id+") after ajax: ", {data: data});
            data = $$.ext.serverParse(data, pageObject);
            dataCallback(data);
        });
    };

    pageObject.getServiceData(gettingData, ajaxHandler);
};



/**
 *  初始化链接式设置服务器访问
 *  如果是自动加载页面可以不用另外手动调用
 *  如果是其它异步非自动加载页面，没有经过pageInit的，则需要手工调用
 *  
 *  data-tempswap   模板转换属性名称   
 *  data-temp   模板位置
 *  data-dummy
 *      @param {string}     page     接口地址
 *      @param 其它为查询参数 
 *  data-cbData     预处理资料回调函数
 *  data-cbFinish   渲染完成回调函数，如果返回假，则后面的交给cbFinish处理
 */
$$.ext.initDummy = function(eleRoot){
    var target = null;
    if (typeof eleRoot == 'string'){
        eleRoot = document.querySelector(eleRoot);
    }

    target = $$("[data-dummy]");

    // 2015-05-28
    // 调整原来的dummy，先在这里进行替换
    // 以实现全局搜索的目的，不用限制在page内来避免搜索到其它已绑定的元素
    [].forEach.call(target, function(v,i,a){
        v = $$(v);
        var url = "";
        var dummy = $$.ext.util.JSONParse(v.data("dummy"));
        if (dummy._url){
            url = dummy._url;
        }
        delete dummy._url;
        v.data("dummyUrl", url);
        v.data("dummyParam", JSON.stringify(dummy));

        v.removeAttr('data-dummy');
    });

    // 注册事件
    target.on('click touch', function(e){
        var me = $$(this);
        var pageObject = $$.ext.PageManager.instanceByDom7(me);
        pageObject.load();
    });

    $$.ext.activeTemplateScript();
};



// 执行模板中的特定脚本
$$.ext.activeTemplateScript = function(){
    var target = $$("script[type='app/script']");

    for (var i in target){
        if (!isNaN(i)){
            eval(target[i].innerHTML);
        }
    }

    // 2015-05-28
    // 调整原来的type='app/script'，先在这里进行替换属性，
    // 以实现全局搜索的目的，不用限制在page内来避免搜索到其它已绑定的元素
    [].forEach.call(target, function(v,i,a){
        v = $$(v);
        v.prop('type', 'app/scripted');
    });
};



/**
 * xml转换json
 * @param  {XMLDocument/String} xml          xml内容或节点
 * @param  {Array} arraySpecify 数组指定名，如果找到相同名字的都会定义为数组
 */
$$.ext.xml2json = function (xml, arraySpecify) {
    arraySpecify = arraySpecify || [];
    if (typeof xml == 'string'){
        var parser=new DOMParser();
        xml=parser.parseFromString(xml,"text/xml");
        // xmlDoc = new ActiveXObject( "Microsoft.XMLDOM");
        // xmlDoc.loadXML(xml);
        // xml = xmlDoc;
    }
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1) { // element
        // do attributes
        if (xml.attributes.length > 0) {
            obj["attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["attributes"][attribute.nodeName] = attribute.value;//attribute.nodeValue;
            }
        }
    } else if (xml.nodeType == 3) { // text
        obj = xml.nodeValue;
    }

    // do children
    if (xml.childNodes.length > 0) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            // var item = xml.childNodes.item(i);
            var item = xml.childNodes[i];

            // foget text
            if (item.nodeType == 3) {
                continue;
            }

            var nodeName = item.nodeName;

            // 没有定义过
            if (typeof(obj[nodeName]) == "undefined") {
                //20150312. nodeType:1是元素，2是属性，3是文本，4是<![CDATA[文本内容]]>
                if (item.childNodes.length == 1 && (item.firstChild.nodeType == 3 || item.firstChild.nodeType == 4) && item.attributes.length == 0 && item.textContent) {
                    obj[nodeName] = item.textContent.toString();
                }else if (item.childNodes.length == 0 && item.textContent == "") {
                    obj[nodeName] = "";
                }else {
                    obj[nodeName] = $$.ext.xml2json(item, arraySpecify);
                }
                if (arraySpecify.indexOf(nodeName) > -1 && obj[nodeName] instanceof Array === false){
                    obj[nodeName] = [obj[nodeName]];
                }
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push($$.ext.xml2json(item, arraySpecify));

            }
        }
    }
    return obj;
};



$$.ext.util = {}



$$.ext.util.JSONParse = function(string){
    if (typeof string == 'string'){
        return eval("(" + string + ")");
    }else{
        return string;
    }
};



$$.ext.util.extend = function(){ 
    var callee = arguments.callee;
    // copy reference to target object 
    var target  = arguments[0] || {}, 
        i       = 1,
        length  = arguments.length, 
        deep    = false, 
        options = null; 
    // Handle a deep copy situation 
    if (typeof target === "boolean") { 
        deep    = target; 
        target  = arguments[1] || {}; 
        // skip the boolean and the target 
        i       = 2; 
    } 
    // Handle case when target is a string or something (possible in deep copy) 
    if (typeof target !== "object" && typeof target !== "function") {
        target = {}; 
    }
    // extend jQuery itself if only one argument is passed 
    if (length == i) { 
        target = this; 
        --i; 
    } 
    for (; i < length; i++) {
        // Only deal with non-null/undefined values 
        if ((options = arguments[i]) != null){
            // Extend the base object 
            for (var name in options) { 
                var src = target[name], copy = options[name]; 
                // Prevent never-ending loop 
                if (target === copy){
                    continue; 
                }
                // Recurse if we're merging object values 
                if (deep && copy && typeof copy === "object" && !copy.nodeType){
                    target[name] = callee(deep, // Never move original objects, clone them 
                        src || (copy.length != null ? [] : {}), copy); 
                // Don't bring in undefined values 
                }else{
                    if (copy !== undefined){
                        target[name] = copy;
                    }
                } 
            }
        }
    }
    // Return the modified object 
    return target; 
}; 



// 生成唯一编号
$$.ext.util.newId = function(){
    var me = $$.ext.util.newId,
        newId = "id" + Math.ceil(Math.random() * 1000000);
    me.idString = me.idString || "";
    while(me.idString.indexOf(newId) > -1){
        newId = "id" + Math.ceil(Math.random() * 1000000);
    }
    me.idString += newId;
    return newId;
};



$$.ext.PageDefault.prototype = new $$.ext.Object();
$$.ext.PagePagination.prototype = new $$.ext.PageDefault();
$$.ext.PagePaginationPullDown.prototype = new $$.ext.PagePagination();



//=============================================================
//      脚本引擎 v2.0
//=============================================================
/**
 * 模板引擎 v2.0
 * 1. 每个page页面必须标明使用的数据编号
 * 2. 每个需要照顾的可点击元素，需要标识要执行的解析方法
 */
$$.ext.initDummy2 = function(){
    var target = null; 
    target = $$("[dummy2]");
    [].forEach.call(target, function(v,i,a){
        v = $$(v);
        v.attr("dummyhandler", v.attr("dummy2"));
        v.removeAttr('dummy2');
    });

    target.on('click touch', function(e){
        $$.ext.PageManager.instance2(this);
    });

    $$.ext.activeTemplateScript();
};

$$.ext.dummy2 = [];



// 新建入口
$$.ext.dummy2.setObject = function(name, parent, fn){
    $$.ext.dummy2.fn[name] = function(setting){
        fn.apply(this, arguments);
        this.init(setting);
    };
    $$.ext.dummy2.fn[name].prototype = new $$.ext.dummy2.fn[parent]();
};



// 执行入口
// @param string name   要执行的类的名称
// @param Objedct data  当前显示页面的数据，有需要可以进行一些数据组合，
//                      作为参数，或是进行继续操作的验证
$$.ext.dummy2.execute = function(handlerName, data){
    var handlerObject = $$.ext.dummy2.getObject(handlerName, data);
    handlerObject.executeDummy();
};



// 实体化的时候，必须使用这个方法
// $$.ext.dummy2.getObject("PageDefault", data);
$$.ext.dummy2.getObject = function(handlerName, data){
    var handlerObject = new $$.ext.dummy2.fn[handlerName](data);
    return handlerObject;
};



$$.ext.dummy2.fn = {};  // 需要在脚本执行的方法，需要在这里面编写
$$.ext.dummy2.fn.Base = function(setting){
    var me = this;

    me.__set = function(name, val){
        this.__proto__[name] = val;
    };

    me.__get = function(name){
        return this.__proto__[name];
    };

    me.executeDummy = function(){};

    me.initSetting = function(setting){
        $$.ext.util.extend(this, setting);
    };

    me.init = function(setting){
        (new $$.ext.Object()).init.call(this);
        if (setting){
            this.initSetting(setting);
        }
    };

    this.init(setting);
};

$$.ext.dummy2.fn.Base.prototype = new $$.ext.Object();

// 页面父类
$$.ext.dummy2.setObject("PageBase", "Base", function(data){
    this.executeDummy = function(){
        var po = new $$.ext[this.__get("page")](this);
        this.__set("pageObject", po);
        po.load();
    };
});

// // 页面的收尾工作
// // 1. 记录服务器查询的接口数据，并把数据编号 放置到 元素 class="template-wrap"中
// //      以供后面的继续执行提供数据。
// $$.ext.dummy2.fn.PageBase.cbFinal = function(pageObject){
// };



$$.ext.dummy2.setObject(
    "PageDefault", "PageBase",
    function(data){
        this.__set("page", "PageDefault");
        this.root = 'result';
        // this.initSetting = function(setting){
        //     this.$ = setting.$;
        // };
    }
);



$$.ext.dummy2.setObject(
    "PagePagination", "PageDefault",
    function(data){
        this.__set("page", "PagePagination");
    }
);


$$.ext.dummy2.setObject(
    "PagePaginationPullDown", "PagePagination",
    function(data){
        this.__set("page", "PagePaginationPullDown");
    }
);


// 操作过程父类
$$.ext.dummy2.setObject(
    "HandlerBase", "Base",
    function(data){
        this.executeDummy = function(){};
    }
);