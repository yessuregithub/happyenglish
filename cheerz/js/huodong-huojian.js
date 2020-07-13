var token;
var stage;
var second, totalseconds;
var counter;
var checked = false;
var answerindex;
var mv_st; // 火箭升天
var mv_hy; // 火箭黑烟
var mv_gj;
var mv_nt;
var rightCount;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	console.log("huojian:" + gamepara);
	json = JSON.parse(gamepara);
	$("#words1").text(unescape_quot(json.words1));
	$("#words2").text(unescape_quot(json.words2));
	$("#showimage").attr("src", json.image);
	$("#anwser1").attr("src", json.answer1);
	$("#anwser2").attr("src", json.answer2);
	answerindex = parseInt(json.answer) - 1;
	stage = 1;
	rightCount = 0;
	setTimeout(showselect, 15000);

	// 欢喜最后一帧
	$("#result").hide();
	$("#res_gj").hide();
	$("#res_nt").hide();

	// 火箭升天
	$("#huojian-mv").hide();
	$("#huojian-st").hide();
	$("#huojian-hy").hide();
	mv_st = new seqframe({
		container: document.getElementById('huojian-st'),
		urlRoot: 'movie/huosheng/',
		imgType: 'png',
		frameNumber: 6,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_st.load();
	// 火箭黑烟
	mv_hy = new seqframe({
		container: document.getElementById('huojian-hy'),
		urlRoot: 'movie/huoheiyan/',
		imgType: 'png',
		frameNumber: 6,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_hy.load();

}

function showselect() {
	stage = 2;
	$("#uc_01").show();
	$("#timecount").attr("style", "width:100%");
	$("#progress1").show();
	second = 5;
	totalseconds = 5;
	counter = setInterval(countdown, 100);
}

function countdown() {
	second -= 0.1;
	var length = Math.round((second * 100) / totalseconds);
	$("#timecount").attr("style", "width:" + length + "%");
	if (second < 0.1) {
		clearInterval(counter);
		processanswer(false);
	}
}

function processanswer(correct) {
	console.log(correct);

	$("#light").hide();
	$("#hd-huidi").hide();
	$("#huojian-jt").hide();
	$("#huojian-mv").show();

	if (correct) $("#huojian-st").show();
	else $("#huojian-hy").show();
	if (correct) mv_st.play();
	else mv_hy.play();

	setTimeout(function() {
		$("#huojian-mv").hide();
		$("#huojian-st").hide();
		$("#huojian-hy").hide();

		$("#result").show();
		if (correct) $("#res_gj").show();
		else $("#res_nt").show();
	}, 1500);

	// 加金币
	if (correct) {
		rightCount++;
		if (rightCount == 1) {
			addcoin(1);
		}
		play_good();
	} else {
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
