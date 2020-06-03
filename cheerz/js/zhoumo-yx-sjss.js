var count15;
var xinCount;
var correctCount;
var worddatas;
var wordcount; // 单词数
var options; // 3选项数据
var rightno; // 本轮正确单词编号
var mv_jiandui;
var mv_jiancuo;
var mv_jian;

function startgame() {
	var gamepara = localStorage.getItem("gpara");

	// debug 测试5个实际应该有20个 ，根据数量生成
	gamepara =
		'[{"wno":1,"wpic1":"images/w1.png","wpic2":"images/p1.jpg","sound":"s1.mp3"},{"wno":2,"wpic1":"images/w2.png","wpic2":"images/p2.jpg","sound":"s2.mp3"},{"wno":3,"wpic1":"images/w3.png","wpic2":"images/p3.jpg","sound":"s3.mp3"},{"wno":4,"wpic1":"images/w4.png","wpic2":"images/p4.jpg","sound":"s4.mp3"},{"wno":5,"wpic1":"images/w5.png","wpic2":"images/p5.jpg","sound":"s5.mp3"}]';
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
	var wpic1 = rightdata.wpic1;
	console.log(wpic1);
	$("#word-img").attr("src", wpic1)

	// 帖选项
	var eles = $("#uc_01").find(".img-box");
	for (var i = 0; i < eles.length; i++) {
		$(eles[i]).html('<img src=' + opts[i].wpic2 + '>');
	}

	$("#uc_01").find("li").removeClass("disabled");
	eles = $("#uc_01").find(".hsbg");
	for (var i = 0; i < eles.length; i++) {
		$(eles[i]).hide();
	}
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

function pro_result(click_index) {
	var correct = false;
	if (options[click_index].wno == rightno) correct = true;
	console.log("click:" + click_index + "," + correct);

	if (correct) {
		if ($("#uc_01").find(".hsbg")[click_index]) {
			$($("#uc_01").find(".hsbg")[click_index]).show();
			var jian = $("#uc_01").find(".jian")[click_index];
			mv_jian.resetContainer(jian);
			mv_jian.play();
		}
	}

	disable_choose();

	$("#xiong").hide();
	$("#xiong-dong").show();

	if (correct) {
		mv_jiandui.resetContainer($("#xiong-dong")[0]);
		mv_jiandui.play();
	} else {
		mv_jiancuo.resetContainer($("#xiong-dong")[0]);
		mv_jiancuo.play();
	}

	// 新题
	setTimeout(function() {
		// 清除选中状态
		enable_choose();
		rmselected();

		$("#xiong-dong").hide();
		$("#xiong").show();
		$(".hsbg").hide();

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

function endgame() {
	disable_choose();
	clearInterval(count15);

	// 每周记录一周新纪录
	var game_score = correctCount * 10;
	var week = getCurrWeek();
	var his_key = "score_jian" + "_" + week;
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
	mv_jiancuo = new seqframe({
		container: null,
		urlRoot: 'movie/jiancuo/',
		imgType: 'png',
		frameNumber: 6,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_jiancuo.load();

	mv_jiandui = new seqframe({
		container: null,
		urlRoot: 'movie/jiandui/',
		imgType: 'png',
		frameNumber: 6,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_jiandui.load();

	mv_jian = new seqframe({
		container: null,
		urlRoot: 'movie/jian/',
		imgType: 'png',
		frameNumber: 6,
		framePerSecond: 10,
		loadedAutoPlay: false,
		loop: 1,
	});
	mv_jian.load();
}

function leftsec(sec) {
	var leftm = Math.floor(sec / 60 % 60); //计算分钟数
	var lefts = Math.floor(sec % 60); //计算秒数

	leftm = leftm < 10 ? "0" + leftm : leftm;
	lefts = lefts < 10 ? "0" + lefts : lefts;
	return leftm + ":" + lefts; //返回倒计时的字符串
}
