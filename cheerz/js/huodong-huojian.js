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

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	//debug
	gamepara = "images/zb.jpg|Suck my ________?|It is something you love!|Mouse|Dick|2";
	//图片|第一句话|第二句话|可选单词1|可选单词2|答案
	gamedata = gamepara.split("|");
	$("#words1").text(gamedata[1]);
	$("#words2").text(gamedata[2]);
	$("#showimage").attr("src", gamedata[0]);
	$("#anwser1").text(gamedata[3]);
	$("#anwser2").text(gamedata[4]);
	answerindex = parseInt(gamedata[5]) - 1;
	stage = 1;
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
}
