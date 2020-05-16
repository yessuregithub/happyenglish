// 互动游戏 - 图片轮播
var anw_yn; // 选对选错
var mv_gj;
var mv_nt;
var count15;
var queIndex;
var gameDatas;
var queCount;
var rightCount; // 答对次数
var choosed;

//--------------以下数据需要正确设置

var playername = new Array(5); //为统一编号，把0留空

playername[1] = "test1";
playername[2] = "test2";
playername[3] = "";
playername[4] = "test4";
var lessonstarttime = 12345; //课程开始时间，时间戳
var gamestarttime = 12345; //游戏起始时间

function scene_init() {
	for (i = 1; i <= 4; i++) {
		tag = "#frame" + i;
		if (playername[i] == "" || playername[i] == undefined)
			$(tag).attr("style", "display:none");
		else {
			tag = "#name" + i;
			$(tag).text(playername[i]);
		}
	}
	currtime = Date.parse(new Date()) / 1000; //计算进入游戏的时间
	waittime = lessonstarttime + gamestarttime - currtime;
	waittime = 5; //DEBUG! todo
	second = waittime;
	totalseconds = second;
	count15 = setInterval(countdown, 100);
}

function startgame() {
	var gamepara = localStorage.getItem("gpara");

	scene_init();
	// debug anw=选对选错 0:错 1:对
	var gamepara =
		'{"tuzi":[{"que":"question 1 ?","anw":1,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 2 ?","anw":0,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 3 ?","anw":1,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 4 ?","anw":1,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 5 ?","anw":0,"pic1":"images/zb.jpg","pic2":"images/05.png"}]}';
	gameDatas = JSON.parse(gamepara).tuzi;
	queCount = gameDatas.length;

	queIndex = 0;
	rightCount = 0;
	//setupGame(queIndex);

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
	$("#ads").attr('style', 'display:none');

}

function setupGame(index) {
	if (gameDatas == null) return;
	var gameData = gameDatas[index];

	var pic1 = gameData.pic1;
	var pic2 = gameData.pic2;
	var sentence = gameData.que;
	anw_yn = gameData.anw;
	//console.log('问题:' + index + ' ' + cover + ' ' + sentence + ' ' + anw_yn);

	// 背景
	//$("#hd-yn-tuka").attr("src", cover);
	$("#pic1").attr("src", pic1);
	$("#pic2").attr("src", pic2);
	console.log("loading pic here/preload");
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
	clearInterval(count15);
	console.log("click:" + click_yn + ", anw:" + anw_yn);

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
	/*	$("#ads").hide();
		$("#result").hide();
		$("#hd-danci").hide();
		$("#hd-huidi").hide();
		// 奔跑结束
	*/
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
		stage = 2;
		second = 3;
		totalseconds = 3;
		count15 = setInterval(countdown, 100);
	}
}

function endgame(correct) {
	console.log("game end");
	$("#hd-time").hide();
	$("#hd-danci").hide();
	$("#result").show();
	if (correct) {
		$("#res_gj").show();
		mv_gj.play();
	} else {
		$("#res_nt").show();
		mv_nt.play();
	}
}
