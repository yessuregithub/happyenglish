// 互动游戏 - 图片轮播

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	console.log("loaded " + gamepara);
	
	if (gamepara != null) {
		json = JSON.parse(gamepara);
		console.log("parse json");
		var duration = json.duration;
		var cover = json.cover;
		$("#lunbo-bg").attr("src", cover);

		// 设置持续时间
		setTimeout(function() {
			plus.webview.currentWebview().hide();
		}, (duration * 1000));
	}
	
}

function endgame() {

}
