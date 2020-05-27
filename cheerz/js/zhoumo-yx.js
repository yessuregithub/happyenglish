var mv_gj;
var mv_nt;
var mv_chicuo;
var mv_chidui;
var worddatas;
var wordcount; // 单词数
var options; // 3选项数据
var rightno; // 本轮正确单词编号
var count15;
var correctCount;
var xinCount;

function startgame() {
	var gamepara = localStorage.getItem("gpara");

	// debug 测试5个实际应该有20个 ，根据数量生成
	gamepara =
		'[{"wno":1,"wpic1":"images/w1.png","wpic2":"images/p1.png","sound":"s1.mp3"},{"wno":2,"wpic1":"images/w2.png","wpic2":"images/p2.png","sound":"s2.mp3"},{"wno":3,"wpic1":"images/w3.png","wpic2":"images/p3.png","sound":"s3.mp3"},{"wno":4,"wpic1":"images/w4.png","wpic2":"images/p4.png","sound":"s4.mp3"},{"wno":5,"wpic1":"images/w5.png","wpic2":"images/p5.png","sound":"s5.mp3"}]';
	json = JSON.parse(gamepara);
	worddatas = json;
	wordcount = worddatas.length;

	loadMovie();

	xinCount = 3;
	correctCount = 0;

	genopt();
	setQues();
}

function setQues() {
	var opts = options;
	var rightdata = getDataByNo(rightno);
	// 贴题目	
	var tuka = rightdata.wpic2;
	$("#hd-yn-tuka").attr("src", tuka)

	// 帖选项
	var eles = $("#uc_01").find(".word-img");
	for (var i = 0; i < eles.length; i++) {
		$(eles[i]).html('<img src=' + opts[i].wpic1 + '>');
	}

	$(".danci").find(".dui").remove();
	$("#uc_01").find("li").removeClass("disabled");
	eles = $("#uc_01").find(".danci");
	for (var i = 0; i < eles.length; i++) {
		if (opts[i].wno == rightno) {
			$(eles[i]).append('<div class="dui"></div>');
			break;
		}
	}

	// 贴食物
	var foods = new Array();
	for (var i = 0; i < 3; i++) {
		while (true) {
			food = getRandom(1, 20);
			if ($.inArray(food, foods) == -1) {
				foods.push(food);
				break;
			}
		}
	}
	eles = $("#uc_01").find(".img-box");
	for (var i = 0; i < eles.length; i++) {
		$(eles[i]).html('<img src=images/food/food' + foods[i] + '.png>');
	}

}

function getRandom(min, max) {
	return Math.round(Math.random() * 10000) % max + min;
}

function getDataByNo(wno) {
	if (!worddatas) return null;
	for (var i = 0; i < worddatas.length; i++) {
		if (worddatas[i].wno == wno) {
			return worddatas[i];
		}
	}
	return null;
}

function genopt() {
	var opts = new Array();
	var optw = new Array();

	var newno = rightno;
	while (newno == rightno) {
		newno = getRandom(1, wordcount);
	}
	rightno = newno;
	console.log("right:" + rightno);

	optw.push(newno);
	var rightdata = getDataByNo(rightno);

	var tmp = getRandom(0, 2);
	opts[tmp] = rightdata;


	// opt2
	newno = rightno;
	while (true) {
		newno = getRandom(1, wordcount);
		if ($.inArray(newno, optw) == -1) {
			optw.push(newno);
			break;
		}
	}
	var optdata = getDataByNo(newno);
	opts[(tmp + 1) % 3] = optdata;

	// opt3
	while (true) {
		newno = getRandom(1, wordcount);
		if ($.inArray(newno, optw) == -1) {
			optw.push(newno);
			break;
		}
	}
	var optdata = getDataByNo(newno);
	opts[(tmp + 2) % 3] = optdata;

	console.log(optw)

	options = opts;
}

function removeHear() {
	licount = $(".xin").find("img").length;
	for (var i = 0; i < licount; i++) {
		if (i + 1 > xinCount) {
			if ($(".xin").find("img")[i] != null) {
				$(".xin").find("img")[i].remove();
			}
		}
	}
}

function pro_result(click_index) {
	var correct = false;
	if (options[click_index].wno == rightno) correct = true;
	console.log("click:" + click_index + "," + correct);

	disable_choose();

	if (correct) {
		$("#chidui").show();
		mv_chidui.play();
	} else {
		$("#chicuo").show();
		mv_chicuo.play();
	}

	// 新题
	setTimeout(function() {
		// 清除选中状态
		enable_choose();
		rmselected();

		$("#chidui").hide();
		$("#chicuo").hide();

		if (correct) {
			correctCount++;
			$("#score").html(correctCount * 10);

			genopt();
			setQues();
		} else {
			xinCount--;
			removeHear();

			if (xinCount == 0) {
				stage = 2;
				console.log("endgame :"+correctCount);
				endgame();
			}
		}

	}, 1200);
}

function endgame() {	
	disable_choose();
	clearInterval(count15);

	var hisscore = localStorage.getItem("score_chi");
	if (hisscore == null || hisscore == "" || typeof(hisscore) == undefined) {
		localStorage.setItem("score_chi", correctCount);
		$("#new_his").show();
		$("#new_his").html("新纪录：" + (correctCount * 10));
	} else if (parseInt(hisscore) < correctCount) {
		console.log("刷新纪录老" + hisscore + " 新" + correctCount);
		localStorage.setItem("score_chi", correctCount);
		$("#new_his").show();
		$("#new_his").html("新纪录：" + (correctCount * 10));
	}
	// $("#new_his").html("新纪录：" + (correctCount * 10) + " ！"); // debug

	$("#result").show();
	
	if (correctCount > 0) {
		$("#res_gj").show();
		mv_gj.play();
	} else {
		$("#res_nt").show();
		mv_nt.play();
	}

	// 关闭游戏
	setTimeout(function() {
		mui.back()
	}, 5000);
}

function loadMovie() {
	// 加载欢喜动画
	$("#result").hide();
	$("#res_gj").hide();
	$("#res_nt").hide();
	$("#new_his").hide();
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

	mv_chicuo = new seqframe({
		container: document.getElementById('chicuo'),
		urlRoot: 'movie/chicuo/',
		imgType: 'png',
		frameNumber: 4,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_chicuo.load();

	mv_chidui = new seqframe({
		container: document.getElementById('chidui'),
		urlRoot: 'movie/chidui/',
		imgType: 'png',
		frameNumber: 3,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_chidui.load();
}

function leftsec(sec) {
	var leftm = Math.floor(sec / 60 % 60); //计算分钟数
	var lefts = Math.floor(sec % 60); //计算秒数

	leftm = leftm < 10 ? "0" + leftm : leftm;
	lefts = lefts < 10 ? "0" + lefts : lefts;
	return leftm + ":" + lefts; //返回倒计时的字符串
}
