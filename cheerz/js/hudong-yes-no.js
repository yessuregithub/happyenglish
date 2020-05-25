// 互动游戏 - 图片轮播
var anw_rw; // 选对选错
var mv_gj;
var mv_nt;
var count15;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	//gamepara = "https://www.fangjial.com/uploads/allimg/200216/1K33I406-0.jpg|Have you something hard?|1"; //debug
	if (gamepara != null) {
		json=JSON.parse(gamepara);

		var cover = json.cover;
		var sentence = json.sentence;
		anw_rw = json.answer;
		var duration = json.duration; // todo

		// 背景
		$("#hd-yn-tuka").attr("src", cover);

		// 句子
		$("#hd-yn-que").html(sentence);

		// 答案
		if (anw_rw == 1) {
			$("#hd-yes").removeClass();
			$("#hd-no").removeClass();
			$("#hd-yes").addClass("dui");
			$("#hd-no").addClass("cuo");
		} else if (anw_rw == 0) {
			$("#hd-yes").removeClass();
			$("#hd-no").removeClass();
			$("#hd-no").addClass("dui");
			$("#hd-yes").addClass("cuo");
		}
		// 加载欢喜动画
		$("#result").hide();
		$("#res_gj").hide();
		$("#res_nt").hide();
		mv_gj = new seqframe({
			container: document.getElementById('res_gj'),
			urlRoot: 'movie/goodjob/',
			imgType: 'png',
			frameNumber: 5,
			framePerSecond: 10,
			loadedAutoPlay: false,
			loop: 1,
		});
		mv_gj.load();

		mv_nt = new seqframe({
			container: document.getElementById('res_nt'),
			urlRoot: 'movie/nicetry/',
			imgType: 'png',
			frameNumber: 5,
			framePerSecond: 10,
			loadedAutoPlay: false,
			loop: 1,
		});
		mv_nt.load();
		
		// 设置游戏持续时间
		setTimeout(function() {
			clearInterval(count15);
			plus.webview.currentWebview().hide();
		}, (duration * 1000));
	}
}

function pro_result(click_rw) {
	console.log("click:" + click_rw + ", anw:" + anw_rw);
	clearInterval(count15);
	// setTimeout(endgame,2000);
	if (click_rw == anw_rw) {
		endgame(true);
	} else {
		endgame(false);
	}
}

function endgame(correct) {
	$("#result").show();
	if (correct) $("#res_gj").show();
	else $("#res_nt").show();
	if (correct) mv_gj.play();
	else mv_nt.play();
}
