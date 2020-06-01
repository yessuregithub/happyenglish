var curBlock; // 数组{当前显示位置的_index，是否处于翻牌动画中，单词编号，图卡或单词，已翻牌}
var level; // 第几关
var count15;
var correctCount;
var worddatas;
var wordcount; // 单词数
var showPos;

function startgame() {
	var gamepara = localStorage.getItem("gpara");

	// debug 测试5个实际应该有20个 ，根据数量生成
	gamepara =
		'[{"wno":1,"wpic1":"images/br1.png","wpic2":"images/p1.png","sound":"s1.mp3"},{"wno":2,"wpic1":"images/br2.png","wpic2":"images/p2.png","sound":"s2.mp3"},{"wno":3,"wpic1":"images/br3.png","wpic2":"images/p3.png","sound":"s3.mp3"},{"wno":4,"wpic1":"images/br4.png","wpic2":"images/p4.png","sound":"s4.mp3"},{"wno":5,"wpic1":"images/br5.png","wpic2":"images/p5.png","sound":"s5.mp3"}]';
	json = JSON.parse(gamepara);
	worddatas = json;
	wordcount = worddatas.length;

	level = 1;
	correctCount = 0;
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
		showPos = [1, 2, 5, 6];

	} else if (level == 2) {
		optw = genwords(4);
		showPos = [0, 1, 2, 3, 4, 5, 6, 7];
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
		block.posIndex = showPos[i];
		block.moving = false;
		block.type = type; // 1图片 2单词
		block.wordno = wordPos[i];
		block.open = false; // 明牌
		curBlock[i] = block;
	}

	// 显示选项
	for (var i = 0; i < 8; i++) {
		if ($.inArray(i, showPos) == -1) {
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
		var posIndex = block.posIndex;
		var type = block.type;

		if (type == 1) {
			$(eles[posIndex]).html('<img src=' + wpic1 + '>');
		} else if (type == 2) {
			$(eles[posIndex]).html('<img src=' + wpic2 + '>');
		}
		// console.log(block);
	}
}

function pro_result(index) {
	if ($.inArray(index, showPos) == -1) return;
	console.log("process click " + index);
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


function leftsec(sec) {
	var leftm = Math.floor(sec / 60 % 60); //计算分钟数
	var lefts = Math.floor(sec % 60); //计算秒数

	leftm = leftm < 10 ? "0" + leftm : leftm;
	lefts = lefts < 10 ? "0" + lefts : lefts;
	return leftm + ":" + lefts; //返回倒计时的字符串
}
