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

for (i = 1; i <= 4; i++) {
	playername[i] = localStorage.getItem("playername" + i);
	if (playername[i] == undefined) playername[i] = "";
}
//debug 
playername[1] = "test";
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
			$(tag).text(playername[i]);
		}
	}
	currtime = Date.parse(new Date()) / 1000; //计算进入游戏的时间
	waittime = lessonstarttime + gamestarttime - currtime;
	//debug
	waittime = 5;
	second = waittime;
	if (second <= 0 ) //进入得太晚，不能再开始游戏
	{
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
	var gamepara =
		'{"tuzi":[{"que":"question 1 ?","anw":1,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 2 ?","anw":0,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 3 ?","anw":1,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 4 ?","anw":1,"pic1":"images/zb.jpg","pic2":"images/05.png"},{"que":"question 5 ?","anw":0,"pic1":"images/zb.jpg","pic2":"images/05.png"}]}';
	gameDatas = JSON.parse(gamepara).tuzi;
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

	mui.ajax({
		url: 'http://47.241.5.29/Home_index_sendrabbitresult.html',
		data: {
			token: token,
			que: queIndex,
			rst: correct,
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
	// 显示对错 等待2秒
	setTimeout(function() {
		// 清除选中状态
		rmselected();

		// 处理兔子跑
		tuziRun();
	}, 2000);
}
var checkcounter;
var checker;

function inquireotherplayer() {
	mui.ajax({
		url: 'http://47.241.5.29/Home_index_rabbitresult.html',
		data: {
			token: token,
			que: queIndex
		},
		async: true,
		dataType: 'json',
		type: 'post',
		timeout: 10000,
		success: function(data) {
			// 请求成功
			if (data.rst == 0) {}
			if (data.rst == 1) { //兔子在这里跳
				console.log("server set position:" + JSON.stringify(data) + " p1=" + data.p1);
				tuziRunAction(data);
			}
		},
		error: function(xhr, type, errorThrown) {}
	});
}

function checkotherplayer() {
	checkcounter++;
	if (checkcounter == 10) {
		clearInterval(checker);
		tuziRunEnd();
	} else {
		inquireotherplayer();
	}
}

function tuziRun() {
	$("#ads").hide();
	$("#result").hide();
	$("#hd-danci").hide();
	$("#hd-huidi").hide();
	$("#hd-time").hide();
	// 奔跑结束
	checkcounter = 0;
	checker = setInterval(checkotherplayer, 1000);
	//tuziRunEnd();
}

// 兔子跑动画
function tuziRunAction(posData) {
	for (i = 1; i <= 4; i++) {
		if (playername[i] == "" || playername[i] == undefined) {

		} else {
			// 位置对比
			var pos = null;
			switch (i) {
				case 1:
					pos = posData.p1;
					break;
				case 2:
					pos = posData.p2;
					break;
				case 3:
					pos = posData.p3;
					break;
				case 4:
					pos = posData.p4;
					break;
				default:
					pos = null;
			}

			if (pos == null) continue;

			if (playerpos[i] != pos) {
				tuziRunToPos(i, pos);
				playerpos[i] = pos;
			}
		}
	}
}

function tuziRunToPos(no, pos) {
	var tag;
	console.log("tuzi run " + no + " to " + pos);
	// 删除兔子
	$('#frame' + no).find(".tuzi-tu").remove();

	// 删除草堆
	var posItem = $('#frame' + no).find("li");
	for (var i = 0; i < posItem.length; i++) {

		if (i == pos) {
			$(posItem[i]).html('<div class="item"></div><div class="tuzi-tu"><img id="tuzi"' + no +
				' src="images/tz.png"></div>');
		}
		if (i == pos) {
		}
	}
}



function tuziRunEnd() {
	$("#hd-time").show();
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
	setTimeout(function() {
		plus.webview.currentWebview().hide();
	}, (5 * 1000));
}
