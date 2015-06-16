/*mainView.router.load({
    url: 'archieve-list.html',
    animatePages: false,
    context: {
      tel: '(999)-111-22-33',
      email: 'contact@john.doe'
    }
})*/

$$(document).on('pageInit', function (e) {
  	// Do something here when page loaded and initialized
  	
  	//添加下拉刷新监听器
	$$(".pull-to-refresh-content").on("refresh",function(){
		setTimeout(function(){
			myApp.pullToRefreshDone();//重置下拉刷新
			// myApp.pullToRefreshTrigger();//JS触发下拉刷新
			// myApp.initPullToRefresh();//初始化/启用下拉刷新
			// myApp.destroyPullToRefresh();//销毁/禁用下拉刷新
		},2000)
	})

	
	//*****************无限滚动测试/*****************//
	// 加载flag
	var loading = false;

	// 上次加载的序号
	// var lastIndex = $$('[data-page="message-list"].list-block li').length;
	var lastIndex = $$('[data-page="message-list"]>.page-content ul li').length;

	// 最多可加载的条目
	var maxItems = 60;

	// 每次加载添加多少条目
	var itemsPerLoad = 20;

	// 注册'infinite'事件处理函数
	$$('.infinite-scroll').on('infinite', function() {

		// 如果正在加载，则退出
		if (loading) return;

		// 设置flag
		loading = true;

		// 模拟1s的加载过程
		setTimeout(function() {
			// 重置加载flag
			loading = false;

			if (lastIndex >= maxItems) {
				// 加载完毕，则注销无限加载事件，以防不必要的加载
				myApp.detachInfiniteScroll($$('.infinite-scroll'));
				// 删除加载提示符
				$$('.infinite-scroll-preloader').remove();
				return;
			}

			// 生成新条目的HTML
			var html = '';
			for (var i = lastIndex + 1; i <= lastIndex + itemsPerLoad; i++) {
				html += '<li><a class="item-content item-link"><div class="item-inner"><div class="item-title">Item ' + i + '</div></div></a></li>';
			}

			// 添加新条目
			$$('[data-page="message-list"]>.page-content ul').append(html);

			// 更新最后加载的序号
			// lastIndex = $$('.list-block li').length;
			lastIndex = $$('[data-page="message-list"]>.page-content ul li').length;
		}, 3000);
	});


	//注销，返回登录页
	$$("#logout").on("click",function(){
		
		//---todo,这里以后要添加注销方法，去掉session等
		
	    location.href="login.html";
	    // window.history.go(-1);
	})
	/*$$('.open-login').on('click', function () {
	  myApp.loginScreen();
	});*/
	
})
