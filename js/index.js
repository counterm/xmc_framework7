// Initialize your app
var myApp = new Framework7({
	//scroller:"js",
	template7Pages: true,//Template7模板

	//Specify templates/pages data
    template7Data: {
        // This context will applied for page/template with "archieve-list.html" URL
        'url:archieve-list.html': {
            name: 'John Doe',
            age: 38,
            company: 'Apple',
            position: 'Developer'
        }
    },
    modalButtonOk: '确定',
    modalButtonCancel: '取消',
    swipePanel: 'right',//设置滑动屏幕打开侧栏方向
    smartSelectBackText: "确定"
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    //使用动态导航栏
    dynamicNavbar: true
});

// 首页跳转到archieve-list.html
mainView.router.load({
    url: 'archieve-list.html',
    animatePages: false,
    context: {
      name: 'john',
      email: 'contact@john.doe'
    }
})


/*$$(document).on("pageInit",function(){
    $$(".swipeout-delete").on("click",function(){
        myApp.modal({
            buttons: [
                {
                    text:"取消"
                },
                {
                    text:"确定"
                }
            ]
        })
    })
})*/




         














