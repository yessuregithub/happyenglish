// 互动游戏 - 图片轮播

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	if (gamepara != null) {
		var paras = gamepara.split("|");
		var duration = paras[0];
		var cover = paras[1];
		$("#lunbo-bg").attr("src", cover);

		// 设置持续时间
		setTimeout(function() {
			plus.webview.currentWebview().hide();
		}, (duration * 1000));
	}
}

function endgame() {

}
