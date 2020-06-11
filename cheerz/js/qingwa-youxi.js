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
var token;
var playerpos = new Array(5);
var toolate = false;
var playername = new Array(5); //为统一编号，把0留空
var playerid = new Array(5);
var lid;

lid = localStorage.getItem("less_id")
for (i = 1; i <= 4; i++) {
	playername[i] = localStorage.getItem("playername" + i);
	//console.log("get "+i+":"+playername[i]);
	if (playername[i] == "undefined") playername[i] = "";
	playerid[i] = localStorage.getItem("playerid" + i);
	if (playerid[i] == "undefined") playername[i] = 0;
}
var gamestarttime = parseInt(localStorage.getItem("ts"));
var lessonstarttime = localStorage.getItem("less_starttime"); //游戏起始时间


function scene_init() {
	for (i = 1; i <= 4; i++) {
		playerpos[i] = 0;
		tag = "#frame" + i;
		if (playername[i] == "" || playername[i] == undefined)
			$(tag).attr("style", "display:none");
		else {
			tag = "#name" + i;
			console.log(tag + " online");
			$(tag).text(playername[i]);
		}
	}
	currtime = Date.parse(new Date()) / 1000; //计算进入游戏的时间
	waittime = 15; //debug 规则讲解
	console.log("lessonstarttime " + lessonstarttime + "gamestarttime " + gamestarttime + "currtime " + currtime +
		"waittime " + waittime);

	second = waittime;
	if (second <= 0) { //进入得太晚，不能再开始游戏

		toolate = true;
		mui.alert('迟到啦！游戏已经开始了，下次再来，别再晚了哦！');
		setTimeout(function() {
			plus.webview.currentWebview().hide();
		}, 2000);
		return;
	}
	totalseconds = second;
	count15 = setInterval(countdown, 100);
}

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	gameDatas = JSON.parse(gamepara).qingwa;
	queCount = gameDatas.length;

	scene_init();
	// debug anw=选对选错 0:错 1:对

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
	}

	$("#ads").attr('style', 'display:none');
}

function setupGame(index) {
	if (gameDatas == null) return;
	var gameData = gameDatas[index];

	var pic = gameData.pic;
	var sentence = unescape_quot(gameData.que);
	anw_yn = gameData.anw;
	//console.log('问题:' + index + ' ' + cover + ' ' + sentence + ' ' + anw_yn);


	choosed = false;
	click_yn = -1;

	// 问题背景
	$("#hd-yn-tuka").attr("src", pic);
	console.log("loading pic here/preload");

	// 句子
	$("#hd-yn-que").html(sentence);

	// 答案 1-yes 2-no
	if (anw_yn == 1) {
		$("#hd-yes").removeClass();
		$("#hd-no").removeClass();
		$("#hd-yes").addClass("dui");
		$("#hd-no").addClass("cuo");
	} else if (anw_yn == 2) {
		$("#hd-yes").removeClass();
		$("#hd-no").removeClass();
		$("#hd-no").addClass("dui");
		$("#hd-yes").addClass("cuo");
	}
}

var click_yn = -1; // 选中后暂时不处理，作答时间到了处理
function pro_result(overtime) {
	console.log("click:" + click_yn + ", anw:" + anw_yn);

	var correct = false;
	if (click_yn == anw_yn && overtime == false) {
		correct = true;
		rightCount++;
	}

	mui.ajax({
		url: 'http://47.241.5.29/Home_index_sendfrogresult.html',
		data: {
			token: token,
			que: queIndex,
			rst: correct,
			lid: lid,
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {}
			if (data.rst == 1) {}
		},
		error: function(xhr, type, errorThrown) {}
	});

	// 清除选中状态
	rmselected();

	hideQue();

	// 处理兔子跑
	tuziRun();

	// // 显示对错 等待2秒
	// setTimeout(function() {
	// 	// 清除选中状态
	// 	rmselected();

	// 	hideQue();

	// 	// 处理兔子跑
	// 	tuziRun();
	// }, 1500);
}

function hideQue() {
	$("#ads").hide();
	$("#result").hide();
	$("#hd-danci").hide();
	$("#hd-huidi").hide();
	$("#hd-time").hide();
}

function tuziRun() {
	// inquireotherplayer();
	// 检测所有跑道
	checkcounter = 0;
	checker = setInterval(checkotherplayer, 1000);
}

var checkcounter;
var checker;

function inquireotherplayer() {
	console.log("inquireotherplayer");
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_frogresult.html',
		data: {
			token: token,
			que: queIndex,
			lid: lid
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {}
			if (data.rst == 1) { //兔子在这里跳
				// console.log("tuziRunAction");
				tuziRunAction(data);
			}
		},
		error: function(xhr, type, errorThrown) {}
	});
}

function checkotherplayer() {
	checkcounter++;
	if (checkcounter == 5) {
		clearInterval(checker);
	} else {
		inquireotherplayer();
	}
}

function tuziRunEnd() {
	console.log("new question" + (queIndex + 1));

	// $("#hd-time").show();
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
		openAds();
	}
}

// 兔子跑动画
function tuziRunAction(data) {
	for (i = 1; i <= 4; i++) {
		switch (i) {
			case 1:
				uid = data.posdata.p1;
				pos = data.posdata.p1p;
				break;
			case 2:
				uid = data.posdata.p2;
				pos = data.posdata.p2p;
				break;
			case 3:
				uid = data.posdata.p3;
				pos = data.posdata.p3p;
				break;
			case 4:
				uid = data.posdata.p4;
				pos = data.posdata.p4p;
				break;
			default:
				uid = data.posdata.p4;
				pos = data.posdata.p4p;
				break;

		}
		lane = getlanebyid(uid);
		if (lane == 0) continue;

		if (playerpos[lane] != pos) {
			tuziRunToPos(lane, pos);
			playerpos[lane] = pos;
		}
	}
}

function tuziRunToPos(no, pos) {
	console.log("tuzi run " + no + " to " + pos);
	// 删除青蛙
	$('#frame' + no).find(".qingwa-tu").remove();

	var posItem = $('#frame' + no).find("li");

	// 第2步开始做动画
	if (pos == 1) {
		$(posItem[pos]).html('<div class="item"></div><div class="qingwa-tu"><img src="images/qw.png"></div>');
	}
	// 动画
	else {
		var html = '<div id="qingwa-mov' + no + '" class="qingwa-tu" style="width:4.9rem;height:2.75rem" ></div>';
		$(posItem[pos - 1]).html(html);
		new seqframe({
			container: document.getElementById("qingwa-mov" + no),
			urlRoot: 'movie/qingwa/',
			imgType: 'png',
			frameNumber: 4,
			framePerSecond: 10,
			loadedAutoPlay: true,
			loop: 1,
		}).load();

		// 播放结束
		setTimeout(function() {
			$(posItem[pos - 1]).html('<div class="item"></div><div class="qingwa-tu"></div>');
			$(posItem[pos]).html('<div class="item"></div><div class="qingwa-tu"><img src="images/qw.png"></div>');
		}, 400);
	}
}


function getlanebyid(uid) {
	result = 0;
	for (i = 1; i <= 4; i++)
		if (playerid[i] == uid && uid != 0) {
			result = i;
			break;
		}
	return result;
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
	setTimeout(function() {
		plus.webview.currentWebview().hide();
	}, (5 * 1000));
}
