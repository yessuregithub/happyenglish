// 互动游戏 - 图片轮播

function startgame() {
	var gamepara = localStorage.getItem("gpara");

	if (gamepara != null) {
		json = JSON.parse(gamepara);
		var duration = json.duration;
		var cover = json.cover;
		$("#lunbo-bg").attr("src", cover);
		console.log(cover);
		
		// 设置持续时间
		setTimeout(function() {
			// plus.webview.currentWebview().hide(); // 不要hide再show会导致跳帧
		}, (duration * 1000));
	}
}

function endgame() {

}
