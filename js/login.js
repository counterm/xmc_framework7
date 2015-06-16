// 初始化应用
var myApp = new Framework7();

// 输出选择器引擎
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    //使用动态导航栏
    // dynamicNavbar: false
});

// myApp.loginScreen();



/*(function(){
    $$.ajax({
        type: "post",
        url: "?xmc_function=BS_Parser&xmc_url=http://localhost/xmc_getOAParams",
        dataType:"xml",
        success: function(xml,status){
            console.log(xml);
        }
    })
})();*/
// var oa_url = "http://192.168.100.28/moa/";



// $$(document).on("pageInit",function(){
    //在登录页禁用滑动屏幕打开侧栏
    // myApp.params.swipePanel = "false";
    //点击登录
    $$("#login").on("click",function(){
        //myApp.alert('Login!');
        var username = $$("[name='username']").val();
        if (username.trim().length == 0) {
            myApp.alert("请输入用户名", "温馨提示");
            event.preventDefault();
            return;
        }
        var password = $$("[name='password']").val();
        if (password.trim().length == 0) {
            myApp.alert("请输入密码", "温馨提示");
            event.preventDefault();
            return;
        }


        myApp.showIndicator();
        setTimeout(function () {
            myApp.hideIndicator();
            location.href="index.html";
        }, 2000);


        // $$.ajax({
        //     type: 'POST',
        //     // url: "?xmc_function=Login&xmc_url=" + login_path + login_path_params,
        //     url: "?xmc_function=Login",
        //     data: {
        //         xmc_url: oa_url+"Login.asp",
        //         LoginName: username,
        //         LoginPWD: password,
        //         xmc_username: username,
        //         xmc_password: password,
        //         UnitId: 1
        //     },
        //     dataType: "XML",
        //     timeout: 30000,
        //     success: function(xml, textStatus) {
        //         /*var data = xmlToJsonObject(xml);
        //         var status = $$(xml).find("IsLogin").text();
        //         var unitId = $$(xml).find("UnitId").text();
        //         var userId = $$(xml).find("UserId").text();*/
                
        //         var xmc_mobiletype = getParameter('xmc_mobiletype', location.href);
        //         if (xmc_mobiletype.indexOf('android') != -1) {
        //             xmc_mobiletype = 'xmc_mobiletype=android';
        //         }
        //         // alert(xmc_mobiletype)

        //         var status = "TRUE";
        //         var unitId = 1;
        //         var userId = 0;

        //         //主页界面
        //         var mainHtml = "?xmc_function=Forward_Page&xmc_path=myframework7/index.html" + "&UnitId=" + unitId + "&UserId=" + userId;


        //         if (status == 'TRUE') {
        //             if (xmc_mobiletype.split('=')[1] == 'android') {
        //                 // <!--android系统-->
        //                 if ($$("#slider2").is(":checked")) {
        //                     ext.loginSavePwd(username, password, mainHtml);
        //                 }else {
        //                     ext.loginClearPwd(mainHtml);
        //                 }
        //             }else if (xmc_mobiletype.split('=')[1] == 'ios') {
        //               // <!--ios系统-->
        //                 if ($$("#slider2").is(":checked")) {
        //                     location.href = "TWAMobile:loginSavePwd:" + username + ":" + password + ":ci.do" + mainHtml;
        //                 } else {
        //                     location.href = "TWAMobile:loginClearPwd:ci.do" + mainHtml;
        //                 }
        //             }else {
        //                 // <!--浏览器登陆-->
        //                 window.location = mainHtml;
        //             } 
        //         }else if (status == 'FALSE') {
        //             myApp.alert("温馨提示", "用户名或密码错误");
        //         }else{
        //             myApp.alert("温馨提示", "服务器异常，请联系管理员。");
        //         }
        //         // location.href = "index.html";

        //     },
        //     complete: function(XMLHttpRequest, status) {
        //         if (status == 'timeout') { //超时,status还有success,error等值的情况
        //             myApp.alert("温馨提示", "系统繁忙，请稍后再试。");
        //         } else if (status == "error") {
        //             myApp.alert("温馨提示", "服务器异常，请联系管理员。");
        //         }
        //     }
        // });

    })


    function getParameter(paraStr, url) {
        var result = "";
        // <!-- 获取URL中全部参数列表数据 -->
        var str = "&" + url.split("?")[1];
        var paraName = paraStr + "=";
        // <!-- 判断要获取的参数是否存在 -->

        // <!-- 如果要获取的参数到结尾是否还包含“&amp;” -->
        if (str.substring(str.indexOf(paraName), str.length).indexOf('&') != -1) {
            // <!-- 得到要获取的参数到结尾的字符串 -->
            var TmpStr = str.substring(str.indexOf(paraName), str.length);
            // <!-- 截取从参数开始到最近的“&amp;”出现位置间的字符 -->
            result = TmpStr.substr(TmpStr.indexOf(paraName), TmpStr.indexOf("&") - TmpStr.indexOf(paraName));
        } else {
            result = str.substring(str.indexOf(paraName), str.length);
        }

        return (result.replace("&", ""));
    }

// })