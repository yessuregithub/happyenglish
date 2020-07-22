var wtview;

function initwtcontent() {
	// 加载互动子页面
	var odiv = document.getElementById("wt_content");
	var left = odiv.getBoundingClientRect().left;
	var top = odiv.getBoundingClientRect().top;
	var width = odiv.getBoundingClientRect().width;
	var height = odiv.getBoundingClientRect().height;

	var wturl = 'http://www.cheerz.cn/characternew.htm';
	wtview = plus.webview.create(wturl, 'active', {
		top: top,
		left: left,
		height: height,
		width: width
	});
	
	plus.nativeUI.showWaiting();
	wtview.addEventListener('loading', function(e) {
		plus.nativeUI.showWaiting();
	}, false);
	
	wtview.addEventListener('loaded', function(e) {
		plus.nativeUI.closeWaiting();
	}, false);
	
	wtview.show(); // 显示窗口
	// wtview.loadURL(wturl);
}

function quit() {
	if (wtview) wtview.close();
	wtview = null;
	console.log('web close');
}
