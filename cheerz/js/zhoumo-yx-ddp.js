var curBlock; // 数组{当前显示位置的_index，是否动画中，配对成功，单词编号，图卡或单词，已翻牌}
var level; // 第几关
var count15;
var correctCount;
var worddatas;
var wordcount; // 单词数
var showPos; // 当前出题点位 1开始
var curChoice; // 存放当前两次选择的卡
var glid, gurl;

function startgame() {
	var gamepara = localStorage.getItem("gpara");
	glid = localStorage.getItem("glid");
	gurl = localStorage.getItem("gurl");

	// console.log("魔法对对碰 json string :", gamepara);

	var json = JSON.parse(gamepara);
	if(json) {
		worddatas = json;
		wordcount = worddatas.length;
	}

	level = 1;
	correctCount = 0;
	curChoice = new Array();

	genopt();
	setQues();
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

function genopt() {
	var optw;
	if (level == 1) {
		optw = genwords(2);
		showPos = [2, 3, 6, 7];

	} else if (level == 2) {
		optw = genwords(4);
		showPos = [1, 2, 3, 4, 5, 6, 7, 8];
	}

	var block, kaorw, pos_count;
	pos_count = showPos.length;
	curBlock = new Array(pos_count);
	var gotPos = new Array(pos_count);
	var wordPos = new Array(pos_count);
	var posType = new Array();

	for (var i = 0; i < pos_count; i++) {
		var wordno = optw[parseInt(i / 2)];
		wordPos[i] = wordno;
	}
	wordPos.sort(function() {
		return 0.5 - Math.random();
	})

	for (var i = 0; i < pos_count; i++) {
		var pos;
		while (true) {
			pos = getRandom(0, pos_count - 1);
			if ($.inArray(pos, gotPos) == -1) {
				break;
			}
		}

		var type, str;
		while (true) {
			type = getRandom(1, 2);
			str = wordPos[i] + "-" + type;
			if ($.inArray(str, posType) == -1) {
				posType.push(str)
				break;
			}
		}
		// console.log(str+","+type);

		block = new Object();
		block.pos = showPos[i];
		block.moving = false;
		block.match = false;
		block.type = type; // 1图片 2单词
		block.wordno = wordPos[i];
		block.open = false; // 明牌
		curBlock[i] = block;
	}

	// 显示选项
	for (var i = 0; i < 8; i++) {
		if ($.inArray((i + 1), showPos) == -1) {
			$($("#uc_01").find(".item")[i]).css('visibility', 'hidden');
		} else {
			$($("#uc_01").find(".item")[i]).css('visibility', '');
		}
	}
	// console.log(curBlock);
}

function setQues() {

	var eles = $("#uc_01").find("span");
	for (var i = 0; i < curBlock.length; i++) {
		var block = curBlock[i];
		var wno = block.wordno;
		var wdata = getDataByNo(wno);
		var wpic1 = wdata.wpic1;
		var wpic2 = wdata.wpic2;
		var pos = block.pos;
		var type = block.type;

		if (type == 1) {
			$(eles[pos - 1]).html('<img src=' + wpic1 + '>');
		} else if (type == 2) {
			$(eles[pos - 1]).html('<img src=' + wpic2 + '>');
		}
		// console.log(block);

		playFanpaiBack(pos);
	}
}

function pro_result(index) {
	var pos = index + 1;
	if ($.inArray(pos, showPos) == -1) return;
	// console.log("process click pos " + pos);

	// 动画中
	if (curBlock[getBlockIndex(pos)].moving) {
		// console.log("pos " + pos + " is moving");
		return;
	}

	// 已配对
	if (curBlock[getBlockIndex(pos)].match) {
		// console.log("pos " + pos + " is match");
		return;
	}

	var needback = false; // 是否需要翻回来
	var finish = false;

	if (curChoice.length == 0) {
		curChoice.push(pos);
	} else if (curChoice.length == 1) {
		var pos1 = curChoice[0];
		// 重复翻牌
		if (pos == pos1) {
			// console.log("repeat pos");
			return;
		}

		// 答对
		if (curBlock[getBlockIndex(pos1)].wordno == curBlock[getBlockIndex(pos)].wordno) {
			// console.log("is match");
			curBlock[getBlockIndex(pos1)].match = true;
			curBlock[getBlockIndex(pos)].match = true;
			curChoice.length = 0;


			// 加分
			correctCount++;
			$("#score").html(correctCount * 10);

			// 检测是否全部完成
			finish = true;
			for (var i = 0; i < curBlock.length; i++) {
				if (!curBlock[i].match) finish = false;
			}
		}
		// 答错
		else {
			// console.log("no match");
			curChoice.length = 0;

			// 翻回来
			needback = true;
			setTimeout(function() {
				playFanpaiBack(pos);
			}, 1500);
			setTimeout(function() {
				playFanpaiBack(pos1);
			}, 1500);

			play_wrong();
		}
	}
	playFanpai(pos, needback);

	// 本轮结束
	if (finish) {
		setTimeout(function() {
			level = 2;
			curChoice = new Array();

			genopt();
			setQues();
		}, 1500);
	}
}

function playFanpai(pos, needback) {
	var paitag = "#fanpai_" + pos;
	var tukatag = "#tuka_" + pos;

	if (!$(paitag)[0]) return;

	$(paitag).show();
	$(tukatag).hide();
	var parent = $(tukatag).parent("div");
	$(parent).css("background-image", "url()");

	new seqframe({
		container: ($(paitag)[0]),
		urlRoot: 'movie/fanpai/',
		imgType: 'png',
		frameNumber: 6,
		framePerSecond: 10,
		loadedAutoPlay: true,
		loop: 1,
	}).load();

	// 动画中屏蔽点击
	curBlock[getBlockIndex(pos)].moving = true;

	// 播完显示图卡
	setTimeout(function() {
		$(tukatag).show();
		$(paitag).hide();
		var parent = $(tukatag).parent("div");
		$(parent).css("background-image", "url(images/danci.png)");
		if (!needback) {
			curBlock[getBlockIndex(pos)].moving = false;
		}
	}, 600);
}

function playFanpaiBack(pos) {
	var paitag = "#fanpai_" + pos;
	var tukatag = "#tuka_" + pos;
	if (!$(paitag)[0]) return;

	$(paitag).show();
	$(tukatag).hide();
	var parent = $(tukatag).parent("div");
	$(parent).css("background-image", "url()");

	new seqframe({
		container: ($(paitag)[0]),
		urlRoot: 'movie/fanpai/',
		imgType: 'png',
		frameNumber: 6,
		framePerSecond: 10,
		loadedAutoPlayReverse: true,
		loop: 1,
	}).load_reverse();

	// 动画中屏蔽点击
	curBlock[getBlockIndex(pos)].moving = true;
	setTimeout(function() {
		curBlock[getBlockIndex(pos)].moving = false;
	}, 600);
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
	
	var hisscore = localStorage.getItem("gbscore");
	console.log("lid:" + glid + " record " + gurl + " 历史最高分：" + hisscore + " 本次得分：" + game_score);
	
	// 本次记录
	localStorage.setItem("game_score", game_score);
	
	// 上传本次记录
	setgamescore(glid, gurl, game_score);
	
	// 历史记录
	if (parseInt(hisscore) < game_score) {
		console.log("刷新纪录老" + hisscore + " 新" + game_score);
		localStorage.setItem("gbscore", game_score);
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
