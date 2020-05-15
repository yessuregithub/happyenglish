// 互动游戏 - 图片轮播
var anw_yn; // 选对选错
var mv_gj;
var mv_nt;
var count15;
var queIndex;
var gameDatas;
var queCount;
var rightCount; // 答对次数

function startgame() {
	var gamepara = localStorage.getItem("gpara");

	// debug anw=选对选错 0:错 1:对
	var gamepara =
		'{"tuzi":[{"que":"question 1 ?","anw":1,"pic":"https://www.fangjial.com/uploads/allimg/200216/1K33I406-0.jpg"},{"que":"question 2 ?","anw":0,"pic":"https://www.fangjial.com/uploads/allimg/200216/1K33I406-0.jpg"},{"que":"question 3 ?","anw":1,"pic":"https://www.fangjial.com/uploads/allimg/200216/1K33I406-0.jpg"},{"que":"question 4 ?","anw":1,"pic":"https://www.fangjial.com/uploads/allimg/200216/1K33I406-0.jpg"},{"que":"question 5 ?","anw":0,"pic":"https://www.fangjial.com/uploads/allimg/200216/1K33I406-0.jpg"}]}';
	gameDatas = JSON.parse(gamepara).tuzi;
	queCount = gameDatas.length;

	queIndex = 0;
	rightCount = 0;
	setupGame(queIndex);

	// 加载欢庆动画
	if (gamepara != null) {
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
		// setTimeout(function() {
		// 	clearInterval(count15);
		// 	plus.webview.currentWebview().hide();
		// }, (duration * 1000));
	}
}

function setupGame(index) {
	if (gameDatas == null) return;
	var gameData = gameDatas[index];

	var cover = gameData.pic;
	var sentence = gameData.que;
	anw_yn = gameData.anw;
	console.log('问题:' + index + ' ' + cover + ' ' + sentence + ' ' + anw_yn);

	// 背景
	$("#hd-yn-tuka").attr("src", cover);

	// 句子
	$("#hd-yn-que").html(sentence);

	// 答案
	if (anw_yn == 1) {
		$("#hd-yes").removeClass();
		$("#hd-no").removeClass();
		$("#hd-yes").addClass("dui");
		$("#hd-no").addClass("cuo");
	} else if (anw_yn == 0) {
		$("#hd-yes").removeClass();
		$("#hd-no").removeClass();
		$("#hd-no").addClass("dui");
		$("#hd-yes").addClass("cuo");
	}
}

function pro_result(click_yn, overtime) {
	console.log("click:" + click_yn + ", anw:" + anw_yn);
	clearInterval(count15);
	// setTimeout(endgame,2000);

	var correct = false;
	if (click_yn == anw_yn && overtime == false) {
		correct = true;
		rightCount++;
	}

	// 显示对错 等待2秒
	setTimeout(function() {
		// 清除选中状态
		rmselected();

		// 处理兔子跑
		tuziRun(correct);
	}, 2000);
}

function tuziRun() {
	// 奔跑结束
	tuziRunEnd();
}

function tuziRunEnd() {
	queIndex++;
	if (queIndex >= queCount) {
		if (rightCount > 0) {
			endgame(true);
		} else {
			endgame(false);
		}
	} else {
		// 下一题
		setupGame(queIndex);
		openAds(); // 开启新题
	}
}

function endgame(correct) {
	$("#hd-time").hide();
	$("#result").show();
	if (correct) $("#res_gj").show();
	if (correct) mv_gj.play();
}
