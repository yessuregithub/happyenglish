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
//	gamepara =
//		'[{"wno":1,"wpic1":"images/w1.png","wpic2":"images/p1.jpg","sound":"s1.mp3"},{"wno":2,"wpic1":"images/w2.png","wpic2":"images/p2.jpg","sound":"s2.mp3"},{"wno":3,"wpic1":"images/w3.png","wpic2":"images/p3.jpg","sound":"s3.mp3"},{"wno":4,"wpic1":"images/w4.png","wpic2":"images/p4.jpg","sound":"s4.mp3"},{"wno":5,"wpic1":"images/w5.png","wpic2":"images/p5.jpg","sound":"s5.mp3"}]';
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
				licount--;
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
				endgame();
			}
		}

	}, 1200);
}

function endgame() {
	disable_choose();
	clearInterval(count15);

	// 每周记录一周新纪录
	var game_score = correctCount * 10;
	var week = getCurrWeek();
	var his_key = "score_chi" + "_" + week;
	var hisscore = localStorage.getItem(his_key);
	console.log("record " + his_key + " 历史最高分：" + hisscore + " 本次得分：" + game_score);
	localStorage.setItem("game_record", his_key); // 记录本次跳转类型
	
	// 本次记录
	localStorage.setItem("game_score", game_score);
	// 历史记录
	if (hisscore == null || hisscore == "" || typeof(hisscore) == undefined) {
		localStorage.setItem(his_key, game_score);
		localStorage.setItem("new_record", 1);
	} else if (parseInt(hisscore) < game_score) {
		console.log("刷新纪录老" + hisscore + " 新" + game_score);
		localStorage.setItem(his_key, game_score);
		localStorage.setItem("new_record", 1);
	} else {
		localStorage.setItem("new_record", 0);
	}



	// 关闭游戏
	jump_setback("zhoumo-yx-end.html");
	console.log("关闭游戏");
	// jump 返回时无法重新加载
	// jump("record", "zhoumo-yx-end.html");
}

function loadMovie() {
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

function getCurrWeek() {
	var d1 = new Date();
	var d2 = new Date();
	d2.setMonth(0);
	d2.setDate(1);
	var rq = d1 - d2;
	var s1 = Math.ceil(rq / (24 * 60 * 60 * 1000));
	var s2 = Math.ceil(s1 / 7);
	console.log("今天是本年第" + s1 + "天，第" + s2 + "周");

	return s2;
}

function leftsec(sec) {
	var leftm = Math.floor(sec / 60 % 60); //计算分钟数
	var lefts = Math.floor(sec % 60); //计算秒数

	leftm = leftm < 10 ? "0" + leftm : leftm;
	lefts = lefts < 10 ? "0" + lefts : lefts;
	return leftm + ":" + lefts; //返回倒计时的字符串
}
