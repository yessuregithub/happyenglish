var curBlock; // 数组{当前显示位置的_index，是否动画中，配对成功，单词编号，图卡或单词，已翻牌}
var curWord;
var wordMatch;
var level; // 第几关
var count15;
var correctCount;
var worddatas;
var wordcount; // 单词数
var showPos; // 当前出题点位 1开始
var curChoice; // 存放当前两次选择的卡

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	console.log("眼力大考验 json string :", gamepara);

	// debug 测试5个实际应该有20个 ，根据数量生成
	// gamepara ='[{"wno":1,"wpic1":"images/w1.png","wpic2":"images/p1.jpg","sound":"s1.mp3"},{"wno":2,"wpic1":"images/w2.png","wpic2":"images/p2.jpg","sound":"s2.mp3"},{"wno":3,"wpic1":"images/w3.png","wpic2":"images/p3.jpg","sound":"s3.mp3"},{"wno":4,"wpic1":"images/w4.png","wpic2":"images/p4.jpg","sound":"s4.mp3"},{"wno":5,"wpic1":"images/w5.png","wpic2":"images/p5.jpg","sound":"s5.mp3"},{"wno":6,"wpic1":"images/w6.png","wpic2":"images/p6.jpg","sound":"s5.mp3"},{"wno":7,"wpic1":"images/w7.png","wpic2":"images/p7.jpg","sound":"s5.mp3"},{"wno":8,"wpic1":"images/w8.png","wpic2":"images/p8.jpg","sound":"s5.mp3"},{"wno":9,"wpic1":"images/w9.png","wpic2":"images/p9.jpg","sound":"s5.mp3"},{"wno":10,"wpic1":"images/w10.png","wpic2":"images/p10.jpg","sound":"s5.mp3"},{"wno":11,"wpic1":"images/w11.png","wpic2":"images/p11.jpg","sound":"s5.mp3"},{"wno":12,"wpic1":"images/w12.png","wpic2":"images/p12.jpg","sound":"s5.mp3"},{"wno":13,"wpic1":"images/w13.png","wpic2":"images/p13.jpg","sound":"s5.mp3"},{"wno":14,"wpic1":"images/w14.png","wpic2":"images/p14.jpg","sound":"s5.mp3"},{"wno":15,"wpic1":"images/w15.png","wpic2":"images/p15.jpg","sound":"s5.mp3"},{"wno":16,"wpic1":"images/w16.png","wpic2":"images/p16.jpg","sound":"s5.mp3"},{"wno":17,"wpic1":"images/w17.png","wpic2":"images/p17.jpg","sound":"s5.mp3"},{"wno":18,"wpic1":"images/w18.png","wpic2":"images/p18.jpg","sound":"s5.mp3"},{"wno":19,"wpic1":"images/w19.png","wpic2":"images/p19.jpg","sound":"s5.mp3"},{"wno":20,"wpic1":"images/w20.png","wpic2":"images/p20.jpg","sound":"s5.mp3"}]';

	json = JSON.parse(gamepara);
	var wordnos = json.ids.split(",");
	wordcount = wordnos.length;
	worddatas = new Array();

	var prefix, ext;
	for (var i = 0; i < wordcount; i++) {
		var word_data = new Object();

		var wno = wordnos[i];

		prefix = json.wpic1_prefix.split(".")[0];
		ext = json.wpic1_prefix.split(".")[1];
		var wpic1 = prefix + wno + "." + ext;

		prefix = json.wpic2_prefix.split(".")[0];
		ext = json.wpic2_prefix.split(".")[1];
		var wpic2 = prefix + wno + "." + ext;

		prefix = json.sound_prefix.split(".")[0];
		ext = json.sound_prefix.split(".")[1];
		var sound = prefix + wno + "." + ext;

		word_data.wno = wno;
		word_data.wpic1 = wpic1;
		word_data.wpic2 = wpic2;
		word_data.sound = sound;
		worddatas.push(word_data);

		console.log("game word:", wno + " " + wpic1 + " " + wpic2 + " " + sound);
	}

	level = 1;
	correctCount = 0;
	curChoice = new Array();

	genopt();
	setQues();
}

function genopt() {
	var optw;
	var opttk;

	if (level == 1) {
		optw = genwords(1);
		showPos = [8, 9, 10, 11];

	} else if (level == 2) {
		optw = genwords(2);
		showPos = [3, 4, 8, 9, 10, 11, 15, 16];
	} else if (level == 3) {
		optw = genwords(3);
		showPos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
	}
	opttk = new Array();
	for (var i = 0; i < optw.length; i++) {
		opttk.push(optw[i]);
	}
	genwords2(showPos.length, opttk);
	opttk.sort(function() { // 乱序
		return 0.5 - Math.random();
	})

	console.log("target word:" + optw);
	console.log("option tuka:" + opttk);

	curWord = optw;
	curBlock = new Array(opttk.length);
	for (var i = 0; i < opttk.length; i++) {
		block = new Object();
		block.pos = showPos[i];
		block.match = false;
		block.wordno = opttk[i];
		curBlock[i] = block;
	}



	// 显示选项
	for (var i = 0; i < 18; i++) {
		if ($.inArray((i + 1), showPos) == -1) {
			$($("#uc_01").find(".item")[i]).css('visibility', 'hidden');
		} else {
			$($("#uc_01").find(".item")[i]).css('visibility', '');
		}
	}

	// 显示目标单词
	wordMatch = new Array();

	var _html = '';
	for (var i = 0; i < curWord.length; i++) {
		// 匹配
		wordMatch.push(false);

		var wpic1 = getDataByNo(curWord[i]).wpic1;
		_html += '<li><span><img src=' + wpic1 + '></span></li>';
	}
	$("#target-word").html(_html);


	// 去除对
	$("#uc_01").find(".dui").remove();
	$("#target-word").find(".selected").remove();
}

function setQues() {
	var eles = $("#uc_01").find(".img-box");
	for (var i = 0; i < curBlock.length; i++) {
		var block = curBlock[i];
		var wno = block.wordno;
		var wdata = getDataByNo(wno);
		var wpic1 = wdata.wpic1;
		var wpic2 = wdata.wpic2;
		var pos = block.pos;

		$(eles[pos - 1]).html('<img src=' + wpic2 + '>');
		// console.log(block);
	}
}

function pro_result(index) {
	var pos = index + 1;
	if ($.inArray(pos, showPos) == -1) return;

	// 已配对
	if (curBlock[getBlockIndex(pos)].match) {
		console.log("pos " + pos + " is match");
		return;
	}

	// 答对
	var finish;
	var wordno = curBlock[getBlockIndex(pos)].wordno;
	if ($.inArray(wordno, curWord) != -1) {
		console.log(pos + " match success");
		curBlock[getBlockIndex(pos)].match = true;

		// 图卡
		$($("#uc_01").find(".item")[pos - 1]).append('<div class="dui">');

		// 目标单词
		var windex = getWordIndex(wordno);
		$($("#target-word").find("li")[windex]).addClass('selected');
		wordMatch[windex] = true;

		correctCount++;
		$("#score").html(correctCount * 10);

		// 检测是否全部完成
		finish = true;
		for (var i = 0; i < wordMatch.length; i++) {
			if (!wordMatch[i]) finish = false;
		}
	}
	// 答错
	else {
		play_wrong();
	}

	// 本轮结束
	if (finish) {
		if (level < 3) {
			level++;
			disable_choose();
		}
		setTimeout(function() {
			curChoice = new Array();
			genopt();
			setQues();
			enable_choose();
		}, 1500);
	}
}

function genwords(count) {
	var optw = new Array();

	while (true) {
		newno = getRandom(1, wordcount);
		if ($.inArray(newno, optw) == -1) {
			optw.push(newno);
		}
		if (optw.length == count) break;
	}
	return optw;
}

// 添加剩余单词
function genwords2(count, optw) {

	while (true) {
		newno = getRandom(1, wordcount);
		if ($.inArray(newno, optw) == -1) {
			optw.push(newno);
		}
		if (optw.length == count) break;
	}
	return optw;
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

function getBlockIndex(pos) {
	if (!curBlock) return -1;
	for (var i = 0; i < curBlock.length; i++) {
		if (curBlock[i].pos == pos) {
			return i;
		}
	}
}

function getWordIndex(wno) {
	if (!curWord) return -1;
	for (var i = 0; i < curWord.length; i++) {
		if (curWord[i] == wno) {
			return i;
		}
	}
}

function leftsec(sec) {
	var leftm = Math.floor(sec / 60 % 60); //计算分钟数
	var lefts = Math.floor(sec % 60); //计算秒数

	leftm = leftm < 10 ? "0" + leftm : leftm;
	lefts = lefts < 10 ? "0" + lefts : lefts;
	return leftm + ":" + lefts; //返回倒计时的字符串
}

function endgame() {
	disable_choose();
	clearInterval(count15);

	// 每周记录一周新纪录
	var game_score = correctCount * 10;
	var week = getCurrWeek();
	var his_key = "score_ylky" + "_" + week;
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

	close_game();

	// 关闭游戏
	jump_setback("zhoumo-yx-end.html");
	console.log("关闭游戏");
	// jump 返回时无法重新加载
	// jump("record", "zhoumo-yx-end.html");
}
