// 互动游戏 - 图片轮播
var anw_rw; // 选对选错
var mv_gj;
var mv_nt;
var count15;
var rightCount;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	// gamepara = '{"cover":"http://ipdl.cheerz.cn/hpyy/pic/p4.jpg","sentence":"Does this picture show #ear#?","answer":1,"duration":27}';

	if (gamepara != null) {
		json = JSON.parse(gamepara);
		var cover = json.cover;
		var sentence = unescape_quot(json.sentence);
		anw_rw = json.answer;
		var duration = json.duration; // todo
		rightCount = 0;

		// 背景
		$("#hd-yn-tuka").attr("src", cover);

		// 句子
		$("#hd-yn-que").html(sentence);

		$("#hd-time").hide();

		// 答案
		if (anw_rw == 1) {
			$("#hd-yes").removeClass();
			$("#hd-no").removeClass();
			$("#hd-yes").addClass("dui");
			$("#hd-no").addClass("cuo");
		} else if (anw_rw == 2) {
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
			// plus.webview.currentWebview().hide();  // 不要hide再show会导致跳帧
		}, (duration * 1000));
	}
}

function pro_result(click_rw) {
	console.log("click:" + click_rw + ", anw:" + anw_rw);
	clearInterval(count15);
	// setTimeout(endgame,2000);
	if (click_rw == anw_rw) {
		rightCount++;
		if (rightCount == 1) {
			addcoin(1);
		}
		endgame(true);
		play_good();
	} else {
		endgame(false);
		play_wrong();
	}
}

function addcoin(coin) {
	var iszhibo = localStorage.getItem("isnowzhibo");
	if (iszhibo == 1) {
		// 加金币
		var ts = Math.round(new Date().getTime() / 1000);
		var gurl = localStorage.getItem("gurl");
		var cha = gurl + "_" + ts;
		var memo = "_add" + coin;
		addcointoserv(coin, cha, memo);
	}
}

function endgame(correct) {
	$("#result").show();
	if (correct) $("#res_gj").show();
	else $("#res_nt").show();
	if (correct) mv_gj.play();
	else mv_nt.play();
}
