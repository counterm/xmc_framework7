
/*----------------------------------------------------
                Ext Helper
-----------------------------------------------------*/

// Export selectors engine
var $$ = Dom7;

// external defined
$$.ext              = {};
// $$.ext.setting      = {
//     defaultRoot: 'result'
// };
// error log
$$.ext.error        = function(msg){
    console.log(msg);
};

// loading animation
$$.ext.loading      = function(flag){
    if (flag){
        app.showPreloader();
    }else{
        app.hidePreloader();
    }
};

// service url gate
$$.ext.url          = function(name){
    return "demo/" + name + ".json";
};

// template path gate
$$.ext.temp         = function(name){
    return "template/" + name + ".html";
};

// 服务器代码解析
$$.ext.serverParse  = function(data){
    //
    data = data.replace(/\r\n/g, '').replace(/\n/g,'');
    data = $$.ext.xml2json(data);
    // if ($$.ext.setting.defaultRoot && data[$$.ext.setting.defaultRoot]){
    //     data = data[$$.ext.setting.defaultRoot];
    // }
    return data;
};

/**
 * 页面类
 * @param {Object} url 接口地址，只提供名称就可以
 * @param {Object} param 请求参数
 * @param {String} template 模板地址，只提供名称就可以
 * @param {Object} tempswap 数据交换映射
 * @param {String} root 数据根层次
 * @param {Object} tempdata 本地数据，会忽略 url，以及param
 * 回调说明
 * 
 * @param setting.cbData 
 *        you can modify xml data after loading it, 
 *        argument is data 
 * 
 * @param setting.cbFinish 
 *        call while render html complete, you can return "false"
 *        to exchange the render process
 *        argument is html 
 * 
 * @param setting.cbBeforeLoad 
 *        before ajax load the service data
 *        argument is param setting.cbBeforeLoad= setting.data("cbBefore");
 */
$$.ext.PageDefault = function(setting){
    var me = this,
        _finishFn = [],
        _data = null;   // service data

    me.setting = $$.ext.util.extend({},setting); // keep setting safe
 
    // 默认
    if (me.setting.param && typeof me.setting.param == 'string'){
        me.setting.param = $$.ext.util.JSONParse(me.setting.param);
    }
    if (me.setting.tempdata && typeof me.setting.tempdata == 'string'){
        me.setting.tempdata = $$.ext.util.JSONParse(me.setting.tempdata);
    }
    if (me.setting.tempswap && typeof me.setting.tempswap == 'string'){
        me.setting.tempswap = $$.ext.util.JSONParse(me.setting.tempswap);
    }
    if (!me.setting.cbData){
        me.setting.cbData = function(a){return a};
    }
    if (!me.setting.cbBeforeLoad){
        me.setting.cbBeforeLoad = function(a){return a};
    }
    if (me.setting.cbFinish){
        _finishFn.push(me.setting.cbFinish);
    }

    // format url and template path
    me.setting.url = $$.ext.url(me.setting.url);
    me.setting.template = $$.ext.temp(me.setting.template);

    // handle data prepare callback 
    // and save the data argument
    me.cbDataHandler = function(data){
        var tmp = null,
            tempswap = me.setting.tempswap;

        // 寻找需根定位的根目录
        if (me.setting.root){
            data = eval("(data." + me.setting.root + ")" );
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

        if (me.setting.cbData){
            // TODO : DANGER, just avoid situation of empty data 
            var temp = me.setting.cbData(data);
            if (temp){
                data = temp;
            }
        }
        _data = data;
        return data;
    };

    // handle the finish callback
    // cancel default render(usually was the first callback function)
    // while function return "false"
    me.dbFinishHandler = function(html){
        var bol = true;
        for(i = _finishFn.length-1; i >= 0; i--){
            bol = _finishFn.pop()(html, _data);
            if (bol === false){
                return false;
            }else if (bol && typeof bol == 'string'){
                html = bol;
            }
        }
        return true;
    };


    // 追加回调方法
    // 新的方法放在最后
    me.addCbData = function(fn){
        var oldFn = me.setting.cbData;
        me.setting.cbData = function(data){
            var data = oldFn.call(me, data);
            data = fn.call(me, data);
            return data;
        }
    };

    // 追加回调方法
    // 新的放在前面
    me.addCbFinish = function(fn){
        _finishFn.push(fn);
    };

    // 获取相关的服务器接口资料，并且把相关资料返回第一参数 fnCallback
    // 如果不确定有没有本地数据 "setting.tempdata"
    // 则需要提供fnAjax方法，以访问服务器获取数据
    // fnAjax 接受三个参数, url, param, callback
    me.getServiceData = function(fnCallback, fnAjax){
        var innerDataCallback = function(data){
            data = me.cbDataHandler(data);
            fnCallback(data);
        };
        if (me.setting.tempdata){
            innerDataCallback(me.setting.tempdata);
        }else{
            fnAjax(me.setting.url, me.setting.param, innerDataCallback);
        }
    };

    me.getTemplate = function(){
        return me.setting.template;
    };

    me.getUrl = function(){
        return me.setting.url;
    };

    me.getParam = function(){
        return me.setting.param;
    };

};


/**
 * convenient get data and render html
 */
$$.ext.bindDataTemplate = function(pageObject){
    $$.get(pageObject.getTemplate(), function(html){
        var gettingData = function(data){
            var result = Template7.compile(html)(data);
            pageObject.dbFinishHandler(result);
        };
        var ajaxHandler = function(url, param, dataCallback){
            $$.post(url, param, function(data){
                data = $$.ext.serverParse(data);
                dataCallback(data);
            });
        };
        pageObject.222(gettingData, ajaxHandler);
    });
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
        target = $$(eleRoot + " [data-dummy]");
    }else{
        target = $$("[data-dummy]", eleRoot);
    }
    target.on('click touchend', function(e){
        if (e && e.preventDefault){
            e.preventDefault();
        }
        if (e && e.stopPropagation){
            e.stopPropagation();
        }
        var me = $$(this);
        // 数据处理
            var setting = {};
            var dummy   = me.data("dummy");
            dummy       = $$.ext.util.JSONParse(dummy);
            setting.url      = dummy._url || "";
            setting.template = me.data("temp");
            setting.tempswap = me.data("tempswap");
            setting.tempdata    = me.data("tempdata");
            if (setting.tempdata){
                setting.tempdata = $$.ext.util.JSONParse(setting.tempdata);
            }
            setting.root        = me.data("root");

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
            var cbBeforeLoad= me.data("cbBefore");
            if (cbBeforeLoad){
                setting.cbBeforeLoad = eval("window."+cbBeforeLoad);
            }

            delete dummy._url;
            setting.param       = dummy;

        // start and finish callback
        var callbackEndPoint = [
            function(){
                $$.ext.loading(1);
            },
            function(){
                $$.ext.loading(0);
            }
        ];

        // new a page object
        var pageObject = new $$.ext.PageDefault(setting);

        pageObject.addCbFinish(callbackEndPoint[1]);

        // 成功后追加到内容
        pageObject.addCbFinish(function(html){
            mainView.router.loadContent(html);
        });
        // 有可能外部来控制是否用这个渲染，所有需要放在后面插入，以提高优先级
        if (cbFinish){
            pageObject.addCbFinish(cbFinish);
        }

        callbackEndPoint[0]();

        $$.ext.bindDataTemplate(pageObject)
    });

    target = null;
    if (typeof eleRoot == 'string'){
        target = $$(eleRoot + " script[type='app/script']");
    }else{
        target = $$("script[type='app/script']", eleRoot);
    }
    
    for (var i in target){
        if (!isNaN(i)){
            eval(target[i].innerHTML);
        }
    }
};

$$.ext.xml2json = function (xml) {

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

            if (item.nodeType == 3) {
                continue;
            }

            var nodeName = item.nodeName;

            if (typeof(obj[nodeName]) == "undefined") {
                //20150312. nodeType:1是元素，2是属性，3是文本，4是<![CDATA[文本内容]]>
                if (item.childNodes.length == 1 && (item.firstChild.nodeType == 3 || item.firstChild.nodeType == 4) && item.attributes.length == 0 && item.textContent) {
                    obj[nodeName] = item.textContent.toString();
                }else if (item.childNodes.length == 0 && item.textContent == "") {
                    obj[nodeName] = "";
                }else {
                    obj[nodeName] = $$.ext.xml2json(item);
                }
            } else {
                if (typeof(obj[nodeName].push) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push($$.ext.xml2json(item));

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
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
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
                    target[name] = jQuery.extend(deep, // Never move original objects, clone them 
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

/*----------------------------------------------------
                View and Init
-----------------------------------------------------*/

// Initialize your app
var app = new Framework7();


// Add view
var mainView = app.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// load the first page
mainView.router.loadPage($$.ext.temp('archieve-list'));


// all page init
$$(document).on('pageInit', function (e) {
    $$.ext.initDummy(e.target);
});



/*----------------------------------------------------
                Pages and Init
-----------------------------------------------------*/

// 办文
app.onPageInit('doclist', function(page){

    //工具栏图标数
    var todo,doing;

    var fn = function(data){
        todo = data.todo;
        doing = data.doing;
        data.list = data.archieveList.item;
        delete data.archieveList;
        return data;
    };

    var arg = {
        template    : 'list',
        url         : 'list0',
        cbFinish    : null,
        cbData      : fn,
        root        : "result"
    }

    // LOADING
    $$.ext.loading(1);
    // 1
    /*arg.cbData = function(data){
        console.log(data);
        $$("[href='#doctab1'] > i > span.badge.bg-red").text(data.todo);
    }*/
    arg.cbFinish = function(html){
        console.log(html)
        $$("#doctab1 > div").html(html);
        $$.ext.initDummy('#doctab1');
        $$.ext.loading(0);
        if(todo!=="undefined" || todo>0){
            $$("[href='#doctab1'] > i > span.badge.bg-red").text(todo);
        }
    };
    $$.ext.bindDataTemplate( new $$.ext.PageDefault(arg) );

    arg.url = 'list1';
    arg.cbFinish = function(html){
        $$("#doctab2 > div").html(html);
        $$.ext.initDummy('#doctab2');
        if(doing!=="undefined" || doing>0){
            $$("[href='#doctab2'] > i > span.badge.bg-red").text(doing);
        }
    };
    $$.ext.bindDataTemplate( new $$.ext.PageDefault(arg) );

    arg.url = 'list2';
    arg.cbFinish = function(html){
        $$("#doctab3 > div").html(html);
        $$.ext.initDummy('#doctab3');
    };
    $$.ext.bindDataTemplate( new $$.ext.PageDefault(arg) );

    arg.url = 'list3';
    arg.cbFinish = function(html){
        $$("#doctab4 > div").html(html);
        $$.ext.initDummy('#doctab4');
    };
    $$.ext.bindDataTemplate( new $$.ext.PageDefault(arg) );

    app.showTab("#doctab1");
});